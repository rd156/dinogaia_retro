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
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [chapter, setChapter] = useState<number>(0);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["story", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);


  
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
                  <Link href="#">
                  <button
                    onClick={() => toggleLanguage('en')}
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      backgroundColor: language === 'en' ? '#0070f3' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                    }}
                  >
                    English
                  </button>
                  
                  <button
                    onClick={() => toggleLanguage('fr')}
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      backgroundColor: language === 'fr' ? '#0070f3' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                    }}
                  >
                    Francais
                  </button>
                  </Link>
        </div>
      </div>
    </main>
  );
};

export default QuestPage;
