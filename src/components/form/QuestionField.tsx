import React from 'react';
import { Question } from '@/lib/questionnaire-data';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectionIcon } from '@/components/icons/SectionIcons';

interface QuestionFieldProps {
  question: Question;
  value: string | string[];
  additionalValue: string;
  error?: string;
  additionalError?: string;
  onChange: (value: string | string[]) => void;
  onAdditionalChange: (value: string) => void;
  formData?: { [key: string]: string | string[] };
}

const QuestionFieldComponent: React.FC<QuestionFieldProps> = ({
  question,
  value,
  additionalValue,
  error,
  additionalError,
  onChange,
  onAdditionalChange,
  formData,
}) => {
  const { language, t } = useLanguage();

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    
    // Special handling for "no_issues" option
    if (optionValue === 'no_issues') {
    if (checked) {
        // If "no_issues" is selected, clear all other options
        onChange(['no_issues']);
      } else {
        // If "no_issues" is deselected, just remove it
        onChange([]);
      }
    } else {
      // For other options
      if (checked) {
        // Remove "no_issues" if it exists, then add the new option
        const filteredValues = currentValues.filter((v) => v !== 'no_issues');
        onChange([...filteredValues, optionValue]);
    } else {
      onChange(currentValues.filter((v) => v !== optionValue));
      }
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            className={`input-field ${error ? 'input-error' : ''}`}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder?.[language] || ''}
          />
        );

      case 'number':
        // Special handling for age_months - only integers allowed
        const isAgeMonths = question.id === 'age_months';
        const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value;
          if (isAgeMonths) {
            // Only allow integers for age_months
            const intValue = inputValue.replace(/[^0-9]/g, '');
            if (intValue === '' || intValue === '0') {
              onChange('');
            } else {
              onChange(intValue);
            }
          } else {
            onChange(inputValue);
          }
        };
        
        return (
          <input
            type="number"
            className={`input-field ${error ? 'input-error' : ''}`}
            value={value as string}
            onChange={handleNumberChange}
            min={question.min !== undefined ? question.min : 0}
            max={question.max !== undefined ? question.max : undefined}
            step={isAgeMonths ? "1" : "0.1"}
            onKeyDown={isAgeMonths ? (e) => {
              // Prevent decimal point and other non-integer characters
              if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                e.preventDefault();
              }
            } : undefined}
          />
        );

      case 'textarea':
        return (
          <textarea
            className={`input-field min-h-[100px] resize-y ${error ? 'input-error' : ''}`}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder?.[language] || ''}
          />
        );

      case 'radio':
        return (
          <div className="flex flex-wrap gap-3">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
                  value === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{option.label[language]}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const currentValues = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-3">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
                  currentValues.includes(option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={currentValues.includes(option.value)}
                  onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{option.label[language]}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Check if what_else field should be required (when what_else_question === 'yes')
  const isWhatElseRequired = question.id === 'what_else' && formData && formData['what_else_question'] === 'yes';

  return (
    <div className="space-y-3 animate-fade-in">
      <label className="flex items-center gap-2 text-foreground font-medium">
        <SectionIcon name={question.icon} />
        <span>{question.label[language]}</span>
        {(question.required || isWhatElseRequired) && <span className="text-destructive">*</span>}
      </label>

      {renderInput()}

      {error && (
        <p className="error-message">
          <AlertCircleIcon />
          {error}
        </p>
      )}

      {question.hasAdditional && (() => {
        // For injuries question, show additional field only if options other than "no_issues" are selected
        if (question.id === 'injuries') {
          const currentValues = Array.isArray(value) ? value : [];
          const hasOtherThanNoIssues = currentValues.some((val: string) => val !== 'no_issues');
          if (!hasOtherThanNoIssues) {
            return null;
          }
        }
        
        // For illness_antibiotics question, show additional field only if "took_antibiotics", "took_medications" or "both" are selected
        if (question.id === 'illness_antibiotics') {
          const currentValues = Array.isArray(value) ? value : [];
          const hasAntibioticsOrMedications = currentValues.includes('took_antibiotics') || 
                                             currentValues.includes('took_medications') || 
                                             currentValues.includes('both');
          if (!hasAntibioticsOrMedications) {
            return null;
          }
        }
        
        // For pregnancy_problems question, show additional field only if "yes" is selected
        if (question.id === 'pregnancy_problems') {
          if (value !== 'yes') {
            return null;
          }
        }
        
        // For allergies question, show additional field only if "other" is selected
        if (question.id === 'allergies') {
          const currentValues = Array.isArray(value) ? value : [];
          const hasOther = currentValues.includes('other');
          if (!hasOther) {
            return null;
          }
        }
        
        // For skin_condition question, show additional field only if "other" is selected
        if (question.id === 'skin_condition') {
          const currentValues = Array.isArray(value) ? value : [];
          const hasOther = currentValues.includes('other');
          if (!hasOther) {
            return null;
          }
        }
        
        // For sleep question, show additional field only if "other" is selected
        if (question.id === 'sleep') {
          const sleepValue = Array.isArray(value) ? value[0] : value;
          const hasOther = sleepValue === 'other';
          if (!hasOther) {
            return null;
          }
        }
        
        // For operations question, show additional field only if "yes" is selected
        if (question.id === 'operations') {
          const operationsValue = Array.isArray(value) ? value[0] : value;
          const hasYes = operationsValue === 'yes';
          if (!hasYes) {
            return null;
          }
        }
        
        // For what_else_question, show additional field only if "yes" is selected
        if (question.id === 'what_else_question') {
          const whatElseValue = Array.isArray(value) ? value[0] : value;
          const hasYes = whatElseValue === 'yes';
          if (!hasYes) {
            return null;
          }
        }
        
        const isRequired = question.id === 'injuries' || question.id === 'pregnancy_problems' || question.id === 'what_else' || question.id === 'allergies' || question.id === 'skin_condition' || question.id === 'sleep' || question.id === 'operations';
        
        return (
          <div className="mt-2">
            <label className="text-sm text-muted-foreground mb-1 block">
              {question.id === 'illness_antibiotics' 
                ? (language === 'ru' ? 'Укажите что именно (необязательно)' : language === 'de' ? 'Geben Sie an, was genau (optional)' : 'Specify what exactly (optional)')
                : question.id === 'pregnancy_problems'
                ? (language === 'ru' ? 'Опишите проблему' : language === 'de' ? 'Beschreiben Sie das Problem' : 'Describe the problem')
                : question.id === 'operations'
                ? (language === 'ru' ? 'Опишите какая операция была' : language === 'de' ? 'Beschreiben Sie, welche Operation durchgeführt wurde' : 'Describe what operation was performed')
                : t('additionalInfo')}
              {isRequired && <span className="text-destructive ml-1">*</span>}
              {additionalError && !isRequired && question.id !== 'illness_antibiotics' && <span className="text-destructive ml-1">*</span>}
            </label>
            <textarea
              className={`input-field text-sm min-h-[60px] resize-y ${additionalError ? 'input-error' : ''}`}
              value={additionalValue}
              onChange={(e) => onAdditionalChange(e.target.value)}
              placeholder={t('additionalInfo')}
            />
            {additionalError && (
              <p className="error-message mt-1">
                <AlertCircleIcon />
                {additionalError}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const QuestionField = React.memo(QuestionFieldComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.question.id === nextProps.question.id &&
    prevProps.value === nextProps.value &&
    prevProps.additionalValue === nextProps.additionalValue &&
    prevProps.error === nextProps.error &&
    prevProps.additionalError === nextProps.additionalError &&
    JSON.stringify(prevProps.formData) === JSON.stringify(nextProps.formData)
  );
});

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
