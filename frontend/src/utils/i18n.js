export const translations = {
  en: {
    welcome: "Welcome back,",
    cvScore: "CV Strength Score",
    improve: "Improve Now",
    recent: "Recent Creations",
    tools: "Master Tools",
    build: "Build CV",
    templates: "Templates",
    upgrade: "Upgrade to PRO",
    magicWrite: "🪄 Magic Write with AI",
  },
  bn: {
    welcome: "স্বাগতম,",
    cvScore: "সিভি হেলথ স্কোর",
    improve: "উন্নত করুন",
    recent: "সাম্প্রতিক সিভি",
    tools: "মাস্টার টুলস",
    build: "সিভি তৈরি",
    templates: "টেমপ্লেট",
    upgrade: "প্রো ভার্সন নিন",
    magicWrite: "🪄 এআই দিয়ে লিখুন",
  }
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};
