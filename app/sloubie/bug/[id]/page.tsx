"use client"

import { useLanguage } from '@/context/LanguageContext';
import { translate, Loadtranslate} from '@/utils/translate';
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {API_URL} from '@/config/config';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";

const DinoPage: React.FC = () => {
  const params = useParams();
  const [data, setData] = useState<any[]>([]);
  const [bugId, setBugId] = useState(params?.id);
  const [inputValue, setInputValue] = useState("");
  const [bug, setBug] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ['dino', 'global']);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const reloadClick = async () => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/sloubie/bug/${bugId}/get_status`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "password": inputValue
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_SALARY_JOB);
      }
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBug(result)
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  return (
    <div className="content">
      <div className='content_top'>
        <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
          <input
            type="text"
            value={bugId}
            onChange={(e) => setBugId(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="id"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="password"
          />
          <ButtonFancy onClick={reloadClick} label="Reload" />
        </div>
      </div>
    </div>
  );

};

export default DinoPage;
