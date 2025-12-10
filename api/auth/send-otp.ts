import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegram, phone } = req.body;

    if (!telegram && !phone) {
      return res.status(400).json({ error: 'Telegram or phone is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const contactIdentifier = telegram ? telegram.trim().replace(/^@/, '').toLowerCase() : phone?.trim().replace(/[\s\-\(\)]/g, '') || '';
    const contactType = telegram ? 'telegram' : 'phone';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean expired OTPs first
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (supabaseError: any) {
      console.error('Supabase configuration error:', supabaseError);
      return res.status(500).json({ error: 'Server configuration error. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' });
    }
    
    await supabase.rpc('clean_expired_otp');

    // Delete any existing OTP for this contact
    await supabase
      .from('otp_codes')
      .delete()
      .eq('contact_identifier', contactIdentifier);

    // Store OTP in Supabase
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        contact_identifier: contactIdentifier,
        contact_type: contactType,
        code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      // Log error server-side only, don't expose details to client
      console.error('Error storing OTP:', insertError);
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

    // Send OTP via Telegram Bot API
    if (contactType === 'telegram' && telegram) {
      const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
      
      if (BOT_TOKEN) {
        try {
          // Remove @ if present and normalize username
          const telegramUsername = telegram.trim().replace(/^@/, '').toLowerCase();
          
          // Try to find chat_id from database (saved via webhook when user messages bot)
          let chatId: string | null = null;
          
          try {
            const { data: chatIdData, error: chatIdError } = await supabase
              .from('telegram_chat_ids')
              .select('chat_id')
              .eq('contact_identifier', telegramUsername)
              .single();
            
            if (!chatIdError && chatIdData) {
              chatId = chatIdData.chat_id;
            }
          } catch (dbError) {
            console.warn('Could not fetch chat_id from database:', dbError);
          }
          
          // Fallback: Try to get chat_id from bot's recent updates
          // This is a backup method if webhook hasn't saved it yet
          if (!chatId) {
            try {
              const updatesResponse = await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`,
                {
                  method: 'GET',
                }
              );
              const updatesData = await updatesResponse.json();
              
              if (updatesData.ok && updatesData.result && Array.isArray(updatesData.result)) {
                // Search for user in recent updates (check last 100 messages)
                for (const update of updatesData.result) {
                  const message = update.message || update.edited_message;
                  if (message?.from?.username?.toLowerCase() === telegramUsername) {
                    chatId = message.chat.id.toString();
                    
                    // Save to database for future use
                    try {
                      await supabase
                        .from('telegram_chat_ids')
                        .upsert({
                          contact_identifier: telegramUsername,
                          chat_id: chatId,
                          username: message.from.username,
                          first_name: message.from.first_name || null,
                          last_name: message.from.last_name || null,
                        }, {
                          onConflict: 'contact_identifier',
                        });
                    } catch (saveError) {
                      console.warn('Could not save chat_id to database:', saveError);
                    }
                    
                    break;
                  }
                }
              }
            } catch (updatesError) {
              console.warn('Could not fetch bot updates to find chat_id:', updatesError);
            }
          }
          
          // If we found chat_id, send message
          if (chatId) {
            const telegramResponse = await fetch(
              `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `🔐 Ваш код подтверждения: *${otp}*\n\n⏰ Код действителен 10 минут.\n\n---\n\n🔐 Your verification code: *${otp}*\n\n⏰ Code is valid for 10 minutes.\n\n---\n\n🔐 Ihr Bestätigungscode: *${otp}*\n\n⏰ Code ist 10 Minuten gültig.`,
                  parse_mode: 'Markdown',
                }),
              }
            );

            const telegramData = await telegramResponse.json();
            
            if (!telegramData.ok) {
              console.error('Telegram API error when sending OTP:', telegramData);
            } else {
              console.log(`OTP sent successfully to chat_id: ${chatId}`);
            }
          } else {
            // No chat_id found - user needs to start conversation with bot first
            console.warn(`Could not find chat_id for @${telegramUsername}. User needs to start conversation with bot first.`);
            // OTP is still stored in database, user can contact admin if needed
          }
        } catch (telegramError) {
          // Log but don't fail - OTP is stored and can be retrieved manually if needed
          console.error('Error sending OTP via Telegram:', telegramError);
        }
      } else {
        console.warn('VITE_TELEGRAM_BOT_TOKEN not set - OTP not sent via Telegram');
      }
    }
    
    // For phone numbers, SMS sending would require integration with Twilio, AWS SNS, etc.
    // For now, phone OTP codes are stored in database but not sent automatically
    if (contactType === 'phone') {
      console.log(`OTP for phone ${contactIdentifier}: ${otp} (SMS sending not implemented - requires Twilio/AWS SNS integration)`);
    }
    
    // Determine if OTP was actually sent
    let otpSent = false;
    if (contactType === 'telegram') {
      // Check if we attempted to send (BOT_TOKEN exists)
      const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
      otpSent = !!BOT_TOKEN; // We tried to send if token exists (actual success is logged separately)
    }
    
    // Determine if OTP was actually sent
    const otpSent = contactType === 'telegram' && chatId !== null;
    
    return res.status(200).json({
      success: true,
      message: contactType === 'telegram' 
        ? (otpSent 
          ? 'OTP sent successfully. Please check your Telegram messages.'
          : 'OTP generated successfully. To receive the code, please find the bot in Telegram and send it /start (or any message), then try requesting the code again.')
        : 'OTP generated successfully. SMS sending is not yet implemented.',
    });
  } catch (error: any) {
    // Log error server-side only, don't expose details to client
    console.error('Error sending OTP:', error);
    
    // Handle Supabase configuration errors
    if (error?.message?.includes('Supabase URL and Service Role Key')) {
      return res.status(500).json({ error: 'Server configuration error. Please check environment variables.' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
