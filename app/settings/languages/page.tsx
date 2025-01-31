"use client";

import { useEffect, useState, Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "../page.css";
import Link from 'next/link';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const QuestPage: React.FC = () => {
  const {language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["setting", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const handleButtonClick = async (template_language: string) => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/account/setting/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "language": template_language
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.setting?.ERR_CHANGE_LANGUAGE);
      }
  
      const result = await response.json();
      console.log(result)
      if (result.language)
      {
        toggleLanguage(result.language)
      }
    } catch (error) {
      setErrorMessage(translations.setting?.ERR_CHANGE_LANGUAGE);
    }
  };
  
  const languages = [
    { lang: 'en', label: translations.setting?.LANGUAGE_ENGLISH },
    { lang: 'fr', label: translations.setting?.LANGUAGE_FRENCH },
  ];

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
                onClick={() => handleButtonClick(lang)}
                key={lang}
                style={{
                  padding: '10px 20px',
                  cursor: language === lang ? 'default' : 'pointer',
                  backgroundColor: language === lang ? '#0070f3' : '#2f2f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  opacity: language === lang ? 1 : 0.6,
                }}
                aria-label={`Change language to ${label}`}
                disabled={language === lang}
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

export default QuestPage;
