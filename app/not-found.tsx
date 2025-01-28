"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const Custom404: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["error", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);
  
  return (
    <main className="content">
      <div className="content_top">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
          }}>
            <img src={`/not-found.png`} alt="Error 404" 
              style={{
                maxWidth: '90%',
                height: 'auto',
                marginBottom: '20px',
              }}
            />
        </div>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
          <a href="/">
            <ButtonFancy label={translations.error?.ERROR_REDIRECT_HOME_BUTTON} />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Custom404;
