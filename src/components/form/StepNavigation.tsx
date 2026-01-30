import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  language: 'ru' | 'en' | 'de';
  isLastStep: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastStep,
  onSubmit,
  isSubmitting = false,
  language,
}) => {
  const nextText = {
    ru: 'Далее',
    en: 'Next',
    de: 'Weiter',
  };

  const previousText = {
    ru: 'Назад',
    en: 'Previous',
    de: 'Zurück',
  };

  const submitText = {
    ru: 'Отправить',
    en: 'Submit',
    de: 'Absenden',
  };

  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-medical-200">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious || isSubmitting}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        {previousText[language]}
      </Button>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {language === 'ru' ? 'Отправка...' : language === 'de' ? 'Wird gesendet...' : 'Submitting...'}
            </>
          ) : (
            <>
              {submitText[language]}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className="flex items-center gap-2"
        >
          {nextText[language]}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

