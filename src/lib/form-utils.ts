import { QuestionnaireSection, QuestionnaireType } from './questionnaire-data';
import { Language, translations } from './translations';

export interface FormData {
  [key: string]: string | string[];
}

export interface FormAdditionalData {
  [key: string]: string;
}

export interface ContactData {
  method: 'telegram' | 'instagram';
  username: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Storage keys
const getStorageKey = (type: QuestionnaireType, lang: Language) => 
  `health_questionnaire_${type}_${lang}`;

// Save form data to localStorage
export const saveFormData = (
  type: QuestionnaireType,
  lang: Language,
  formData: FormData,
  additionalData: FormAdditionalData,
  contactData: ContactData
) => {
  try {
    const data = { formData, additionalData, contactData, timestamp: Date.now() };
    localStorage.setItem(getStorageKey(type, lang), JSON.stringify(data));
  } catch (err) {
    console.error('Error saving form data:', err);
  }
};

// Load form data from localStorage
export const loadFormData = (type: QuestionnaireType, lang: Language) => {
  try {
    const stored = localStorage.getItem(getStorageKey(type, lang));
    if (stored) {
      const data = JSON.parse(stored);
      // Only return if data is less than 24 hours old
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return {
          formData: data.formData as FormData,
          additionalData: data.additionalData as FormAdditionalData,
          contactData: data.contactData as ContactData,
        };
      }
    }
  } catch (err) {
    console.error('Error loading form data:', err);
  }
  return null;
};

// Clear form data from localStorage
export const clearFormData = (type: QuestionnaireType, lang: Language) => {
  try {
    localStorage.removeItem(getStorageKey(type, lang));
  } catch (err) {
    console.error('Error clearing form data:', err);
  }
};

// Validate form
export const validateForm = (
  sections: QuestionnaireSection[],
  formData: FormData,
  contactData: ContactData,
  lang: Language
): FormErrors => {
  const errors: FormErrors = {};
  const t = translations[lang];

  sections.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.required) {
        const value = formData[question.id];
        
        if (question.type === 'checkbox') {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            errors[question.id] = t.selectAtLeastOne;
          }
        } else if (question.type === 'number') {
          if (!value || value === '' || isNaN(Number(value))) {
            errors[question.id] = t.required;
          }
        } else {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[question.id] = t.required;
          }
        }
      }
    });
  });

  // Validate contact
  if (!contactData.username || contactData.username.trim() === '') {
    errors['contact_username'] = t.required;
  }

  return errors;
};

// Generate Markdown
export const generateMarkdown = (
  type: QuestionnaireType,
  sections: QuestionnaireSection[],
  formData: FormData,
  additionalData: FormAdditionalData,
  contactData: ContactData,
  lang: Language
): string => {
  const t = translations[lang];
  const headers = {
    infant: t.mdInfant,
    child: t.mdChild,
    woman: t.mdWoman,
    man: t.mdMan,
  };

  let md = `${headers[type]}\n${'—'.repeat(20)}\n\n`;

  sections.forEach((section) => {
    section.questions.forEach((question) => {
      const value = formData[question.id];
      const additional = additionalData[`${question.id}_additional`];

      if (value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '')) {
        const label = question.label[lang];
        
        if (Array.isArray(value)) {
          const optionLabels = value.map((v) => {
            const opt = question.options?.find((o) => o.value === v);
            return opt ? opt.label[lang] : v;
          });
          md += `**${label}:**\n`;
          optionLabels.forEach((ol) => {
            md += `- ${ol}\n`;
          });
        } else if (question.options) {
          const opt = question.options.find((o) => o.value === value);
          md += `**${label}:** ${opt ? opt.label[lang] : value}\n`;
        } else {
          md += `**${label}:** ${value}\n`;
        }

        if (additional && additional.trim() !== '') {
          md += `  _${t.additionalInfo}:_ ${additional}\n`;
        }

        md += '\n';
      }
    });
  });

  // Contact section
  const cleanUsername = contactData.username.replace(/^@/, '').trim();
  const link = contactData.method === 'telegram'
    ? `https://t.me/${cleanUsername}`
    : `https://instagram.com/${cleanUsername}`;

  md += `${t.mdContacts}: @${cleanUsername}\n`;
  md += `${link}\n`;

  return md;
};

// Send to Telegram
// SECURITY NOTE: In production, use environment variables or a server-side proxy
// Do not expose BOT_TOKEN in client-side code in production!
// For development: Set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env file
export const sendToTelegram = async (markdown: string): Promise<boolean> => {
  // Try to get from environment variables first (for Vite: VITE_ prefix)
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '<TELEGRAM_BOT_TOKEN>';
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '<TELEGRAM_CHAT_ID>';

  // Validate that tokens are set
  if (BOT_TOKEN === '<TELEGRAM_BOT_TOKEN>' || CHAT_ID === '<TELEGRAM_CHAT_ID>') {
    console.error('Telegram Bot Token or Chat ID not configured. Please set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID environment variables.');
    return false;
  }

  // Log payload for debugging (remove in production)
  console.log('Sending to Telegram...', { chatId: CHAT_ID, textLength: markdown.length });

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: markdown,
          parse_mode: 'Markdown',
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', responseData);
      throw new Error(`Telegram API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    console.log('Successfully sent to Telegram');
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
};
