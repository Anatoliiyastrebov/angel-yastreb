import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, ChevronDown } from 'lucide-react';
import { countryCodes, defaultCountryCode, type CountryCode } from '@/lib/country-codes';
import type { ContactData } from '@/lib/form-utils';
import { cn } from '@/lib/utils';

export interface ContactSectionErrors {
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  viber?: string;
  instagram?: string;
  vk?: string;
  contact_method?: string;
}

interface ContactSectionProps {
  value: Pick<
    ContactData,
    'phone' | 'phoneCountryCode' | 'customDialCode' | 'telegram' | 'whatsapp' | 'viber' | 'instagram' | 'vk'
  >;
  errors: ContactSectionErrors;
  onChange: (patch: Partial<ContactData>) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  value: {
    phone = '',
    phoneCountryCode = defaultCountryCode,
    customDialCode: externalCustomDialCode,
    telegram = '',
    whatsapp = '',
    viber = '',
    instagram = '',
    vk = '',
  },
  errors,
  onChange,
}) => {
  const { language, t } = useLanguage();
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [dialCodeInput, setDialCodeInput] = useState('');
  const [isEditingDialCode, setIsEditingDialCode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialCodeInputRef = useRef<HTMLInputElement>(null);

  const isCustom = phoneCountryCode === 'CUSTOM';
  const selectedCountry = isCustom
    ? null
    : countryCodes.find((c) => c.code === phoneCountryCode) ||
      countryCodes.find((c) => c.code === defaultCountryCode)!;
  const currentDialCode = isCustom ? externalCustomDialCode || '' : selectedCountry?.dialCode || '+49';

  const filteredCountries = countrySearch.trim()
    ? countryCodes.filter((c) => {
        const search = countrySearch.toLowerCase();
        return (
          c.name[language].toLowerCase().includes(search) ||
          c.name.en.toLowerCase().includes(search) ||
          c.dialCode.includes(search) ||
          c.code.toLowerCase().includes(search)
        );
      })
    : countryCodes;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setCountrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCountryDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isCountryDropdownOpen]);

  const handleCountrySelect = (country: CountryCode) => {
    onChange({ phoneCountryCode: country.code });
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
    setIsEditingDialCode(false);

    if (phone.trim()) {
      const phoneWithoutCode = phone.replace(/^\+\d+\s*/, '').trim();
      onChange({ phone: phoneWithoutCode });
    }
  };

  const handleDialCodeInputChange = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, '');
    const formatted = cleaned.startsWith('+') ? cleaned : cleaned ? `+${cleaned}` : '';
    setDialCodeInput(formatted);

    const match = countryCodes.find((c) => c.dialCode === formatted);
    if (match) {
      onChange({ phoneCountryCode: match.code });
      setIsEditingDialCode(false);
    }
  };

  const handleDialCodeBlur = () => {
    const value = dialCodeInput.trim();
    if (value && value !== '+') {
      const match = countryCodes.find((c) => c.dialCode === value);
      if (match) {
        onChange({ phoneCountryCode: match.code });
      } else {
        onChange({ phoneCountryCode: 'CUSTOM', customDialCode: value });
      }
    }
    setIsEditingDialCode(false);
  };

  const startEditingDialCode = () => {
    setDialCodeInput(currentDialCode);
    setIsEditingDialCode(true);
    setTimeout(() => dialCodeInputRef.current?.focus(), 50);
  };

  const handlePhoneChange = (v: string) => {
    const cleaned = v.replace(/^\+\d+\s*/, '');
    onChange({ phone: cleaned });
  };

  const getFullPhoneNumber = () => {
    if (!phone.trim()) return '';
    return `${currentDialCode} ${phone.trim()}`;
  };

  const inputClass = 'w-full rounded-md border border-medical-300 bg-white px-2.5 py-1.5 text-sm text-medical-900 placeholder:text-medical-400 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-4 md:p-5 border border-medical-200 shadow-sm space-y-3.5"
      data-section="contact"
    >
      <div className="flex items-start gap-2.5">
        <Phone className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg md:text-xl font-semibold text-medical-800 leading-tight">
            {t('contactMethod')}
            <span className="text-destructive ml-0.5">*</span>
          </h2>
          <p className="text-xs text-medical-600 mt-1.5 leading-snug">{t('contactRequirementHint')}</p>
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label htmlFor="phone" className="text-xs font-medium text-medical-800">
          {t('phone')}
          <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-1.5">
          <div className="relative shrink-0" ref={dropdownRef}>
            <div className="flex items-center border border-medical-300 bg-white rounded-md min-h-[38px] overflow-hidden">
              {isEditingDialCode ? (
                <input
                  ref={dialCodeInputRef}
                  type="text"
                  value={dialCodeInput}
                  onChange={(e) => handleDialCodeInputChange(e.target.value)}
                  onBlur={handleDialCodeBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDialCodeBlur();
                  }}
                  className="w-[76px] px-2 py-1.5 text-sm font-medium bg-transparent focus:outline-none"
                  placeholder="+..."
                />
              ) : (
                <button
                  type="button"
                  onClick={startEditingDialCode}
                  className="flex items-center gap-1 px-2 py-1.5 hover:bg-medical-50 focus:outline-none"
                  title={
                    language === 'ru'
                      ? 'Нажмите, чтобы ввести код'
                      : language === 'de'
                        ? 'Klicken, um Code einzugeben'
                        : 'Click to enter code'
                  }
                >
                  <span className="text-base leading-none">{selectedCountry?.flag || '🌍'}</span>
                  <span className="text-xs font-medium tabular-nums">{currentDialCode}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="px-1 py-1.5 hover:bg-medical-50 focus:outline-none border-l border-medical-200"
                aria-expanded={isCountryDropdownOpen}
                aria-label={
                  language === 'ru' ? 'Выбор страны' : language === 'de' ? 'Land auswählen' : 'Choose country'
                }
              >
                <ChevronDown className="w-3.5 h-3.5 text-medical-400" />
              </button>
            </div>

            {isCountryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-[min(100vw-2rem,18rem)] max-h-64 bg-white border border-medical-300 rounded-md shadow-lg flex flex-col">
                <div className="sticky top-0 bg-white p-1.5 border-b border-medical-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={
                      language === 'ru' ? 'Поиск...' : language === 'de' ? 'Suchen...' : 'Search...'
                    }
                    className="w-full px-2 py-1.5 text-xs border border-medical-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                  />
                </div>
                <div className="overflow-y-auto max-h-52">
                  {filteredCountries.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-medical-500 text-center">
                      {language === 'ru' ? 'Ничего не найдено' : language === 'de' ? 'Nichts gefunden' : 'Nothing found'}
                    </div>
                  ) : (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-medical-50 text-left min-h-[36px] text-xs',
                          country.code === phoneCountryCode ? 'bg-primary-50 font-medium' : ''
                        )}
                      >
                        <span>{country.flag}</span>
                        <span className="flex-1 truncate">{country.name[language]}</span>
                        <span className="text-medical-600 whitespace-nowrap tabular-nums">{country.dialCode}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0" data-question-id="phone" data-error={!!errors.phone}>
            <input
              type="tel"
              id="phone"
              autoComplete="tel-national"
              className={cn(inputClass, errors.phone ? 'border-destructive focus:border-destructive' : '')}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="123 456 7890"
            />
          </div>
        </div>
        {phone.trim() !== '' && <p className="text-[11px] text-medical-500 tabular-nums">{getFullPhoneNumber()}</p>}
        {errors.phone && (
          <p className="error-message text-xs mt-0.5 flex items-start gap-1">
            <AlertCircleIcon />
            {errors.phone}
          </p>
        )}
      </div>

      {/* Messengers — compact grid */}
      <div className="pt-1 border-t border-medical-100 space-y-2">
        <p className="text-xs font-medium text-medical-800">
          {t('messengersShortTitle')}
          <span className="text-destructive">*</span>
        </p>
        {errors.contact_method && (
          <p className="text-xs text-destructive flex items-start gap-1 bg-destructive/5 rounded px-2 py-1.5 border border-destructive/15">
            <AlertCircleIcon />
            {errors.contact_method}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
          <CompactField
            id="telegram"
            label={t('telegram')}
            placeholder={t('telegramHint')}
            value={telegram}
            error={errors.telegram}
            inputClass={inputClass}
            onChange={(v) => onChange({ telegram: v })}
          />
          <CompactField
            id="whatsapp"
            label={t('whatsapp')}
            placeholder={t('whatsappHint')}
            value={whatsapp}
            error={errors.whatsapp}
            inputClass={inputClass}
            onChange={(v) => onChange({ whatsapp: v })}
          />
          <CompactField
            id="viber"
            label={t('viber')}
            placeholder={t('viberHint')}
            value={viber}
            error={errors.viber}
            inputClass={inputClass}
            onChange={(v) => onChange({ viber: v })}
          />
          <CompactField
            id="instagram"
            label={t('instagram')}
            placeholder={t('instagramHint')}
            value={instagram}
            error={errors.instagram}
            inputClass={inputClass}
            onChange={(v) => onChange({ instagram: v })}
          />
          <CompactField
            id="vk"
            label={t('vk')}
            placeholder={t('vkHint')}
            value={vk}
            error={errors.vk}
            inputClass={inputClass}
            onChange={(v) => onChange({ vk: v })}
          />
        </div>
      </div>
    </motion.div>
  );
};

const CompactField: React.FC<{
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  inputClass: string;
  onChange: (v: string) => void;
}> = ({ id, label, placeholder, value, error, inputClass, onChange }) => (
  <div data-question-id={id} data-error={!!error}>
    <label htmlFor={id} className="text-[11px] font-medium text-medical-600 mb-0.5 block truncate">
      {label}
    </label>
    <input
      type="text"
      id={id}
      className={cn(inputClass, error ? 'border-destructive' : '')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
    />
    {error && (
      <p className="error-message text-[11px] mt-0.5 flex items-start gap-1">
        <AlertCircleIcon />
        {error}
      </p>
    )}
  </div>
);

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 mt-0.5"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
