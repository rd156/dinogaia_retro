"use client";

import { useEffect, useState, Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/account/chapter_story`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const chapterData = await response.json();
        console.log(chapterData)
        if (chapterData.chapter)
        {        
          setChapter(chapterData.chapter);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
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
          <button
            key="chapter_0"
            onClick={() => (window.location.href = `/story/0`)}
            style={{ marginRight: "10px", padding: "5px 10px", cursor: "pointer" }}
          >
            {translations.story?.ORIGIN}
          </button>
          {
          Array.from({length: chapter}, (_, index) => (
            <button
              key={"chapter_" + index + 1}
              onClick={() => (window.location.href = `/story/${index + 1}`)}
              style={{ marginRight: "10px", padding: "5px 10px", cursor: "pointer" }}
            >
              {translations.story?.CHAPITRE.replace("[Number]", index + 1)}
            </button>
          ))}
        </div>
        <br />
        <div className="block_white">
          <p className="title-tab">{translations.story?.["TITLE_"+chapter]}</p>
          <br />
          {translations.story?.["CONTENT_"+chapter]}
        </div>
      </div>
    </main>
  );
};

export default QuestPage;
