"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from 'next/link';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["bug", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
  
    try {
      // Construire les données du dino à envoyer
      const bugData = {
        title: title,
        content: content,
      };
      console.log("bugData")
      console.log(bugData)
      const token = localStorage.getItem('token'); // Récupère le token JWT depuis le localStorage
  
      // Envoi de la requête POST
      const response = await fetch(`${API_URL}/bug/add`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
        },
        body: JSON.stringify(bugData),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.bug?.ERR_CREATION_FAILED);
      }
  
      const result = await response.json();
      if ("reference" in result)
      {
        const str = translations.bug?.CREATED
        setMessage(str.replace("[REFERENCE]", result.reference))
      }
      else{
        setErrorMessage(translations.bug?.ERR_CREATION_FAILED);
      }
      console.log("result")
      console.log(result)
    } catch (error) {
      setErrorMessage(translations.bug?.ERR_CREATION_FAILED);
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
          <form onSubmit={handleSubmit} style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder={translations.bug?.ENTER_TITLE}
                required
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <textarea
                id="content"
                onChange={(e) => setContent(e.target.value)}
                placeholder={translations.bug?.ENTER_CONTENT}
                rows="10"
                required
              />
            </div>
            <ButtonNeon label={translations.bug?.SUBMIT_BUTTON_CREATION} />
          </form>
        </div>
      </div>
    </main>
  );
};

export default CavePage;
