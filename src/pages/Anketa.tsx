import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QuestionField } from '@/components/form/QuestionField';
import { ContactSection } from '@/components/form/ContactSection';
import { DSGVOCheckbox } from '@/components/form/DSGVOCheckbox';
import { MarkdownPreview } from '@/components/form/MarkdownPreview';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectionIcon } from '@/components/icons/SectionIcons';
import {
  getQuestionnaire,
  getQuestionnaireTitle,
  QuestionnaireType,
} from '@/lib/questionnaire-data';
import {
  FormData,
  FormAdditionalData,
  ContactData,
  FormErrors,
  validateForm,
  generateMarkdown,
  saveFormData,
  loadFormData,
  clearFormData,
  sendToTelegram,
  generateQuestionnaireId,
} from '@/lib/form-utils';
import {
  saveQuestionnaire,
  getQuestionnaires,
  getSessionToken,
} from '@/lib/api-client';
import { Eye, Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Anketa: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const type = (searchParams.get('type') as QuestionnaireType) || 'infant';
  const sections = useMemo(() => getQuestionnaire(type), [type]);
  const title = getQuestionnaireTitle(type, language);

  // Check if environment variables are configured
  const isEnvConfigured = useMemo(() => {
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    return !!(BOT_TOKEN && CHAT_ID && BOT_TOKEN.trim() !== '' && CHAT_ID.trim() !== '');
  }, []);

  const [formData, setFormData] = useState<FormData>({});
  const [additionalData, setAdditionalData] = useState<FormAdditionalData>({});
  const [contactData, setContactData] = useState<ContactData>({
    telegram: '',
    phone: '',
    phoneCountryCode: 'DE',
  });
  const [dsgvoAccepted, setDsgvoAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestionnaireId, setEditingQuestionnaireId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved form data on mount or load questionnaire for editing
  useEffect(() => {
    const editId = searchParams.get('editId');
    
    if (editId) {
      // Load questionnaire for editing - need to get from Supabase via API
      const loadQuestionnaireForEdit = async () => {
        const sessionToken = getSessionToken();
        if (!sessionToken) {
          toast.error(language === 'ru' 
            ? 'Для редактирования необходимо войти. Перейдите на страницу "Мои анкеты" и войдите.' 
            : language === 'de'
            ? 'Zum Bearbeiten müssen Sie sich anmelden. Gehen Sie zur Seite "Meine Fragebögen" und melden Sie sich an.'
            : 'To edit, you need to sign in. Go to "My Questionnaires" page and sign in.');
          navigate(`/data-request?lang=${language}`);
          return;
        }

        // Load questionnaires from API
        const result = await getQuestionnaires();
        if (result.success && result.data) {
          const questionnaire = result.data.questionnaires.find((q: any) => q.id === editId);
          if (questionnaire) {
            setFormData(questionnaire.formData);
            setAdditionalData(questionnaire.additionalData);
            setContactData(questionnaire.contactData);
            setDsgvoAccepted(true);
            setEditingQuestionnaireId(editId);
            setIsEditing(true);
          } else {
            // Fallback to localStorage for backward compatibility
            const { getSubmittedQuestionnaireById } = await import('@/lib/form-utils');
            const localQuestionnaire = getSubmittedQuestionnaireById(editId);
            if (localQuestionnaire) {
              setFormData(localQuestionnaire.formData);
              setAdditionalData(localQuestionnaire.additionalData);
              setContactData(localQuestionnaire.contactData);
              setDsgvoAccepted(true);
              setEditingQuestionnaireId(editId);
              setIsEditing(true);
            } else {
              toast.error(language === 'ru' ? 'Анкета не найдена' : language === 'de' ? 'Fragebogen nicht gefunden' : 'Questionnaire not found');
              navigate(`/data-request?lang=${language}`);
            }
          }
        } else {
          // Fallback to localStorage for backward compatibility
          const { getSubmittedQuestionnaireById } = await import('@/lib/form-utils');
          const localQuestionnaire = getSubmittedQuestionnaireById(editId);
          if (localQuestionnaire) {
            setFormData(localQuestionnaire.formData);
            setAdditionalData(localQuestionnaire.additionalData);
            setContactData(localQuestionnaire.contactData);
            setDsgvoAccepted(true);
            setEditingQuestionnaireId(editId);
            setIsEditing(true);
          } else {
            toast.error(language === 'ru' ? 'Анкета не найдена' : language === 'de' ? 'Fragebogen nicht gefunden' : 'Questionnaire not found');
            navigate(`/data-request?lang=${language}`);
          }
        }
      };
      
      loadQuestionnaireForEdit();
    } else {
      // Load saved form data
      const saved = loadFormData(type, language);
      if (saved) {
        setFormData(saved.formData);
        setAdditionalData(saved.additionalData);
        setContactData({
          ...saved.contactData,
          phoneCountryCode: saved.contactData.phoneCountryCode || 'DE', // Default to DE if not set
        });
      }
    }
  }, [type, language, searchParams, navigate]);

  // Auto-save form data with debounce
  useEffect(() => {
    // Skip auto-save if editing (to avoid overwriting)
    if (isEditing) return;
    
    const timeout = setTimeout(() => {
      try {
        saveFormData(type, language, formData, additionalData, contactData);
      } catch (err) {
        // Silently fail - localStorage might be full or disabled
        console.warn('Auto-save failed:', err);
      }
    }, 1500); // Increased debounce to reduce localStorage writes
    return () => clearTimeout(timeout);
  }, [formData, additionalData, contactData, type, language, isEditing]);

  // Helper function to clear additional field
  const clearAdditionalField = useCallback((fieldKey: string) => {
    setErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const newErrors = { ...prev };
      delete newErrors[fieldKey];
      return newErrors;
    });
    setAdditionalData((prev) => {
      if (!prev[fieldKey]) return prev;
      const newData = { ...prev };
      delete newData[fieldKey];
      return newData;
    });
  }, []);

  const handleFieldChange = useCallback((questionId: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }

    // Handle conditional field clearing based on question type
    const valueArray = Array.isArray(value) ? value : [value];
    const firstValue = valueArray[0];

    switch (questionId) {
      case 'operations':
        if (firstValue !== 'yes') {
          clearAdditionalField('operations_additional');
        }
        break;
      case 'pregnancy_problems':
        if (firstValue === 'no') {
          clearAdditionalField('pregnancy_problems_additional');
        }
        break;
      case 'injuries':
        if (!valueArray.some((v: string) => v !== 'no_issues')) {
          clearAdditionalField('injuries_additional');
        }
        break;
      case 'allergies':
        if (!valueArray.includes('other')) {
          clearAdditionalField('allergies_additional');
        }
        break;
      case 'illness_antibiotics':
        if (!valueArray.some((v: string) => ['took_antibiotics', 'took_medications', 'both'].includes(v))) {
          clearAdditionalField('illness_antibiotics_additional');
        }
        break;
      case 'skin_condition':
        if (!valueArray.includes('other')) {
          clearAdditionalField('skin_condition_additional');
        }
        break;
      case 'sleep':
        if (firstValue !== 'other') {
          clearAdditionalField('sleep_additional');
        }
        break;
    }
  }, [errors, clearAdditionalField]);

  const handleAdditionalChange = useCallback((questionId: string, value: string) => {
    setAdditionalData((prev) => ({ ...prev, [`${questionId}_additional`]: value }));
    // Clear error when user starts typing in additional field
    const additionalKey = `${questionId}_additional`;
    if (errors[additionalKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[additionalKey];
        return newErrors;
      });
    }
  }, [errors]);

  const handleClearForm = useCallback(() => {
    setFormData({});
    setAdditionalData({});
    setContactData({ telegram: '', phone: '', phoneCountryCode: 'DE' });
    setDsgvoAccepted(false);
    setErrors({});
    clearFormData(type, language);
    toast.success(language === 'ru' ? 'Форма очищена' : language === 'de' ? 'Formular gelöscht' : 'Form cleared');
  }, [type, language]);

  const markdown = useMemo(() => {
    return generateMarkdown(type, sections, formData, additionalData, contactData, language);
  }, [type, sections, formData, additionalData, contactData, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(sections, formData, contactData, language, additionalData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error(t('required'));
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!dsgvoAccepted) {
      toast.error(language === 'ru' ? 'Необходимо принять условия DSGVO' : language === 'de' ? 'Sie müssen die DSGVO-Bedingungen akzeptieren' : 'You must accept GDPR terms');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendToTelegram(markdown);
      
      if (result.success) {
        // Check if user is authenticated (for secure storage in Supabase)
        const sessionToken = getSessionToken();
        
        // Prepare questionnaire data
        const questionnaireId = isEditing && editingQuestionnaireId 
          ? editingQuestionnaireId 
          : generateQuestionnaireId();
        
        const questionnaireData = {
          id: questionnaireId,
          type,
          formData,
          additionalData,
          contactData,
          markdown,
          telegramMessageId: result.messageId,
          submittedAt: Date.now(),
          language,
        };

        if (isEditing && editingQuestionnaireId) {
          // Update existing questionnaire - need authentication
          if (!sessionToken) {
            toast.error(language === 'ru' 
              ? 'Для редактирования необходимо войти. Перейдите на страницу "Мои анкеты" и войдите.' 
              : language === 'de'
              ? 'Zum Bearbeiten müssen Sie sich anmelden. Gehen Sie zur Seite "Meine Fragebögen" und melden Sie sich an.'
              : 'To edit, you need to sign in. Go to "My Questionnaires" page and sign in.');
            navigate(`/data-request?lang=${language}`);
            return;
          }

          // Delete old message from Telegram if exists
          // Note: We need to get the old message ID from Supabase
          // For now, we'll try to delete if we have it in the data
          
          // Update questionnaire via API
          const updateResult = await saveQuestionnaire(questionnaireData);
          if (updateResult.success) {
            toast.success(language === 'ru' ? 'Анкета успешно обновлена' : language === 'de' ? 'Fragebogen erfolgreich aktualisiert' : 'Questionnaire successfully updated');
            navigate(`/data-request?lang=${language}`);
          } else {
            toast.error(updateResult.error || (language === 'ru' ? 'Ошибка обновления анкеты' : language === 'de' ? 'Fehler beim Aktualisieren des Fragebogens' : 'Error updating questionnaire'));
          }
        } else {
          // Save new questionnaire to Supabase (works with or without authentication)
          // If authenticated, uses session contact_identifier
          // If not authenticated, uses contactData from form
          const saveResult = await saveQuestionnaire(questionnaireData);
          
          if (saveResult.success) {
            clearFormData(type, language);
            if (sessionToken) {
              toast.success(language === 'ru' ? 'Анкета успешно отправлена и сохранена' : language === 'de' ? 'Fragebogen erfolgreich gesendet und gespeichert' : 'Questionnaire successfully sent and saved');
            } else {
              toast.success(
                language === 'ru' 
                  ? 'Анкета отправлена! Войдите на странице "Мои анкеты" для просмотра всех ваших анкет.'
                  : language === 'de'
                  ? 'Fragebogen gesendet! Melden Sie sich auf der Seite "Meine Fragebögen" an, um alle Ihre Fragebögen anzuzeigen.'
                  : 'Questionnaire sent! Sign in on "My Questionnaires" page to view all your questionnaires.'
              );
            }
            navigate(`/success?lang=${language}`);
          } else {
            // If save to Supabase fails, still save to localStorage as fallback
            const { saveSubmittedQuestionnaire } = await import('@/lib/form-utils');
            saveSubmittedQuestionnaire(questionnaireData);
            console.warn('Failed to save to Supabase, saved to localStorage instead:', saveResult.error);
            clearFormData(type, language);
            toast.warning(
              language === 'ru' 
                ? 'Анкета отправлена, но сохранение не удалось. Войдите на странице "Мои анкеты" для доступа.'
                : language === 'de'
                ? 'Fragebogen gesendet, aber Speichern fehlgeschlagen. Melden Sie sich auf der Seite "Meine Fragebögen" an.'
                : 'Questionnaire sent, but saving failed. Sign in on "My Questionnaires" page.'
            );
            navigate(`/success?lang=${language}`);
          }
        }
      } else {
        // Show detailed error message
        const errorMsg = result.error || t('submitError');
        console.error('Failed to send form:', errorMsg);
        toast.error(errorMsg, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMsg = error?.message || t('submitError');
      toast.error(errorMsg, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground text-center mb-8 animate-fade-in">
          {isEditing 
            ? (language === 'ru' ? 'Редактирование анкеты' : language === 'de' ? 'Fragebogen bearbeiten' : 'Edit Questionnaire')
            : title}
        </h1>

        {!isEnvConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {language === 'ru' 
                ? 'Переменные окружения не настроены' 
                : language === 'de' 
                ? 'Umgebungsvariablen nicht konfiguriert'
                : 'Environment variables not configured'}
            </AlertTitle>
            <AlertDescription>
              {language === 'ru' 
                ? 'Telegram Bot Token или Chat ID не настроены. Пожалуйста, настройте переменные окружения VITE_TELEGRAM_BOT_TOKEN и VITE_TELEGRAM_CHAT_ID в Vercel и пересоберите проект.'
                : language === 'de'
                ? 'Telegram Bot Token oder Chat ID nicht konfiguriert. Bitte setzen Sie die Umgebungsvariablen VITE_TELEGRAM_BOT_TOKEN und VITE_TELEGRAM_CHAT_ID in Vercel und stellen Sie das Projekt neu bereit.'
                : 'Telegram Bot Token or Chat ID not configured. Please set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID environment variables in Vercel and redeploy the project.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="card-wellness space-y-6"
              style={{ animationDelay: `${sectionIndex * 0.1}s` }}
            >
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <SectionIcon name={section.icon} className="w-6 h-6 text-primary" />
                {section.title[language]}
              </h2>

              <div className="space-y-6">
                {section.questions.map((question) => {
                  // Hide what_else field if what_else_question is not 'yes'
                  if (question.id === 'what_else' && formData['what_else_question'] !== 'yes') {
                    return null;
                  }
                  
                  return (
                    <div
                      key={question.id}
                      data-error={!!errors[question.id]}
                    >
                    <QuestionField
                      question={question}
                      value={formData[question.id] || (question.type === 'checkbox' ? [] : '')}
                      additionalValue={additionalData[`${question.id}_additional`] || ''}
                      error={errors[question.id]}
                      additionalError={errors[`${question.id}_additional`]}
                      onChange={(value) => handleFieldChange(question.id, value)}
                      onAdditionalChange={(value) =>
                        handleAdditionalChange(question.id, value)
                      }
                      formData={formData}
                    />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contact Section */}
          <ContactSection
            telegram={contactData.telegram || ''}
            phone={contactData.phone || ''}
            telegramError={errors['telegram']}
            phoneError={errors['phone']}
            contactMethodError={errors['contact_method']}
            onTelegramChange={(telegram) => {
              setContactData((prev) => ({ ...prev, telegram }));
              if (errors['telegram'] || errors['contact_method']) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors['telegram'];
                  delete newErrors['contact_method'];
                  return newErrors;
                });
              }
            }}
            phoneCountryCode={contactData.phoneCountryCode || 'DE'}
            onPhoneChange={(phone) => {
              setContactData((prev) => ({ ...prev, phone }));
              if (errors['phone'] || errors['contact_method']) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors['phone'];
                  delete newErrors['contact_method'];
                  return newErrors;
                });
              }
            }}
            onCountryCodeChange={(countryCode) => {
              setContactData((prev) => ({ ...prev, phoneCountryCode: countryCode }));
              if (errors['phone']) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors['phone'];
                  return newErrors;
                });
              }
            }}
          />

          {/* DSGVO Checkbox */}
          <DSGVOCheckbox checked={dsgvoAccepted} onChange={setDsgvoAccepted} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-secondary flex items-center justify-center gap-2 flex-1"
            >
              <Eye className="w-5 h-5" />
              {t('previewMarkdown')}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {t('clearForm')}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!dsgvoAccepted || isSubmitting || !isEnvConfigured}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {isEditing 
                  ? (language === 'ru' ? 'Сохранить изменения' : language === 'de' ? 'Änderungen speichern' : 'Save Changes')
                  : t('submit')}
              </>
            )}
          </button>
        </form>

        {/* Markdown Preview Modal */}
        {showPreview && (
          <MarkdownPreview markdown={markdown} onClose={() => setShowPreview(false)} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Anketa;
