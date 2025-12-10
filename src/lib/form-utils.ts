import { QuestionnaireSection, QuestionnaireType } from './questionnaire-data';
import { Language, translations } from './translations';
import { countryCodes } from './country-codes';

export interface FormData {
  [key: string]: string | string[];
}

export interface FormAdditionalData {
  [key: string]: string;
}

export interface ContactData {
  telegram?: string;
  phone?: string;
  phoneCountryCode?: string; // Country code (e.g., 'DE', 'RU')
  email?: string; // Kept for backward compatibility with saved data
}

export interface SubmittedQuestionnaire {
  id: string;
  type: QuestionnaireType;
  formData: FormData;
  additionalData: FormAdditionalData;
  contactData: ContactData;
  markdown: string;
  telegramMessageId?: number;
  submittedAt: number;
  language: Language;
}

export interface FormErrors {
  [key: string]: string;
}

// Storage keys
const getStorageKey = (type: QuestionnaireType, lang: Language) => 
  `health_questionnaire_${type}_${lang}`;

// Save form data to localStorage (optimized with error handling)
export const saveFormData = (
  type: QuestionnaireType,
  lang: Language,
  formData: FormData,
  additionalData: FormAdditionalData,
  contactData: ContactData
) => {
  try {
    const data = { formData, additionalData, contactData, timestamp: Date.now() };
    const key = getStorageKey(type, lang);
    const serialized = JSON.stringify(data);
    // Check localStorage quota before saving
    if (serialized.length > 5 * 1024 * 1024) { // 5MB limit
      console.warn('Form data too large to save');
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (err) {
    // Handle quota exceeded or other errors silently
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, clearing old data');
      try {
        // Clear old data and retry
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('anketa_') && key !== getStorageKey(type, lang)) {
            localStorage.removeItem(key);
          }
        });
        const data = { formData, additionalData, contactData, timestamp: Date.now() };
        localStorage.setItem(getStorageKey(type, lang), JSON.stringify(data));
      } catch (retryErr) {
        console.error('Error saving form data after cleanup:', retryErr);
      }
    } else {
      console.error('Error saving form data:', err);
    }
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
  lang: Language,
  additionalData?: FormAdditionalData
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
          } else {
            const numValue = Number(value);
            // Special validation for age_months - must be integer
            if (question.id === 'age_months' && !Number.isInteger(numValue)) {
              const intErrorMsg = lang === 'ru'
                ? 'Возраст в месяцах должен быть целым числом'
                : lang === 'de'
                ? 'Das Alter in Monaten muss eine ganze Zahl sein'
                : 'Age in months must be an integer';
              errors[question.id] = intErrorMsg;
            }
            if (question.min !== undefined && numValue < question.min) {
              const minMsg = lang === 'ru' ? `Минимальное значение: ${question.min}` : lang === 'en' ? `Minimum value: ${question.min}` : `Mindestwert: ${question.min}`;
              errors[question.id] = minMsg;
            }
            if (question.max !== undefined && numValue > question.max) {
              const maxMsg = lang === 'ru' ? `Максимальное значение: ${question.max}` : lang === 'en' ? `Maximum value: ${question.max}` : `Maximalwert: ${question.max}`;
              errors[question.id] = maxMsg;
            }
          }
        } else {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[question.id] = t.required;
          }
        }
      }
    });
  });

  // Special validation: if operations is "yes", additional field is required
  if (formData['operations'] === 'yes' && additionalData) {
    const operationsAdditional = additionalData['operations_additional'];
    if (!operationsAdditional || operationsAdditional.trim() === '') {
      errors['operations_additional'] = t.required;
    }
  }

  // Special validation: if pregnancy_problems is "yes", additional field is required
  if (formData['pregnancy_problems'] === 'yes' && additionalData) {
    const pregnancyProblemsAdditional = additionalData['pregnancy_problems_additional'];
    if (!pregnancyProblemsAdditional || pregnancyProblemsAdditional.trim() === '') {
      errors['pregnancy_problems_additional'] = t.required;
    }
  }

  // Special validation: if injuries has any option selected except "no_issues", additional field is required
  if (formData['injuries'] && additionalData) {
    const injuriesValue = formData['injuries'];
    const injuriesArray = Array.isArray(injuriesValue) ? injuriesValue : [injuriesValue];
    // Check if any option other than "no_issues" is selected
    const hasOtherThanNoIssues = injuriesArray.some((val: string) => val !== 'no_issues');
    if (hasOtherThanNoIssues) {
      const injuriesAdditional = additionalData['injuries_additional'];
      if (!injuriesAdditional || injuriesAdditional.trim() === '') {
        errors['injuries_additional'] = t.required;
      }
    }
  }

  // Special validation: if allergies has "other" selected, additional field is required
  if (formData['allergies'] && additionalData) {
    const allergiesValue = formData['allergies'];
    const allergiesArray = Array.isArray(allergiesValue) ? allergiesValue : [allergiesValue];
    const hasOther = allergiesArray.includes('other');
    if (hasOther) {
      const allergiesAdditional = additionalData['allergies_additional'];
      if (!allergiesAdditional || allergiesAdditional.trim() === '') {
        errors['allergies_additional'] = t.required;
      }
    }
  }

  // Special validation: if skin_condition has "other" selected, additional field is required
  if (formData['skin_condition'] && additionalData) {
    const skinConditionValue = formData['skin_condition'];
    const skinConditionArray = Array.isArray(skinConditionValue) ? skinConditionValue : [skinConditionValue];
    const hasOther = skinConditionArray.includes('other');
    if (hasOther) {
      const skinConditionAdditional = additionalData['skin_condition_additional'];
      if (!skinConditionAdditional || skinConditionAdditional.trim() === '') {
        errors['skin_condition_additional'] = t.required;
      }
    }
  }

  // Special validation: if sleep has "other" selected, additional field is required
  if (formData['sleep'] && additionalData) {
    const sleepValue = Array.isArray(formData['sleep']) ? formData['sleep'][0] : formData['sleep'];
    const hasOther = sleepValue === 'other';
    if (hasOther) {
      const sleepAdditional = additionalData['sleep_additional'];
      if (!sleepAdditional || sleepAdditional.trim() === '') {
        errors['sleep_additional'] = t.required;
      }
    }
  }

  // Special validation: if operations has "yes" selected, additional field is required
  if (formData['operations'] && additionalData) {
    const operationsValue = Array.isArray(formData['operations']) ? formData['operations'][0] : formData['operations'];
    const hasYes = operationsValue === 'yes';
    if (hasYes) {
      const operationsAdditional = additionalData['operations_additional'];
      if (!operationsAdditional || operationsAdditional.trim() === '') {
        errors['operations_additional'] = t.required;
      }
    }
  }


  // Validate Telegram username if provided
  if (contactData.telegram && contactData.telegram.trim() !== '') {
    const telegramValue = contactData.telegram.trim();
    const cleanTelegram = telegramValue.replace(/^@/, '');
    
    // Telegram username validation: 5-32 characters, alphanumeric and underscores only, cannot start with a number
    const telegramRegex = /^[a-zA-Z_][a-zA-Z0-9_]{4,31}$/;
    if (!telegramRegex.test(cleanTelegram)) {
      const telegramErrorMsg = lang === 'ru'
        ? 'Некорректный Telegram username. Должен содержать 5-32 символа (буквы, цифры, подчеркивания), не может начинаться с цифры'
        : lang === 'de'
        ? 'Ungültiger Telegram-Benutzername. Muss 5-32 Zeichen enthalten (Buchstaben, Zahlen, Unterstriche), darf nicht mit einer Zahl beginnen'
        : 'Invalid Telegram username. Must contain 5-32 characters (letters, numbers, underscores), cannot start with a number';
      errors['telegram'] = telegramErrorMsg;
    }
  }

  // Validate phone number if provided
  if (contactData.phone && contactData.phone.trim() !== '') {
    const phoneValue = contactData.phone.trim();
    // Remove common phone formatting characters for validation
    const cleanPhone = phoneValue.replace(/[\s\-\(\)]/g, '');
    
    // Phone validation: should contain only digits (country code is added separately)
    const phoneRegex = /^\d{6,14}$/; // 6-14 digits for local number (country code added separately)
    if (!phoneRegex.test(cleanPhone)) {
      const phoneErrorMsg = lang === 'ru'
        ? 'Некорректный номер телефона. Должен содержать 6-14 цифр'
        : lang === 'de'
        ? 'Ungültige Telefonnummer. Muss 6-14 Ziffern enthalten'
        : 'Invalid phone number. Must contain 6-14 digits';
      errors['phone'] = phoneErrorMsg;
    }
  }

  // At least one contact method (telegram or phone) must be provided
  const hasTelegram = contactData.telegram && contactData.telegram.trim() !== '';
  const hasPhone = contactData.phone && contactData.phone.trim() !== '';
  
  if (!hasTelegram && !hasPhone) {
    const contactRequiredMsg = lang === 'ru' 
      ? 'Укажите хотя бы один способ связи (Telegram или телефон)' 
      : lang === 'de' 
      ? 'Geben Sie mindestens eine Kontaktmethode an (Telegram oder Telefon)'
      : 'Please provide at least one contact method (Telegram or phone)';
    errors['contact_method'] = contactRequiredMsg;
  }

  // Special validation: if what_else_question is "yes", what_else field is required
  if (formData['what_else_question'] === 'yes') {
    if (!formData['what_else'] || (typeof formData['what_else'] === 'string' && formData['what_else'].trim() === '')) {
      const whatElseMsg = lang === 'ru' 
        ? 'Пожалуйста, опишите подробнее' 
        : lang === 'de' 
        ? 'Bitte beschreiben Sie ausführlicher'
        : 'Please describe in detail';
      errors['what_else'] = whatElseMsg;
    }
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

  let md = `**${headers[type]}**\n`;

  let questionNumber = 1;
  let digestionQuestionPassed = false;
  let isFirstSection = true;

  sections.forEach((section) => {
    // Skip empty sections
    const hasAnswers = section.questions.some((question) => {
      const value = formData[question.id];
      return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '');
    });

    if (!hasAnswers) return;

    // Section header (compact)
    if (!isFirstSection) {
      md += `\n`;
    }
    md += `**${section.title[lang]}**\n`;
    isFirstSection = false;

    // Create option maps for faster lookup (optimization)
    const optionMaps = new Map<string, Map<string, string>>();
    
    section.questions.forEach((question) => {
      const value = formData[question.id];
      const additional = additionalData[`${question.id}_additional`];

      // Skip what_else field - it will be added to what_else_question answer
      if (question.id === 'what_else') {
        return;
      }

      // Optimized value check
      if (!value) return;
      const hasValue = Array.isArray(value) 
        ? value.length > 0 
        : typeof value === 'string' && value.trim() !== '';
      if (!hasValue) return;

      const label = question.label[lang];
      
      // Question number and label - start numbering from "digestion" question
      let questionPrefix = '';
      if (question.id === 'digestion') {
        digestionQuestionPassed = true;
        questionPrefix = `${questionNumber}. `;
        questionNumber++;
      } else if (digestionQuestionPassed) {
        questionPrefix = `${questionNumber}. `;
        questionNumber++;
      }
      
      // Format answer (optimized with option map caching)
      let answerText = '';
      if (Array.isArray(value)) {
        if (!optionMaps.has(question.id)) {
          const optionMap = new Map<string, string>();
          question.options?.forEach((opt) => {
            optionMap.set(opt.value, opt.label[lang]);
          });
          optionMaps.set(question.id, optionMap);
        }
        const optionMap = optionMaps.get(question.id)!;
        const optionLabels = value.map((v) => optionMap.get(v) || v);
        answerText = optionLabels.join(', ');
      } else if (question.options) {
        if (!optionMaps.has(question.id)) {
          const optionMap = new Map<string, string>();
          question.options.forEach((opt) => {
            optionMap.set(opt.value, opt.label[lang]);
          });
          optionMaps.set(question.id, optionMap);
        }
        const optionMap = optionMaps.get(question.id)!;
        answerText = optionMap.get(value as string) || value;
      } else {
        answerText = value as string;
      }

        // Add units for weight and age (optimized)
        if (question.id === 'weight' && answerText) {
          const weightNum = Number(answerText);
          if (!isNaN(weightNum)) {
            answerText = `${answerText} кг`;
          }
        } else if (question.id === 'age_months' && answerText) {
          const monthsNum = Number(answerText);
          if (!isNaN(monthsNum)) {
            if (lang === 'ru') {
              // Russian pluralization for months: месяц/месяца/месяцев
              const lastDigit = monthsNum % 10;
              const lastTwoDigits = monthsNum % 100;
              if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                answerText = `${answerText} месяцев`;
              } else if (lastDigit === 1) {
                answerText = `${answerText} месяц`;
              } else if (lastDigit >= 2 && lastDigit <= 4) {
                answerText = `${answerText} месяца`;
              } else {
                answerText = `${answerText} месяцев`;
              }
            } else if (lang === 'en') {
              answerText = `${answerText} ${monthsNum === 1 ? 'month' : 'months'}`;
            } else if (lang === 'de') {
              answerText = `${answerText} ${monthsNum === 1 ? 'Monat' : 'Monate'}`;
            }
          }
        } else if (question.id === 'age' && answerText) {
          const ageNum = Number(answerText);
          if (!isNaN(ageNum)) {
            if (lang === 'ru') {
              // Russian pluralization: год/года/лет (optimized)
              const lastDigit = ageNum % 10;
              const lastTwoDigits = ageNum % 100;
              if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                answerText = `${answerText} лет`;
              } else if (lastDigit === 1) {
                answerText = `${answerText} год`;
              } else if (lastDigit >= 2 && lastDigit <= 4) {
                answerText = `${answerText} года`;
              } else {
                answerText = `${answerText} лет`;
              }
            } else if (lang === 'en') {
              answerText = `${answerText} ${ageNum === 1 ? 'year' : 'years'}`;
            } else if (lang === 'de') {
              answerText = `${answerText} ${ageNum === 1 ? 'Jahr' : 'Jahre'}`;
            }
          }
        }

        // Special handling for what_else_question: if "yes" is selected, show only the what_else text instead of "Да"
        if (question.id === 'what_else_question' && value === 'yes' && formData['what_else']) {
          const whatElseText = formData['what_else'] as string;
          if (whatElseText && whatElseText.trim() !== '') {
            // Replace answerText with what_else content
            answerText = whatElseText.trim();
          }
        }

        // For personal section, show only answers without questions
        if (section.id === 'personal') {
          md += `${answerText}\n`;
        } else {
          // Format: Question on one line, Answer on next line
          md += `${questionPrefix}${label}:\n${answerText}`;
          
          if (additional && additional.trim() !== '') {
            md += `\n(${additional})`;
          }
          
          md += `\n`;
        }
    });
  });

  // Contact section (compact)
  md += `\n**${t.mdContacts}**\n`;
  
  const contacts: string[] = [];
  if (contactData.telegram && contactData.telegram.trim() !== '') {
    const cleanTelegram = contactData.telegram.replace(/^@/, '').trim();
    contacts.push(`Telegram: **@${cleanTelegram}**`);
  }
  if (contactData.phone && contactData.phone.trim() !== '') {
    const countryCode = contactData.phoneCountryCode || 'DE';
    const country = countryCodes.find(c => c.code === countryCode);
    const dialCode = country?.dialCode || '+49';
    const phoneNumber = contactData.phone.trim().replace(/[\s\-\(\)]/g, ''); // Remove formatting
    const fullPhoneNumber = `${dialCode}${phoneNumber}`; // Full number without spaces
    // Telegram automatically makes phone numbers in format +1234567890 clickable
    // So we display it without spaces to ensure the entire number is clickable
    contacts.push(`Phone: **${fullPhoneNumber}**`);
  }
  if (contactData.email && contactData.email.trim() !== '') {
    contacts.push(`Email: **${contactData.email.trim()}**`);
  }
  
  if (contacts.length > 0) {
    md += contacts.join('\n') + '\n';
  }

  return md;
};

