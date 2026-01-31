import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactSection } from '@/components/form/ContactSection';
import { DSGVOCheckbox } from '@/components/form/DSGVOCheckbox';
import { MarkdownPreview } from '@/components/form/MarkdownPreview';
import { SectionCard } from '@/components/form/SectionCard';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [medicalDocumentFiles, setMedicalDocumentFiles] = useState<File[]>([]);

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
      case 'has_medical_documents':
        if (firstValue !== 'yes') {
          setMedicalDocumentFiles([]);
        }
        break;
      case 'weight_satisfaction':
        if (firstValue !== 'not_satisfied') {
          // Clear weight_goal and its additional field if user is satisfied with weight
          setFormData((prev) => {
            const newData = { ...prev };
            delete newData['weight_goal'];
            return newData;
          });
          clearAdditionalField('weight_goal_additional');
        }
        break;
      case 'weight_goal':
        if (firstValue !== 'lose' && firstValue !== 'gain') {
          clearAdditionalField('weight_goal_additional');
        }
        break;
      case 'had_covid':
        if (firstValue !== 'yes') {
          // Clear covid_times if user didn't have COVID
          setFormData((prev) => {
            const newData = { ...prev };
            delete newData['covid_times'];
            delete newData['covid_complications'];
            return newData;
          });
          // Clear covid_complications additional field
          clearAdditionalField('covid_complications_additional');
        }
        break;
      case 'had_vaccine':
        if (firstValue !== 'yes') {
          // Clear vaccine_doses if user didn't have vaccine
          setFormData((prev) => {
            const newData = { ...prev };
            delete newData['vaccine_doses'];
            return newData;
          });
        }
        break;
      case 'covid_complications':
        if (!valueArray.includes('other')) {
          clearAdditionalField('covid_complications_additional');
        }
        break;
      case 'hair_quality':
        if (!valueArray.includes('other')) {
          clearAdditionalField('hair_quality_additional');
        }
        break;
      case 'teeth_problems':
        if (!valueArray.includes('other')) {
          clearAdditionalField('teeth_problems_additional');
        }
        break;
      case 'stones_kidneys_gallbladder':
        if (!valueArray.includes('stones_kidneys') && !valueArray.includes('stones_gallbladder')) {
          clearAdditionalField('stones_kidneys_gallbladder_additional');
        }
        break;
      case 'regular_medications':
        const regularMedicationsValue = typeof value === 'string' ? value : (Array.isArray(value) ? value[0] : '');
        if (regularMedicationsValue !== 'yes') {
          clearAdditionalField('regular_medications_additional');
        }
        break;
      case 'digestion_detailed':
      case 'headaches_detailed':
      case 'varicose_hemorrhoids_pigment':
      case 'joints_detailed':
      case 'cysts_polyps_tumors':
      case 'herpes_warts_discharge':
      case 'menstruation_detailed':
      case 'prostatitis':
      case 'skin_problems_detailed':
      case 'lifestyle':
      case 'chronic_diseases':
      case 'sleep_problems':
      case 'energy_morning':
      case 'memory_concentration':
      case 'operations_traumas':
        if (!valueArray.includes('other')) {
          clearAdditionalField(`${fieldName}_additional`);
        }
        if (!valueArray.includes('organ_removed')) {
          clearAdditionalField('operations_traumas_organs_additional');
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
    setMedicalDocumentFiles([]);
    clearFormData(type, language);
    toast.success(language === 'ru' ? 'Форма очищена' : language === 'de' ? 'Formular gelöscht' : 'Form cleared');
  }, [type, language]);

  const markdown = useMemo(() => {
    let md = generateMarkdown(type, sections, formData, additionalData, contactData, language);
    
    // Add file information if files are uploaded
    if (medicalDocumentFiles.length > 0 && formData['has_medical_documents'] === 'yes') {
      if (medicalDocumentFiles.length === 1) {
        const fileInfo = language === 'ru'
          ? `\n**Прикреплён файл:** ${medicalDocumentFiles[0].name} (${(medicalDocumentFiles[0].size / 1024 / 1024).toFixed(2)} MB)`
          : language === 'de'
          ? `\n**Angehängte Datei:** ${medicalDocumentFiles[0].name} (${(medicalDocumentFiles[0].size / 1024 / 1024).toFixed(2)} MB)`
          : `\n**Attached file:** ${medicalDocumentFiles[0].name} (${(medicalDocumentFiles[0].size / 1024 / 1024).toFixed(2)} MB)`;
        md += fileInfo;
      } else {
        const filesList = medicalDocumentFiles.map((file, index) => 
          `${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
        ).join('\n');
        const fileInfo = language === 'ru'
          ? `\n**Прикреплено файлов:** ${medicalDocumentFiles.length}\n${filesList}`
          : language === 'de'
          ? `\n**Angehängte Dateien:** ${medicalDocumentFiles.length}\n${filesList}`
          : `\n**Attached files:** ${medicalDocumentFiles.length}\n${filesList}`;
        md += fileInfo;
      }
    }
    
    return md;
  }, [type, sections, formData, additionalData, contactData, language, medicalDocumentFiles]);


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
      const result = await sendToTelegram(markdown, medicalDocumentFiles, language);
      
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
    <div className="min-h-screen bg-medical-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-medical-900 text-center mb-6">
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
          {/* Render all sections */}
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              formData={formData}
              additionalData={additionalData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onAdditionalChange={handleAdditionalChange}
              language={language}
              onFileChange={section.questions.some(q => q.id === 'has_medical_documents') ? setMedicalDocumentFiles : undefined}
              files={medicalDocumentFiles}
            />
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

          {/* Submit Button - Sticky on mobile */}
          <div className="sticky bottom-4 z-10 md:static md:z-auto">
            <button
              type="submit"
              disabled={!dsgvoAccepted || isSubmitting || !isEnvConfigured}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg shadow-lg md:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
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
