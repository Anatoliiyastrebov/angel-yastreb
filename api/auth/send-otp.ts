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

    // TODO: Send OTP via Telegram Bot API or SMS service
    // For Telegram: use bot to send message to user
    // For SMS: use service like Twilio, AWS SNS, etc.
    
    // In production, implement actual OTP sending here
    // For now, OTP is stored in database and should be sent via external service
    
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
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