// Helper function to get current language from URL
const getCurrentLanguage = (): Language => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang && ['ru', 'en', 'de'].includes(lang)) {
    return lang as Language;
  }
  return 'ru'; // default
};

// Send to Telegram
// SECURITY NOTE: In production, use environment variables or a server-side proxy
// Do not expose BOT_TOKEN in client-side code in production!
// For development: Set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env file
export const sendToTelegram = async (markdown: string): Promise<{ success: boolean; error?: string; messageId?: number }> => {
  // Try to get from environment variables first (for Vite: VITE_ prefix)
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  // Debug: Log all environment variables (without exposing sensitive data)
  const allViteEnvKeys = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
  console.log('Environment check:', {
    hasToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID,
    tokenLength: BOT_TOKEN?.length || 0,
    chatIdLength: CHAT_ID?.length || 0,
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV,
    allEnvKeys: allViteEnvKeys,
    allEnvValues: allViteEnvKeys.map(key => ({ key, hasValue: !!import.meta.env[key] }))
  });

  // Validate that tokens are set
  if (!BOT_TOKEN || !CHAT_ID || BOT_TOKEN.trim() === '' || CHAT_ID.trim() === '') {
    const errorMsg = `Telegram Bot Token or Chat ID not configured. 
    
Please check:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Make sure these variables are set:
   - Key: VITE_TELEGRAM_BOT_TOKEN, Value: your_bot_token
   - Key: VITE_TELEGRAM_CHAT_ID, Value: your_chat_id
3. After adding variables, redeploy the project:
   - Go to Deployments → Click "..." on latest deployment → "Redeploy"
4. Wait for the build to complete

Current status:
- VITE_TELEGRAM_BOT_TOKEN: ${BOT_TOKEN ? 'SET' : 'NOT SET'}
- VITE_TELEGRAM_CHAT_ID: ${CHAT_ID ? 'SET' : 'NOT SET'}
- All VITE_ variables found: ${allViteEnvKeys.join(', ') || 'NONE'}`;
    
    console.error('Environment variables check failed:', {
      BOT_TOKEN: BOT_TOKEN ? 'SET (hidden)' : 'NOT SET',
      CHAT_ID: CHAT_ID ? 'SET (hidden)' : 'NOT SET',
      allViteEnvKeys,
      mode: import.meta.env.MODE
    });
    return { success: false, error: errorMsg };
  }

  // Log payload for debugging
  console.log('Sending to Telegram...', { 
    chatId: CHAT_ID.substring(0, 4) + '...', 
    textLength: markdown.length,
    hasToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID
  });

  // Create AbortController for timeout
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
        signal: controller.signal,
      }
    );

    if (timeoutId) clearTimeout(timeoutId);

    const responseData = await response.json();

    // Helper function to extract migrate_to_chat_id from response
    const extractNewChatId = (data: any): number | null => {
      // Try different possible locations for migrate_to_chat_id
      if (data?.parameters?.migrate_to_chat_id) return data.parameters.migrate_to_chat_id;
      if (data?.migrate_to_chat_id) return data.migrate_to_chat_id;
      if (data?.error_code === 400 && data?.parameters?.migrate_to_chat_id) return data.parameters.migrate_to_chat_id;
      return null;
    };

    // Helper function to create error message for supergroup migration
    const createSupergroupErrorMessage = (newChatId: number | null, lang: Language): string => {
      if (newChatId) {
        return lang === 'ru' 
          ? `Чат был преобразован в супергруппу. Необходимо обновить Chat ID на новый: ${newChatId}. Обновите переменную окружения VITE_TELEGRAM_CHAT_ID и пересоберите проект.`
          : lang === 'de'
          ? `Der Chat wurde in eine Supergruppe konvertiert. Sie müssen die Chat-ID auf die neue aktualisieren: ${newChatId}. Aktualisieren Sie die Umgebungsvariable VITE_TELEGRAM_CHAT_ID und stellen Sie das Projekt neu bereit.`
          : `Chat was upgraded to a supergroup. You need to update Chat ID to the new one: ${newChatId}. Update VITE_TELEGRAM_CHAT_ID environment variable and rebuild the project.`;
      } else {
        return lang === 'ru'
          ? `Чат был преобразован в супергруппу. Необходимо получить новый Chat ID. Добавьте бота в супергруппу и получите новый Chat ID через @userinfobot или @RawDataBot.`
          : lang === 'de'
          ? `Der Chat wurde in eine Supergruppe konvertiert. Sie müssen eine neue Chat-ID erhalten. Fügen Sie den Bot zur Supergruppe hinzu und erhalten Sie die neue Chat-ID über @userinfobot oder @RawDataBot.`
          : `Chat was upgraded to a supergroup. You need to get a new Chat ID. Add the bot to the supergroup and get the new Chat ID via @userinfobot or @RawDataBot.`;
      }
    };

    // Check for supergroup migration error in response description
    const isSupergroupError = responseData.description && 
      responseData.description.toLowerCase().includes('group chat was upgraded to a supergroup chat');

    if (isSupergroupError) {
      const lang = getCurrentLanguage();
      const newChatId = extractNewChatId(responseData);
      
      console.error('Chat migrated to supergroup - Full response:', {
        oldChatId: CHAT_ID,
        newChatId: newChatId || 'NOT PROVIDED IN RESPONSE',
        fullResponse: JSON.stringify(responseData, null, 2),
        instructions: 'Update VITE_TELEGRAM_CHAT_ID environment variable'
      });
      
      return {
        success: false,
        error: createSupergroupErrorMessage(newChatId, lang)
      };
    }

    if (!response.ok) {
      const errorMsg = responseData.description || `HTTP ${response.status}`;
      console.error('Telegram API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        fullResponse: JSON.stringify(responseData, null, 2)
      });
      
      return { 
        success: false, 
        error: `Telegram API error: ${errorMsg}` 
      };
    }

    if (!responseData.ok) {
      const errorMsg = responseData.description || 'Unknown Telegram API error';
      console.error('Telegram API returned error:', {
        error: responseData,
        fullResponse: JSON.stringify(responseData, null, 2)
      });
      
      return { 
        success: false, 
        error: `Telegram API error: ${errorMsg}` 
      };
    }

    console.log('Successfully sent to Telegram');
    const messageId = responseData.result?.message_id;
    return { success: true, messageId };
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Please check your internet connection and try again.';
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Error sending to Telegram:', {
      error,
      message: errorMessage,
      name: error?.name,
      stack: error?.stack
    });
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Generate unique ID
export const generateQuestionnaireId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper functions to normalize contact data for comparison
const normalizeTelegram = (telegram: string): string => {
  return telegram.trim().replace(/^@/, '').toLowerCase();
};

