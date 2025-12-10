import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Phone, ChevronDown } from 'lucide-react';
import { countryCodes, defaultCountryCode, type CountryCode } from '@/lib/country-codes';

interface ContactSectionProps {
  telegram: string;
  phone: string;
  phoneCountryCode?: string;
  telegramError?: string;
  phoneError?: string;
  contactMethodError?: string;
  onTelegramChange: (telegram: string) => void;
  onPhoneChange: (phone: string) => void;
  onCountryCodeChange: (countryCode: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  telegram,
  phone,
  phoneCountryCode = defaultCountryCode,
  telegramError,
  phoneError,
  contactMethodError,
  onTelegramChange,
  onPhoneChange,
  onCountryCodeChange,
}) => {
  const { language, t } = useLanguage();
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countryCodes.find(c => c.code === phoneCountryCode) || countryCodes.find(c => c.code === defaultCountryCode)!;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    onCountryCodeChange(country.code);
    setIsCountryDropdownOpen(false);
    
    // If phone already has a dial code, replace it with the new one
    if (phone.trim()) {
      const phoneWithoutCode = phone.replace(/^\+\d+\s*/, '').trim();
      onPhoneChange(phoneWithoutCode);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove any existing country code if user types manually
    const cleaned = value.replace(/^\+\d+\s*/, '');
    onPhoneChange(cleaned);
  };

  const getFullPhoneNumber = () => {
    if (!phone.trim()) return '';
    return `${selectedCountry.dialCode} ${phone.trim()}`;
  };


  return (
    <div className="card-wellness space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          {t('contactMethod')}
          <span className="text-destructive">*</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {language === 'ru' 
            ? 'Укажите Telegram или телефон для доступа к вашим анкетам с любого устройства. Код подтверждения будет отправлен на указанный контакт.'
            : language === 'de'
            ? 'Geben Sie Telegram oder Telefon an, um von jedem Gerät auf Ihre Fragebögen zuzugreifen. Ein Bestätigungscode wird an den angegebenen Kontakt gesendet.'
            : 'Provide Telegram or phone to access your questionnaires from any device. A verification code will be sent to the specified contact.'}
        </p>
      </div>

      {contactMethodError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">
            <AlertCircleIcon />
            {contactMethodError}
          </p>
        </div>
      )}

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">
          {t('telegram')}
        </label>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            className={`input-field pl-10 ${telegramError ? 'input-error' : ''}`}
            value={telegram}
            onChange={(e) => onTelegramChange(e.target.value)}
            placeholder={t('telegramHint') || '@username или username'}
          />
        </div>
        {telegramError && (
          <p className="error-message mt-1">
            <AlertCircleIcon />
            {telegramError}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">
          {t('phone') || 'Телефон'}
        </label>
        <div className="flex gap-2">
          {/* Country Code Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-input bg-background rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring min-w-[100px]"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {isCountryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-y-auto bg-background border border-input rounded-lg shadow-lg">
                {countryCodes.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-accent text-left ${
                      country.code === phoneCountryCode ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm">{country.name[language]}</span>
                    <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Input */}
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              className={`input-field pl-10 ${phoneError ? 'input-error' : ''}`}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={language === 'ru' ? '123 456 7890' : language === 'de' ? '123 456 7890' : '123 456 7890'}
            />
          </div>
        </div>
        {phone && phone.trim() && (
          <p className="text-xs text-muted-foreground mt-1">
            {getFullPhoneNumber()}
          </p>
        )}
        {phoneError && (
          <p className="error-message mt-1">
            <AlertCircleIcon />
            {phoneError}
          </p>
        )}
      </div>
    </div>
  );
};

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
