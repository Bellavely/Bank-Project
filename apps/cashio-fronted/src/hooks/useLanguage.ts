import { useTranslation } from 'react-i18next';

export type LanguageCode = 'he' | 'en';

export function useLanguage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language as LanguageCode;

  const isRtl = currentLanguage === 'he';
  const dir = isRtl ? 'rtl' : 'ltr';

  const changeLanguage = async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang: LanguageCode = currentLanguage === 'he' ? 'en' : 'he';
    i18n.changeLanguage(nextLang);
  };

  return {
    translate:t,                  
    lang: currentLanguage, 
    isRtl,              
    dir,               
    changeLanguage,    
    toggleLanguage,     
  };
}