const normalizePhone = (phone: string): string => {
  return phone.trim().replace(/[\s\-\(\)\+]/g, '');
};

// Save submitted questionnaire
export const saveSubmittedQuestionnaire = (questionnaire: SubmittedQuestionnaire): void => {
  try {
    const key = `submitted_questionnaire_${questionnaire.id}`;
    localStorage.setItem(key, JSON.stringify(questionnaire));
    
    // Index by contact method (telegram or phone) for easy lookup
    // Index by Telegram if available
    if (questionnaire.contactData.telegram && questionnaire.contactData.telegram.trim() !== '') {
      const normalizedTelegram = normalizeTelegram(questionnaire.contactData.telegram);
      const telegramKey = `questionnaires_by_contact_${normalizedTelegram}`;
      const existingTelegram = localStorage.getItem(telegramKey);
      const telegramIds = existingTelegram ? JSON.parse(existingTelegram) : [];
      if (!telegramIds.includes(questionnaire.id)) {
        telegramIds.push(questionnaire.id);
        localStorage.setItem(telegramKey, JSON.stringify(telegramIds));
      }
    }
    
    // Index by Phone if available
    if (questionnaire.contactData.phone && questionnaire.contactData.phone.trim() !== '') {
      const normalizedPhone = normalizePhone(questionnaire.contactData.phone);
      const phoneKey = `questionnaires_by_contact_${normalizedPhone}`;
      const existingPhone = localStorage.getItem(phoneKey);
      const phoneIds = existingPhone ? JSON.parse(existingPhone) : [];
      if (!phoneIds.includes(questionnaire.id)) {
        phoneIds.push(questionnaire.id);
        localStorage.setItem(phoneKey, JSON.stringify(phoneIds));
      }
    }
  } catch (err) {
    console.error('Error saving submitted questionnaire:', err);
  }
};

