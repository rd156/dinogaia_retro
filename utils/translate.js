export const translate = async (module, key, language = 'fr') => {
  try {
    const translations = await import(`@/translations/${module}/${language}.json`);
    return translations[key] || key;
  } catch (error) {
    console.error(`Erreur de chargement des traductions pour ${module}/${language}:`, error);
    return key;
  }
};

export const Loadtranslate = async (language = 'fr', modules = []) => {
  const translations = {};
  const translationModules = modules.map((module) => 
    import(`@/translations/${module}/${language}.json`)
      .then((mod) => ({ [module]: mod.default }))
      .catch(() => ({ [module]: {} }))
  );
  const results = await Promise.all(translationModules);
  results.forEach((result) => Object.assign(translations, result));
  return translations;
};