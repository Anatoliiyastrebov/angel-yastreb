import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShieldCheck } from 'lucide-react';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { language } = useLanguage();

  const privacyPolicy = {
    ru: {
      title: 'Политика конфиденциальности',
      sections: [
        {
          title: 'Какие данные мы собираем',
          content: 'Мы собираем персональные данные, которые вы предоставляете в анкете: имя, возраст, вес, информацию о состоянии здоровья, симптомы, жалобы, аллергии, историю болезней и контактные данные (Telegram или Instagram).',
        },
        {
          title: 'Зачем мы собираем данные',
          content: 'Данные собираются исключительно для предоставления консультации по здоровью. Мы используем эту информацию для анализа вашего состояния и подготовки рекомендаций.',
        },
        {
          title: 'Куда отправляются данные',
          content: 'Данные отправляются в Telegram-бот через официальный API Telegram. Сообщение с вашей анкетой отправляется в защищенный чат для обработки консультантом.',
        },
        {
          title: 'Как долго хранятся данные',
          content: 'Данные хранятся в Telegram-чате до момента завершения консультации. После завершения консультации вы можете запросить удаление ваших данных.',
        },
        {
          title: 'Ваши права',
          content: 'В соответствии с GDPR/DSGVO вы имеете право на доступ к вашим данным, их исправление, удаление, ограничение обработки, переносимость данных и возражение против обработки. Вы можете в любое время отозвать согласие на обработку данных.',
        },
        {
          title: 'Как запросить удаление данных',
          content: 'Для запроса удаления ваших данных свяжитесь с нами через Telegram или Instagram, указав ваше имя и дату заполнения анкеты. Мы удалим ваши данные в течение 30 дней с момента запроса.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        {
          title: 'What data we collect',
          content: 'We collect personal data that you provide in the questionnaire: name, age, weight, health information, symptoms, complaints, allergies, medical history, and contact details (Telegram or Instagram).',
        },
        {
          title: 'Why we collect data',
          content: 'Data is collected solely for the purpose of providing health consultation. We use this information to analyze your condition and prepare recommendations.',
        },
        {
          title: 'Where data is sent',
          content: 'Data is sent to a Telegram bot through the official Telegram API. The message with your questionnaire is sent to a secure chat for processing by a consultant.',
        },
        {
          title: 'How long data is stored',
          content: 'Data is stored in the Telegram chat until the consultation is completed. After completion, you can request deletion of your data.',
        },
        {
          title: 'Your rights',
          content: 'In accordance with GDPR, you have the right to access your data, correct it, delete it, restrict processing, data portability, and object to processing. You can withdraw your consent to data processing at any time.',
        },
        {
          title: 'How to request data deletion',
          content: 'To request deletion of your data, contact us via Telegram or Instagram, providing your name and the date you filled out the questionnaire. We will delete your data within 30 days of the request.',
        },
      ],
    },
    de: {
      title: 'Datenschutzerklärung',
      sections: [
        {
          title: 'Welche Daten wir sammeln',
          content: 'Wir sammeln personenbezogene Daten, die Sie im Fragebogen angeben: Name, Alter, Gewicht, Gesundheitsinformationen, Symptome, Beschwerden, Allergien, Krankengeschichte und Kontaktdaten (Telegram oder Instagram).',
        },
        {
          title: 'Warum wir Daten sammeln',
          content: 'Daten werden ausschließlich für die Bereitstellung einer Gesundheitsberatung gesammelt. Wir verwenden diese Informationen zur Analyse Ihres Zustands und zur Vorbereitung von Empfehlungen.',
        },
        {
          title: 'Wohin Daten gesendet werden',
          content: 'Daten werden über die offizielle Telegram-API an einen Telegram-Bot gesendet. Die Nachricht mit Ihrem Fragebogen wird an einen sicheren Chat zur Bearbeitung durch einen Berater gesendet.',
        },
        {
          title: 'Wie lange Daten gespeichert werden',
          content: 'Daten werden im Telegram-Chat gespeichert, bis die Beratung abgeschlossen ist. Nach Abschluss können Sie die Löschung Ihrer Daten anfordern.',
        },
        {
          title: 'Ihre Rechte',
          content: 'Gemäß DSGVO haben Sie das Recht auf Zugang zu Ihren Daten, deren Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung. Sie können Ihre Einwilligung zur Datenverarbeitung jederzeit widerrufen.',
        },
        {
          title: 'Wie Sie die Löschung von Daten anfordern können',
          content: 'Um die Löschung Ihrer Daten anzufordern, kontaktieren Sie uns über Telegram oder Instagram und geben Sie Ihren Namen und das Datum der Fragebogenausfüllung an. Wir löschen Ihre Daten innerhalb von 30 Tagen nach der Anfrage.',
        },
      ],
    },
  };

  const policy = privacyPolicy[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {policy.title}
          </DialogTitle>
          <DialogDescription>
            {language === 'ru'
              ? 'Информация о сборе и обработке персональных данных'
              : language === 'de'
              ? 'Informationen zur Erhebung und Verarbeitung personenbezogener Daten'
              : 'Information about collection and processing of personal data'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {policy.sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