// Get submitted questionnaire by ID
export const getSubmittedQuestionnaireById = (id: string): SubmittedQuestionnaire | null => {
  try {
    const key = `submitted_questionnaire_${id}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading submitted questionnaire:', err);
  }
  return null;
};

// Update submitted questionnaire
export const updateSubmittedQuestionnaire = (questionnaire: SubmittedQuestionnaire): void => {
  try {
    const key = `submitted_questionnaire_${questionnaire.id}`;
    localStorage.setItem(key, JSON.stringify(questionnaire));
    
    // Update contact index (same as in saveSubmittedQuestionnaire)
    // Index by Telegram if available
    if (questionnaire.contactData.telegram && questionnaire.contactData.telegram.trim() !== '') {
      const normalizedTelegram = normalizeTelegram(questionnaire.contactData.telegram);
      const telegramKey = `questionnaires_by_contact_${normalizedTelegram}`;
      const existingTelegram = localStorage.getItem(telegramKey);
      const telegramIds = existingTelegram ? JSON.parse(existingTelegram) : [];
      if (!telegramIds.includes(questionnaire.id)) {
        telegramIds.push(questionnaire.id);
        localStorage.setItem(telegramKey, JSON.stringify(telegramIds));
      }
    }
    
    // Index by Phone if available
    if (questionnaire.contactData.phone && questionnaire.contactData.phone.trim() !== '') {
      const normalizedPhone = normalizePhone(questionnaire.contactData.phone);
      const phoneKey = `questionnaires_by_contact_${normalizedPhone}`;
      const existingPhone = localStorage.getItem(phoneKey);
      const phoneIds = existingPhone ? JSON.parse(existingPhone) : [];
      if (!phoneIds.includes(questionnaire.id)) {
        phoneIds.push(questionnaire.id);
        localStorage.setItem(phoneKey, JSON.stringify(phoneIds));
      }
    }
  } catch (err) {
    console.error('Error updating submitted questionnaire:', err);
  }
};

// Get all submitted questionnaires
export const getAllSubmittedQuestionnaires = (): SubmittedQuestionnaire[] => {
  try {
    const questionnaires: SubmittedQuestionnaire[] = [];
    
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submitted_questionnaire_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // Validate that parsed data has required fields
            if (parsed && parsed.id && parsed.type && parsed.submittedAt) {
              questionnaires.push(parsed);
            } else {
              console.warn('Invalid questionnaire data found:', key, parsed);
            }
          }
        } catch (err) {
          console.error('Error parsing questionnaire:', key, err);
        }
      }
    }
    
    console.log(`Found ${questionnaires.length} submitted questionnaires`);
    return questionnaires.sort((a, b) => b.submittedAt - a.submittedAt);
  } catch (err) {
    console.error('Error loading all submitted questionnaires:', err);
    return [];
  }
};

// Get submitted questionnaires by contact (Telegram or Phone)
export const getSubmittedQuestionnairesByContact = (telegram?: string, phone?: string): SubmittedQuestionnaire[] => {
  try {
    const foundQuestionnaires: SubmittedQuestionnaire[] = [];
    const foundIds = new Set<string>();
    
    // Normalize search inputs
    const normalizedTelegram = telegram ? normalizeTelegram(telegram) : null;
    const normalizedPhone = phone ? normalizePhone(phone) : null;
    
    // Search through all questionnaires and match by contact data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submitted_questionnaire_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const questionnaire: SubmittedQuestionnaire = JSON.parse(data);
            let matches = false;
            
            // Check Telegram match
            if (normalizedTelegram && questionnaire.contactData.telegram) {
              const qTelegram = normalizeTelegram(questionnaire.contactData.telegram);
              if (qTelegram === normalizedTelegram) {
                matches = true;
              }
            }
            
            // Check Phone match (compare without country code)
            if (normalizedPhone && questionnaire.contactData.phone) {
              const qPhone = normalizePhone(questionnaire.contactData.phone);
              // Remove country code from stored phone if it exists
              const qPhoneWithoutCode = qPhone.replace(/^\d{1,4}/, ''); // Remove up to 4 digits (country code)
              const searchPhoneWithoutCode = normalizedPhone.replace(/^\d{1,4}/, '');
              
              // Try exact match first
              if (qPhone === normalizedPhone || qPhoneWithoutCode === searchPhoneWithoutCode) {
                matches = true;
              }
            }
            
            if (matches && questionnaire.id && questionnaire.type && questionnaire.submittedAt) {
              foundIds.add(questionnaire.id);
            }
          }
        } catch (err) {
          console.error('Error parsing questionnaire:', err);
        }
      }
    }
    
    // Also check indexed contacts
    if (normalizedTelegram) {
      const contactKey = `questionnaires_by_contact_${normalizedTelegram}`;
      const idsJson = localStorage.getItem(contactKey);
      if (idsJson) {
        try {
          const ids: string[] = JSON.parse(idsJson);
          ids.forEach(id => foundIds.add(id));
        } catch (err) {
          console.error('Error parsing contact IDs:', err);
        }
      }
    }
    
    if (normalizedPhone) {
      const contactKey = `questionnaires_by_contact_${normalizedPhone}`;
      const idsJson = localStorage.getItem(contactKey);
      if (idsJson) {
        try {
          const ids: string[] = JSON.parse(idsJson);
          ids.forEach(id => foundIds.add(id));
        } catch (err) {
          console.error('Error parsing contact IDs:', err);
        }
      }
    }
    
    // Load questionnaires by IDs
    foundIds.forEach(id => {
      const key = `submitted_questionnaire_${id}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const questionnaire: SubmittedQuestionnaire = JSON.parse(data);
          if (questionnaire && questionnaire.id && questionnaire.type && questionnaire.submittedAt) {
            // Avoid duplicates
            if (!foundQuestionnaires.find(q => q.id === questionnaire.id)) {
              foundQuestionnaires.push(questionnaire);
            }
          }
        } catch (err) {
          console.error('Error parsing questionnaire:', err);
        }
      }
    });
    
    return foundQuestionnaires.sort((a, b) => b.submittedAt - a.submittedAt);
  } catch (err) {
    console.error('Error loading submitted questionnaires by contact:', err);
    return [];
  }
};

