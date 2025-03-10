"use client";

import { useEffect, useState, Fragment } from "react";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import "../page.css";
import { useOption } from "@/context/OptionsContext";

interface Translations {
  [key: string]: any;
}

const OptionPage: React.FC = () => {
  const [translations, setTranslations] = useState<Translations>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option, updateImageTemplate, updateLanguage} = useOption();

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["settings", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const images_template = [
    { name: 'reborn', label: translations.settings?.TEMPLATE_IMAGE_REBORN },
    { name: 'retro', label: translations.settings?.TEMPLATE_IMAGE_RETRO },
  ];
  const languages = [
    { lang: 'en', label: translations.settings?.LANGUAGE_ENGLISH },
    { lang: 'fr', label: translations.settings?.LANGUAGE_FRENCH },
  ];
  const updateSetting = async (field: string, value: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/account/setting/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
  
      const result = await response.json();
      console.log("result")
      console.log(result)
      return result;
    } catch (error) {
      setErrorMessage(`Erreur lors de la mise à jour du ${field}`);
      console.error(error);
      return null;
    }
  };
  const handleButtonImageClick = async (image_template: string) => {
    const result = await updateSetting("image_template", image_template);
    
    if (result && result.image_template) {
      updateImageTemplate(result.image_template);
    }
  };
  
  const handleButtonLanguageClick = async (template_language: string) => {
    const result = await updateSetting("language", template_language);
    if (result && result.language) {
      updateLanguage(result.language);
    }
  };
  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <div className="block_white">
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            {languages.map(({ lang, label }) => (
              <button
                onClick={() => handleButtonLanguageClick(lang)}
                key={lang}
                style={{
                  padding: '10px 20px',
                  cursor: option?.language === lang ? 'default' : 'pointer',
                  backgroundColor: option?.language === lang ? '#0070f3' : '#2f2f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  opacity: option?.language === lang ? 1 : 0.6,
                }}
                aria-label={`Change language to ${label}`}
                disabled={option?.language === lang}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <br />
        <div className="block_white">
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            {images_template.map(({ name, label }) => (
              <button
                onClick={() => handleButtonImageClick(name)}
                key={name}
                style={{
                  padding: '10px 20px',
                  cursor: option?.image_template === name ? 'default' : 'pointer',
                  backgroundColor: option?.image_template === name ? '#0070f3' : '#2f2f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  opacity: option?.image_template === name ? 1 : 0.6,
                }}
                aria-label={`Change image to ${label}`}
                disabled={option?.image_template === name}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OptionPage;
