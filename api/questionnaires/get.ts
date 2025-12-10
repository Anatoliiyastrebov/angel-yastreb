import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getSupabaseClient } from '../../lib/supabase-server';
import { verifySessionToken } from '../auth/verify-otp';

// Encryption key - MUST be set in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken } = req.query;

    if (!sessionToken || typeof sessionToken !== 'string') {
      return res.status(401).json({ error: 'Session token required' });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const supabase = getSupabaseClient();

    // Find all questionnaires for this contact
    const { data: questionnaireRows, error } = await supabase
      .from('questionnaires')
      .select('encrypted_data')
      .eq('contact_identifier', session.contact)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching questionnaires:', error);
      return res.status(500).json({ error: 'Failed to fetch questionnaires' });
    }

    const questionnaires: any[] = [];
    for (const row of questionnaireRows || []) {
      try {
        const decrypted = decrypt(row.encrypted_data);
        questionnaires.push(JSON.parse(decrypted));
      } catch (err) {
        console.error('Error decrypting questionnaire:', err);
      }
    }

    return res.status(200).json({
      success: true,
      questionnaires,
    });
  } catch (error: any) {
    console.error('Error getting questionnaires:', error);
    
    // Handle Supabase configuration errors
    if (error?.message?.includes('Supabase URL and Service Role Key')) {
      return res.status(500).json({ error: 'Server configuration error. Please check environment variables.' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