// Get submitted questionnaires by email (kept for backward compatibility)
export const getSubmittedQuestionnairesByEmail = (email: string): SubmittedQuestionnaire[] => {
  try {
    const emailKey = `questionnaires_by_email_${email}`;
    const idsJson = localStorage.getItem(emailKey);
    if (!idsJson) return [];
    
    const ids: string[] = JSON.parse(idsJson);
    const questionnaires: SubmittedQuestionnaire[] = [];
    
    ids.forEach(id => {
      const key = `submitted_questionnaire_${id}`;
      const data = localStorage.getItem(key);
      if (data) {
        questionnaires.push(JSON.parse(data));
      }
    });
    
    return questionnaires.sort((a, b) => b.submittedAt - a.submittedAt);
  } catch (err) {
    console.error('Error loading submitted questionnaires:', err);
    return [];
  }
};

// Delete submitted questionnaire
export const deleteSubmittedQuestionnaire = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const key = `submitted_questionnaire_${id}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return { success: false, error: 'Questionnaire not found' };
    }
    
    const questionnaire: SubmittedQuestionnaire = JSON.parse(data);
    
    // Delete from Telegram if message_id exists
    if (questionnaire.telegramMessageId) {
      const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
      
      if (BOT_TOKEN && CHAT_ID) {
        try {
          await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: CHAT_ID,
                message_id: questionnaire.telegramMessageId,
              }),
            }
          );
        } catch (err) {
          console.error('Error deleting message from Telegram:', err);
          // Continue with local deletion even if Telegram deletion fails
        }
      }
    }
    
    // Delete from localStorage
    localStorage.removeItem(key);
    
    // Remove from contact index
    const contactIdentifier = questionnaire.contactData.telegram || questionnaire.contactData.phone || 'unknown';
    const contactKey = `questionnaires_by_contact_${contactIdentifier}`;
    const idsJson = localStorage.getItem(contactKey);
    if (idsJson) {
      const ids: string[] = JSON.parse(idsJson);
      const filteredIds = ids.filter(i => i !== id);
      if (filteredIds.length > 0) {
        localStorage.setItem(contactKey, JSON.stringify(filteredIds));
      } else {
        localStorage.removeItem(contactKey);
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error deleting submitted questionnaire:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
