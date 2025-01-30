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
  const [imageFolder, setImageFolder] = useState<string>('reborn');
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

  useEffect(() => {
    setImageFolder(localStorage.getItem("image_template") || "reborn");
  }, []);

  const images_template = [
    { name: 'reborn', label: translations.setting?.TEMPLATE_IMAGE_REBORN },
    { name: 'retro', label: translations.setting?.TEMPLATE_IMAGE_RETRO },
  ];
  
  const handleButtonClick = async (image_template: string) => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/account/setting/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "image_template": image_template
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.setting?.ERR_CHANGE_IMAGE);
      }
  
      const result = await response.json();
      if (result.image_template)
      {
        localStorage.setItem('image_template', result.image_template);
        setImageFolder(result.image_template)
      }
    } catch (error) {
      setErrorMessage(translations.setting?.ERR_CHANGE_IMAGE);
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
            {images_template.map(({ name, label }) => (
              <button
                onClick={() => handleButtonClick(name)}
                key={name}
                style={{
                  padding: '10px 20px',
                  cursor: imageFolder === name ? 'default' : 'pointer',
                  backgroundColor: imageFolder === name ? '#0070f3' : '#2f2f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  opacity: imageFolder === name ? 1 : 0.6,
                }}
                aria-label={`Change language to ${label}`}
                disabled={imageFolder === name}
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
