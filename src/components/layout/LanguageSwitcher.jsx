import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '@/components/sistema/i18n/useI18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, supportedLanguages } = useI18n();

  const flagEmoji = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };

  return (
    <div className="flex items-center gap-1">
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            language === lang ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={lang.toUpperCase()}
        >
          {flagEmoji[lang]}
        </button>
      ))}
    </div>
  );
}