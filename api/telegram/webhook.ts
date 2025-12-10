import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../../lib/supabase-server.js';

// Telegram webhook to receive updates from bot
// This allows us to automatically save user chat_ids when they message the bot
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;

    // Verify webhook secret if needed (optional security measure)
    // const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    // if (webhookSecret && req.headers['x-telegram-bot-api-secret-token'] !== webhookSecret) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Handle message updates
    const message = update.message || update.edited_message;
    if (message && message.from) {
      const chatId = message.chat.id.toString();
      const userId = message.from.id.toString();
      const username = message.from.username?.toLowerCase() || null;
      const firstName = message.from.first_name || null;
      const lastName = message.from.last_name || null;

      // Only process if we have a username (needed for matching with questionnaires)
      if (username) {
        let supabase;
        try {
          supabase = getSupabaseClient();
        } catch (supabaseError: any) {
          console.error('Supabase configuration error in webhook:', supabaseError);
          return res.status(200).json({ ok: true }); // Return 200 to prevent Telegram retries
        }

        // Save or update chat_id for this user
        const { error } = await supabase
          .from('telegram_chat_ids')
          .upsert({
            contact_identifier: username,
            chat_id: chatId,
            username: message.from.username, // Keep original case
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'contact_identifier',
          });

        if (error) {
          console.error('Error saving telegram chat_id:', error);
        } else {
          console.log(`Saved chat_id ${chatId} for user @${username}`);
        }
      }
    }

    // Always return 200 OK to Telegram (even if we couldn't process)
    // This prevents Telegram from retrying
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Error processing Telegram webhook:', error);
    
    // Still return 200 to prevent Telegram retries
    return res.status(200).json({ ok: true });
  }
}
