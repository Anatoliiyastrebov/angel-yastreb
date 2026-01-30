import React from 'react';
import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  language: 'ru' | 'en' | 'de';
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps, language }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const stepText = {
    ru: 'Шаг',
    en: 'Step',
    de: 'Schritt',
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-medical-600">
          {stepText[language]} {currentStep + 1} {language === 'ru' ? 'из' : language === 'de' ? 'von' : 'of'} {totalSteps}
        </span>
        <span className="text-sm font-medium text-medical-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-medical-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

