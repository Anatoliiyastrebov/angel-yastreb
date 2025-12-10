import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home, Eye, Edit, Trash2, Calendar, FileText, MessageCircle, Phone, LogOut, Shield } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  SubmittedQuestionnaire,
  sendToTelegram,
} from '@/lib/form-utils';
import {
  sendOTP,
  verifyOTP,
  getQuestionnaires,
  getSessionToken,
  clearSession,
} from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MarkdownPreview } from '@/components/form/MarkdownPreview';
import { getQuestionnaireTitle } from '@/lib/questionnaire-data';

// Safe import of countryCodes
import { countryCodes as importedCountryCodes } from '@/lib/country-codes';

const countryCodes = importedCountryCodes || [];

const DataRequest: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [questionnaires, setQuestionnaires] = useState<SubmittedQuestionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<SubmittedQuestionnaire | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteRequestDialog, setShowDeleteRequestDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const [authTelegram, setAuthTelegram] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPhoneCountryCode, setAuthPhoneCountryCode] = useState('DE');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [deleteRequestFirstName, setDeleteRequestFirstName] = useState('');
  const [deleteRequestLastName, setDeleteRequestLastName] = useState('');
  const [deleteRequestDate, setDeleteRequestDate] = useState('');
  const [deleteRequestContact, setDeleteRequestContact] = useState('');
  const [deleteRequestReason, setDeleteRequestReason] = useState('');
  const [isSubmittingDeleteRequest, setIsSubmittingDeleteRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load questionnaires on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = getSessionToken();
      
      if (token) {
        // User is authenticated, try to load questionnaires
        setIsAuthenticated(true);
        setShowAuthForm(false);
        await loadQuestionnaires();
      } else {
        // User not authenticated, show auth form
        setIsAuthenticated(false);
        setShowAuthForm(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [language]);

  const loadQuestionnaires = async () => {
    setIsLoading(true);
    try {
      const result = await getQuestionnaires();
      if (result.success && result.data) {
        setQuestionnaires(result.data.questionnaires || []);
        setError(null);
      } else {
        // Session expired or error
        if (result.error?.includes('expired') || result.error?.includes('authenticate')) {
          clearSession();
          setIsAuthenticated(false);
          setShowAuthForm(true);
          toast.info(language === 'ru' ? 'Сессия истекла. Пожалуйста, войдите снова.' : language === 'de' ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' : 'Session expired. Please sign in again.');
        } else {
          setError(result.error || 'Failed to load questionnaires');
          setQuestionnaires([]);
        }
      }
    } catch (err) {
      console.error('Error loading questionnaires:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setQuestionnaires([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!authTelegram.trim() && !authPhone.trim()) {
      toast.error(language === 'ru' ? 'Укажите Telegram или телефон' : language === 'de' ? 'Geben Sie Telegram oder Telefon an' : 'Please provide Telegram or phone');
      return;
    }

    setIsSendingOtp(true);
    try {
      // Format phone with country code if provided
      let phoneToSend = authPhone.trim();
      if (phoneToSend && authPhoneCountryCode) {
        const country = countryCodes.find(c => c.code === authPhoneCountryCode);
        if (country) {
          // Remove country code if user already included it
          const dialCodePattern = new RegExp(`^\\+?${country.dialCode.replace('+', '')}\\s*`);
          phoneToSend = phoneToSend.replace(dialCodePattern, '');
        }
      }

      const result = await sendOTP(
        authTelegram.trim() || undefined,
        phoneToSend || undefined
      );

      if (result.success) {
        setShowOtpInput(true);
        toast.success(language === 'ru' ? 'Код отправлен. Проверьте Telegram или SMS.' : language === 'de' ? 'Code gesendet. Bitte überprüfen Sie Telegram oder SMS.' : 'Code sent. Please check Telegram or SMS.');
      } else {
        toast.error(result.error || (language === 'ru' ? 'Ошибка отправки кода' : language === 'de' ? 'Fehler beim Senden des Codes' : 'Error sending code'));
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      toast.error(language === 'ru' ? 'Ошибка отправки кода' : language === 'de' ? 'Fehler beim Senden des Codes' : 'Error sending code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error(language === 'ru' ? 'Введите 6-значный код' : language === 'de' ? 'Geben Sie den 6-stelligen Code ein' : 'Please enter 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      // Format phone with country code if provided
      let phoneToVerify = authPhone.trim();
      if (phoneToVerify && authPhoneCountryCode) {
        const country = countryCodes.find(c => c.code === authPhoneCountryCode);
        if (country) {
          const dialCodePattern = new RegExp(`^\\+?${country.dialCode.replace('+', '')}\\s*`);
          phoneToVerify = phoneToVerify.replace(dialCodePattern, '');
        }
      }

      const result = await verifyOTP(
        authTelegram.trim() || undefined,
        phoneToVerify || undefined,
        otpCode.trim()
      );

      if (result.success) {
        setIsAuthenticated(true);
        setShowAuthForm(false);
        setShowOtpInput(false);
        toast.success(language === 'ru' ? 'Успешный вход!' : language === 'de' ? 'Erfolgreich angemeldet!' : 'Successfully signed in!');
        await loadQuestionnaires();
      } else {
        toast.error(result.error || (language === 'ru' ? 'Неверный код' : language === 'de' ? 'Ungültiger Code' : 'Invalid code'));
        setOtpCode('');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error(language === 'ru' ? 'Ошибка проверки кода' : language === 'de' ? 'Fehler bei der Code-Überprüfung' : 'Error verifying code');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const content = {
    ru: {
      title: 'Мои анкеты',
      description: 'Просмотрите или измените отправленные анкеты. Для удаления данных используйте форму запроса на удаление.',
      backToHome: 'Вернуться на главную',
      noQuestionnaires: 'Анкеты не найдены',
      noQuestionnairesDesc: 'Вы еще не отправили ни одной анкеты или не нашли свои анкеты по контакту.',
      authTitle: 'Вход для доступа к анкетам',
      authDesc: 'Для просмотра ваших анкет необходимо войти. Введите ваш Telegram или телефон, и мы отправим код подтверждения.',
      sendCode: 'Отправить код',
      enterCode: 'Введите код подтверждения',
      codeSent: 'Код отправлен',
      verifyCode: 'Подтвердить',
      invalidCode: 'Неверный код',
      signOut: 'Выйти',
      submittedAt: 'Отправлено',
      view: 'Просмотр',
      edit: 'Изменить',
      deleteRequest: 'Запрос на удаление',
      deleteRequestTitle: 'Запрос на удаление данных',
      deleteRequestDesc: 'Для удаления ваших данных заполните форму ниже. Укажите ваши данные для идентификации. После обработки запроса ваши данные будут удалены из системы и Telegram.',
      deleteRequestSuccess: 'Запрос на удаление отправлен',
      deleteRequestError: 'Ошибка при отправке запроса',
      firstName: 'Имя',
      lastName: 'Фамилия',
      approximateDate: 'Примерная дата прохождения анкеты',
      contactForInquiry: 'Контакт для связи (Telegram или телефон)',
      reasonOptional: 'Причина запроса (необязательно)',
      viewTitle: 'Просмотр анкеты',
      editTitle: 'Редактирование анкеты',
      phone: 'Телефон',
      requestDelete: 'Отправить запрос на удаление',
      cancel: 'Отмена',
    },
    en: {
      title: 'My Questionnaires',
      description: 'View or modify submitted questionnaires. To delete data, use the deletion request form.',
      backToHome: 'Back to home',
      noQuestionnaires: 'No questionnaires found',
      noQuestionnairesDesc: 'You have not submitted any questionnaires yet or could not find your questionnaires by contact.',
      authTitle: 'Sign in to access questionnaires',
      authDesc: 'To view your questionnaires, please sign in. Enter your Telegram or phone, and we will send a verification code.',
      sendCode: 'Send Code',
      enterCode: 'Enter verification code',
      codeSent: 'Code sent',
      verifyCode: 'Verify',
      invalidCode: 'Invalid code',
      signOut: 'Sign Out',
      submittedAt: 'Submitted',
      view: 'View',
      edit: 'Edit',
      deleteRequest: 'Request Deletion',
      deleteRequestTitle: 'Data Deletion Request',
      deleteRequestDesc: 'To delete your data, please fill out the form below. Provide your information for identification. After processing the request, your data will be deleted from the system and Telegram.',
      deleteRequestSuccess: 'Deletion request sent',
      deleteRequestError: 'Error sending request',
      firstName: 'First Name',
      lastName: 'Last Name',
      approximateDate: 'Approximate Date of Questionnaire',
      contactForInquiry: 'Contact for inquiries (Telegram or phone)',
      reasonOptional: 'Reason for request (optional)',
      viewTitle: 'View Questionnaire',
      editTitle: 'Edit Questionnaire',
      phone: 'Phone',
      requestDelete: 'Send Deletion Request',
      cancel: 'Cancel',
    },
    de: {
      title: 'Meine Fragebögen',
      description: 'Gesendete Fragebögen anzeigen oder ändern. Zum Löschen von Daten verwenden Sie das Formular für Löschanträge.',
      backToHome: 'Zurück zur Startseite',
      noQuestionnaires: 'Keine Fragebögen gefunden',
      noQuestionnairesDesc: 'Sie haben noch keine Fragebögen gesendet oder konnten Ihre Fragebögen nicht anhand des Kontakts finden.',
      authTitle: 'Anmeldung für Zugriff auf Fragebögen',
      authDesc: 'Um Ihre Fragebögen anzuzeigen, müssen Sie sich anmelden. Geben Sie Ihr Telegram oder Telefon ein, und wir senden einen Bestätigungscode.',
      sendCode: 'Code senden',
      enterCode: 'Geben Sie den Bestätigungscode ein',
      codeSent: 'Code gesendet',
      verifyCode: 'Bestätigen',
      invalidCode: 'Ungültiger Code',
      signOut: 'Abmelden',
      submittedAt: 'Gesendet',
      view: 'Anzeigen',
      edit: 'Bearbeiten',
      deleteRequest: 'Löschantrag',
      deleteRequestTitle: 'Antrag auf Datenlöschung',
      deleteRequestDesc: 'Um Ihre Daten zu löschen, füllen Sie bitte das untenstehende Formular aus. Geben Sie Ihre Daten zur Identifikation an. Nach Bearbeitung des Antrags werden Ihre Daten aus dem System und Telegram gelöscht.',
      deleteRequestSuccess: 'Löschantrag gesendet',
      deleteRequestError: 'Fehler beim Senden des Antrags',
      firstName: 'Vorname',
      lastName: 'Nachname',
      approximateDate: 'Ungefähres Datum der Fragebogenausfüllung',
      contactForInquiry: 'Kontakt für Rückfragen (Telegram oder Telefon)',
      reasonOptional: 'Grund für den Antrag (optional)',
      viewTitle: 'Fragebogen anzeigen',
      editTitle: 'Fragebogen bearbeiten',
      phone: 'Telefon',
      requestDelete: 'Löschantrag senden',
      cancel: 'Abbrechen',
    },
  };

  const t = content[language];

  const handleView = (questionnaire: SubmittedQuestionnaire) => {
    // Ensure user is authenticated
    const token = getSessionToken();
    if (!token) {
      toast.error(language === 'ru' ? 'Сессия истекла. Пожалуйста, войдите снова.' : language === 'de' ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' : 'Session expired. Please sign in again.');
      setIsAuthenticated(false);
      setShowAuthForm(true);
      return;
    }
    
    setSelectedQuestionnaire(questionnaire);
    setShowViewDialog(true);
  };

  const handleEdit = (questionnaire: SubmittedQuestionnaire) => {
    // Ensure user is authenticated
    const token = getSessionToken();
    if (!token) {
      toast.error(language === 'ru' ? 'Сессия истекла. Пожалуйста, войдите снова.' : language === 'de' ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' : 'Session expired. Please sign in again.');
      setIsAuthenticated(false);
      setShowAuthForm(true);
      return;
    }
    
    // Navigate to anketa page with edit parameters
    // Note: Edit functionality will need to be updated to work with Supabase
    navigate(`/anketa?type=${questionnaire.type}&editId=${questionnaire.id}&lang=${questionnaire.language}`);
  };

  const handleDeleteRequest = () => {
    setShowDeleteRequestDialog(true);
    // Pre-fill data from first questionnaire if available
    if (questionnaires.length > 0) {
      const firstQ = questionnaires[0];
      // Try to get name from formData
      if (firstQ.formData && firstQ.formData.name) {
        setDeleteRequestFirstName(firstQ.formData.name as string || '');
      }
      if (firstQ.formData && firstQ.formData.last_name) {
        setDeleteRequestLastName(firstQ.formData.last_name as string || '');
      }
      // Pre-fill contact
      const contact = firstQ.contactData.telegram || firstQ.contactData.phone || '';
      setDeleteRequestContact(contact);
      // Pre-fill approximate date from submittedAt
      if (firstQ.submittedAt) {
        const date = new Date(firstQ.submittedAt);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        setDeleteRequestDate(dateStr);
      }
    }
  };

  const handleSubmitDeleteRequest = async () => {
    // Validate required fields
    if (!deleteRequestFirstName.trim()) {
      toast.error(language === 'ru' ? 'Укажите имя' : language === 'de' ? 'Geben Sie den Vornamen an' : 'Please provide first name');
      return;
    }
    if (!deleteRequestLastName.trim()) {
      toast.error(language === 'ru' ? 'Укажите фамилию' : language === 'de' ? 'Geben Sie den Nachnamen an' : 'Please provide last name');
      return;
    }
    if (!deleteRequestDate.trim()) {
      toast.error(language === 'ru' ? 'Укажите примерную дату прохождения анкеты' : language === 'de' ? 'Geben Sie das ungefähre Datum an' : 'Please provide approximate date');
      return;
    }
    if (!deleteRequestContact.trim()) {
      toast.error(language === 'ru' ? 'Укажите контакт для связи' : language === 'de' ? 'Geben Sie einen Kontakt an' : 'Please provide a contact');
      return;
    }

    // Ensure user is authenticated
    const token = getSessionToken();
    if (!token) {
      toast.error(language === 'ru' ? 'Сессия истекла. Пожалуйста, войдите снова.' : language === 'de' ? 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.' : 'Session expired. Please sign in again.');
      setIsAuthenticated(false);
      setShowAuthForm(true);
      return;
    }

    setIsSubmittingDeleteRequest(true);
    try {
      // Collect all questionnaire IDs for deletion
      const questionnaireIds = questionnaires.map(q => q.id);
      const contactInfo = questionnaires.map(q => ({
        telegram: q.contactData?.telegram,
        phone: q.contactData?.phone,
        phoneCountryCode: q.contactData?.phoneCountryCode,
      }));

      // Generate deletion request message
      const deletionTitle = language === 'ru' 
        ? 'Запрос на удаление данных (GDPR)'
        : language === 'de'
        ? 'Antrag auf Datenlöschung (DSGVO)'
        : 'Data Deletion Request (GDPR)';
      
      const firstNameLabel = language === 'ru'
        ? 'Имя'
        : language === 'de'
        ? 'Vorname'
        : 'First Name';
      
      const lastNameLabel = language === 'ru'
        ? 'Фамилия'
        : language === 'de'
        ? 'Nachname'
        : 'Last Name';
      
      const dateLabel = language === 'ru'
        ? 'Примерная дата прохождения анкеты'
        : language === 'de'
        ? 'Ungefähres Datum der Fragebogenausfüllung'
        : 'Approximate Date of Questionnaire';
      
      const contactLabel = language === 'ru'
        ? 'Контакт для связи'
        : language === 'de'
        ? 'Kontakt für Rückfragen'
        : 'Contact for inquiries';
      
      const reasonLabel = language === 'ru'
        ? 'Причина запроса'
        : language === 'de'
        ? 'Grund für den Antrag'
        : 'Reason for request';
      
      const notSpecified = language === 'ru'
        ? 'Не указана'
        : language === 'de'
        ? 'Nicht angegeben'
        : 'Not specified';
      
      const countLabel = language === 'ru'
        ? 'Количество найденных анкет'
        : language === 'de'
        ? 'Anzahl der gefundenen Fragebögen'
        : 'Number of found questionnaires';
      
      const contactInfoLabel = language === 'ru'
        ? 'Контактная информация из найденных анкет'
        : language === 'de'
        ? 'Kontaktinformationen aus den gefundenen Fragebögen'
        : 'Contact information from found questionnaires';
      
      // Format date for display
      const formattedDate = deleteRequestDate ? (() => {
        try {
          const date = new Date(deleteRequestDate);
          return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'de' ? 'de-DE' : 'en-US');
        } catch {
          return deleteRequestDate;
        }
      })() : '';
      
      const deletionRequestMarkdown = `**${deletionTitle}**\n\n` +
        `**${firstNameLabel}:** ${deleteRequestFirstName}\n` +
        `**${lastNameLabel}:** ${deleteRequestLastName}\n` +
        `**${dateLabel}:** ${formattedDate}\n\n` +
        `**${contactLabel}:** ${deleteRequestContact}\n\n` +
        `**${reasonLabel}:** ${deleteRequestReason || notSpecified}\n\n` +
        `**${countLabel}:** ${questionnaireIds.length}\n\n` +
        `**ID анкет:** ${questionnaireIds.join(', ')}\n\n` +
        `**${contactInfoLabel}:**\n` +
        contactInfo.map((c, i) => {
          const phone = c.phone ? (c.phoneCountryCode ? 
            (() => {
              const country = countryCodes.find(cc => cc.code === c.phoneCountryCode);
              return country ? `${country.dialCode} ${c.phone}` : c.phone;
            })() : c.phone) : '';
          const telegramText = c.telegram || (language === 'ru' ? 'не указан' : language === 'de' ? 'nicht angegeben' : 'not specified');
          const phoneText = phone || (language === 'ru' ? 'не указан' : language === 'de' ? 'nicht angegeben' : 'not specified');
          return `${i + 1}. Telegram: ${telegramText}, Phone: ${phoneText}`;
        }).join('\n');

      // Send deletion request to Telegram
      const result = await sendToTelegram(deletionRequestMarkdown);

      if (result.success) {
        toast.success(t.deleteRequestSuccess);
        setShowDeleteRequestDialog(false);
        setDeleteRequestFirstName('');
        setDeleteRequestLastName('');
        setDeleteRequestDate('');
        setDeleteRequestContact('');
        setDeleteRequestReason('');
      } else {
        toast.error(result.error || t.deleteRequestError);
      }
    } catch (err) {
      console.error('Error submitting deletion request:', err);
      toast.error(t.deleteRequestError);
    } finally {
      setIsSubmittingDeleteRequest(false);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'de' ? 'de-DE' : 'en-US');
    } catch (err) {
      return new Date(timestamp).toISOString();
    }
  };

  const formatPhone = (phone: string, countryCode?: string): string => {
    if (!phone) return '';
    try {
      // If country code is provided, format with dial code
      if (countryCode && countryCodes.length > 0) {
        const country = countryCodes.find((c) => c.code === countryCode);
        if (country && country.dialCode) {
          return `${country.dialCode} ${phone.trim()}`;
        }
      }
      // If phone already starts with +, return as is
      if (phone.trim().startsWith('+')) {
        return phone.trim();
      }
      // Otherwise return phone as is
      return phone.trim();
    } catch (err) {
      console.error('Error formatting phone:', err);
      return phone.trim();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Home className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>

        <div className="card-wellness space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
                <p className="text-muted-foreground">{t.description}</p>
              </div>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => {
                    clearSession();
                    setIsAuthenticated(false);
                    setShowAuthForm(true);
                    setQuestionnaires([]);
                    setOtpCode('');
                    setAuthTelegram('');
                    setAuthPhone('');
                    toast.success(language === 'ru' ? 'Вы вышли из системы' : language === 'de' ? 'Sie haben sich abgemeldet' : 'You have signed out');
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t.signOut}
                </Button>
              )}
            </div>
            
            {/* Authentication Form */}
            {showAuthForm && !isAuthenticated && (
              <div className="mt-6 p-6 border border-border rounded-xl bg-card space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{t.authTitle}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t.authDesc}</p>
                
                {!showOtpInput ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        {language === 'ru' ? 'Telegram' : language === 'de' ? 'Telegram' : 'Telegram'}
                      </label>
                      <input
                        type="text"
                        className="input-field w-full"
                        value={authTelegram}
                        onChange={(e) => setAuthTelegram(e.target.value)}
                        placeholder={language === 'ru' ? '@username или username' : language === 'de' ? '@username oder username' : '@username or username'}
                        disabled={isSendingOtp}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        {language === 'ru' ? 'Телефон' : language === 'de' ? 'Telefon' : 'Phone'}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative" style={{ minWidth: '100px' }}>
                          <select
                            className="input-field w-full"
                            value={authPhoneCountryCode}
                            onChange={(e) => setAuthPhoneCountryCode(e.target.value)}
                            disabled={isSendingOtp}
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.flag} {country.dialCode}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="tel"
                          className="input-field flex-1"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder={language === 'ru' ? '123 456 7890' : language === 'de' ? '123 456 7890' : '123 456 7890'}
                          disabled={isSendingOtp}
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleSendOTP}
                      disabled={isSendingOtp || (!authTelegram.trim() && !authPhone.trim())}
                      className="w-full"
                    >
                      {isSendingOtp ? (
                        language === 'ru' ? 'Отправка...' : language === 'de' ? 'Wird gesendet...' : 'Sending...'
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t.sendCode}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t.enterCode}
                      </label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otpCode}
                          onChange={(value) => setOtpCode(value)}
                          disabled={isVerifyingOtp}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowOtpInput(false);
                          setOtpCode('');
                        }}
                        disabled={isVerifyingOtp}
                        className="flex-1"
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isVerifyingOtp || otpCode.length !== 6}
                        className="flex-1"
                      >
                        {isVerifyingOtp ? (
                          language === 'ru' ? 'Проверка...' : language === 'de' ? 'Wird überprüft...' : 'Verifying...'
                        ) : (
                          t.verifyCode
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isAuthenticated && questionnaires.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteRequest}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.deleteRequest}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {language === 'ru' ? 'Загрузка...' : language === 'de' ? 'Laden...' : 'Loading...'}
                </p>
              </div>
            )}
            {error && !isLoading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">
                  {language === 'ru' ? 'Ошибка загрузки анкет:' : language === 'de' ? 'Fehler beim Laden der Fragebögen:' : 'Error loading questionnaires:'} {error}
                </p>
              </div>
            )}
            {!isLoading && isAuthenticated && questionnaires.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {language === 'ru' ? 'Отправленные анкеты' : language === 'de' ? 'Gesendete Fragebögen' : 'Submitted Questionnaires'} ({questionnaires.length})
                </h2>
                {questionnaires.map((questionnaire) => (
                  <div
                    key={questionnaire.id}
                    className="border border-border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {getQuestionnaireTitle(questionnaire.type, language)}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{t.submittedAt}: {formatDate(questionnaire.submittedAt || Date.now())}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {questionnaire.contactData?.telegram && (
                              <div className="flex items-center gap-2 text-sm">
                                <MessageCircle className="w-4 h-4" />
                                <span>Telegram: {questionnaire.contactData.telegram}</span>
                              </div>
                            )}
                            {questionnaire.contactData?.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{t.phone}: {formatPhone(questionnaire.contactData.phone, questionnaire.contactData.phoneCountryCode)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(questionnaire)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t.view}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(questionnaire)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          {t.edit}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && isAuthenticated && questionnaires.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t.noQuestionnaires}</h3>
                <p className="text-muted-foreground">{t.noQuestionnairesDesc}</p>
              </div>
            )}
            
            {!isLoading && !isAuthenticated && !showAuthForm && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'ru' ? 'Требуется авторизация' : language === 'de' ? 'Anmeldung erforderlich' : 'Authentication required'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'ru' ? 'Пожалуйста, войдите, чтобы просмотреть ваши анкеты.' : language === 'de' ? 'Bitte melden Sie sich an, um Ihre Fragebögen anzuzeigen.' : 'Please sign in to view your questionnaires.'}
                </p>
                <Button
                  onClick={() => setShowAuthForm(true)}
                >
                  {t.authTitle}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View Dialog */}
      {showViewDialog && selectedQuestionnaire && (
        <MarkdownPreview
          markdown={selectedQuestionnaire.markdown}
          onClose={() => setShowViewDialog(false)}
        />
      )}

      {/* Delete Request Dialog */}
      {showDeleteRequestDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-foreground">{t.deleteRequestTitle}</h2>
            <p className="text-muted-foreground text-sm">{t.deleteRequestDesc}</p>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.firstName} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={deleteRequestFirstName}
                onChange={(e) => setDeleteRequestFirstName(e.target.value)}
                placeholder={language === 'ru' ? 'Введите имя' : language === 'de' ? 'Geben Sie den Vornamen ein' : 'Enter first name'}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.lastName} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={deleteRequestLastName}
                onChange={(e) => setDeleteRequestLastName(e.target.value)}
                placeholder={language === 'ru' ? 'Введите фамилию' : language === 'de' ? 'Geben Sie den Nachnamen ein' : 'Enter last name'}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.approximateDate} <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                className="input-field w-full"
                value={deleteRequestDate}
                onChange={(e) => setDeleteRequestDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.contactForInquiry} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={deleteRequestContact}
                onChange={(e) => setDeleteRequestContact(e.target.value)}
                placeholder={language === 'ru' ? '@username или +49 123 456 7890' : language === 'de' ? '@username oder +49 123 456 7890' : '@username or +49 123 456 7890'}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.reasonOptional}
              </label>
              <textarea
                className="input-field w-full min-h-[100px] resize-y"
                value={deleteRequestReason}
                onChange={(e) => setDeleteRequestReason(e.target.value)}
                placeholder={language === 'ru' ? 'Опишите причину запроса на удаление...' : language === 'de' ? 'Beschreiben Sie den Grund für den Löschantrag...' : 'Describe the reason for deletion request...'}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteRequestDialog(false);
                  setDeleteRequestFirstName('');
                  setDeleteRequestLastName('');
                  setDeleteRequestDate('');
                  setDeleteRequestContact('');
                  setDeleteRequestReason('');
                }}
                disabled={isSubmittingDeleteRequest}
              >
                {t.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmitDeleteRequest}
                disabled={isSubmittingDeleteRequest || !deleteRequestFirstName.trim() || !deleteRequestLastName.trim() || !deleteRequestDate.trim() || !deleteRequestContact.trim()}
              >
                {isSubmittingDeleteRequest ? (
                  language === 'ru' ? 'Отправка...' : language === 'de' ? 'Wird gesendet...' : 'Sending...'
                ) : (
                  t.requestDelete
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default DataRequest;
