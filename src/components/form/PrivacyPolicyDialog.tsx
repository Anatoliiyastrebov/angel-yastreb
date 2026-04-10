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
          title: 'Контролер данных',
          content: 'Контролером данных является оператор данного сайта. Для запросов по обработке данных используйте контактные данные, указанные в Impressum.',
        },
        {
          title: 'Правовая основа обработки',
          content: 'Обработка персональных данных осуществляется на основании вашего добровольного согласия (ст. 6 п. 1 лит. a GDPR). Вы можете в любое время отозвать свое согласие.',
        },
        {
          title: 'Какие данные мы собираем',
          content: 'Мы собираем только данные, которые вы добровольно предоставляете: ответы анкеты, контактные данные (включая email/Telegram/Instagram) и технические данные, необходимые для работы сайта.',
        },
        {
          title: 'Зачем мы собираем данные',
          content: 'Данные используются для обработки запроса, обратной связи и предоставления информационных материалов. Данные не применяются для автоматизированного принятия решений или профилирования.',
        },
        {
          title: 'Куда отправляются данные',
          content: 'Передача данных третьим лицам осуществляется только при технической необходимости (например, хостинг или каналы связи). Если используется Telegram, обработка осуществляется в рамках их политики конфиденциальности.',
        },
        {
          title: 'Как долго хранятся данные',
          content: 'Данные хранятся только столько, сколько необходимо для целей обработки, либо до отзыва согласия/законного требования удаления.',
        },
        {
          title: 'Ваши права',
          content: 'В соответствии с GDPR/DSGVO вы имеете право: на доступ к вашим данным (ст. 15 GDPR), их исправление (ст. 16 GDPR), удаление (ст. 17 GDPR), ограничение обработки (ст. 18 GDPR), переносимость данных (ст. 20 GDPR) и возражение против обработки (ст. 21 GDPR). Вы можете в любое время отозвать согласие на обработку данных без влияния на законность обработки, основанную на согласии до его отзыва.',
        },
        {
          title: 'Право на подачу жалобы',
          content: 'Вы имеете право подать жалобу в надзорный орган по защите данных, если считаете, что обработка ваших персональных данных нарушает GDPR. В Германии это Федеральный уполномоченный по защите данных и свободе информации (BfDI).',
        },
        {
          title: 'Как реализовать ваши права',
          content: 'Для реализации ваших прав (доступ, исправление, удаление и т.д.) свяжитесь с нами через Telegram или Instagram, указав ваше имя и дату заполнения анкеты. Мы обработаем ваш запрос в течение 30 дней с момента получения.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        {
          title: 'Data Controller',
          content: 'The data controller is the operator of this website. For data-processing requests, please use the contact details listed in the Impressum.',
        },
        {
          title: 'Legal Basis for Processing',
          content: 'The processing of personal data is based on your voluntary consent (Art. 6 para. 1 lit. a GDPR). You can withdraw your consent at any time.',
        },
        {
          title: 'What data we collect',
          content: 'We collect only data you provide voluntarily: questionnaire responses, contact details (including email/Telegram/Instagram), and technical data required to operate the website.',
        },
        {
          title: 'Why we collect data',
          content: 'Data is used to process your request, communicate with you, and provide informational content. Data is not used for automated decision-making or profiling.',
        },
        {
          title: 'Where data is sent',
          content: 'Data is shared with third parties only where technically necessary (e.g., hosting or communication channels). If Telegram is used, processing is subject to Telegram’s own privacy policy.',
        },
        {
          title: 'How long data is stored',
          content: 'Data is stored only for as long as required for the stated purposes, or until consent is withdrawn / deletion is legally required.',
        },
        {
          title: 'Your rights',
          content: 'In accordance with GDPR, you have the right to: access your data (Art. 15 GDPR), correct it (Art. 16 GDPR), delete it (Art. 17 GDPR), restrict processing (Art. 18 GDPR), data portability (Art. 20 GDPR), and object to processing (Art. 21 GDPR). You can withdraw your consent to data processing at any time without affecting the lawfulness of processing based on consent before its withdrawal.',
        },
        {
          title: 'Right to lodge a complaint',
          content: 'You have the right to lodge a complaint with a data protection supervisory authority if you believe that the processing of your personal data violates GDPR. In Germany, this is the Federal Commissioner for Data Protection and Freedom of Information (BfDI).',
        },
        {
          title: 'How to exercise your rights',
          content: 'To exercise your rights (access, correction, deletion, etc.), contact us via Telegram or Instagram, providing your name and the date you filled out the questionnaire. We will process your request within 30 days of receipt.',
        },
      ],
    },
    de: {
      title: 'Datenschutzerklärung',
      sections: [
        {
          title: 'Verantwortlicher',
          content: 'Verantwortlich für die Datenverarbeitung ist der Betreiber dieser Website. Für Anfragen zur Datenverarbeitung nutzen Sie bitte die im Impressum genannten Kontaktdaten.',
        },
        {
          title: 'Rechtsgrundlage der Verarbeitung',
          content: 'Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage Ihrer freiwilligen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können Ihre Einwilligung jederzeit widerrufen.',
        },
        {
          title: 'Welche Daten wir sammeln',
          content: 'Wir verarbeiten nur Daten, die Sie freiwillig angeben: Fragebogenangaben, Kontaktdaten (einschließlich E-Mail/Telegram/Instagram) sowie technisch notwendige Nutzungsdaten.',
        },
        {
          title: 'Warum wir Daten sammeln',
          content: 'Die Daten werden zur Bearbeitung Ihrer Anfrage, zur Kommunikation und zur Bereitstellung von Informationsinhalten verwendet. Eine automatisierte Entscheidungsfindung oder ein Profiling findet nicht statt.',
        },
        {
          title: 'Wohin Daten gesendet werden',
          content: 'Eine Weitergabe an Dritte erfolgt nur, soweit dies technisch erforderlich ist (z. B. Hosting oder Kommunikationskanäle). Bei Nutzung von Telegram richtet sich die Verarbeitung nach den Datenschutzbestimmungen von Telegram.',
        },
        {
          title: 'Wie lange Daten gespeichert werden',
          content: 'Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist, oder bis eine Einwilligung widerrufen wird bzw. ein gesetzlicher Löschanspruch besteht.',
        },
        {
          title: 'Ihre Rechte',
          content: 'Gemäß DSGVO haben Sie folgende Rechte: Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Sie können Ihre Einwilligung zur Datenverarbeitung jederzeit widerrufen, ohne dass die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung berührt wird.',
        },
        {
          title: 'Beschwerderecht',
          content: 'Sie haben das Recht, bei einer Datenschutzaufsichtsbehörde Beschwerde einzulegen, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt. In Deutschland ist dies der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI).',
        },
        {
          title: 'Wie Sie Ihre Rechte ausüben können',
          content: 'Um Ihre Rechte (Auskunft, Berichtigung, Löschung usw.) auszuüben, kontaktieren Sie uns über Telegram oder Instagram und geben Sie Ihren Namen und das Datum der Fragebogenausfüllung an. Wir bearbeiten Ihre Anfrage innerhalb von 30 Tagen nach Eingang.',
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

