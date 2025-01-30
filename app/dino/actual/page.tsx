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
  const id = params?.id;
  const [dinoId, setDinoId] = useState<string | null>(null);
  const [isLevelUp, setIsLevelUp] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
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

  const updateDinoId = () => {
    const value = localStorage.getItem("dinoId");
    setDinoId(value);
  };

  const handleFavoriteToggle = async (dinoId: number) => {
    try {
      const token = localStorage.getItem('token');

      // Appel API pour basculer l'état de favori
      const response = await fetch(`${API_URL}/dino/favory/${dinoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setErrorMessage(translations.dino?.ERR_FAVORY_FAILED);
      }
      // Mise à jour locale de l'état favori du dino
      setData((prevDino) => ({
        ...prevDino,
        favory: !prevDino.favory,
      }));
    } catch (error) {
      setErrorMessage(translations.dino?.ERR_FAVORY_FAILED);
    }
  };

  useEffect(() => {
    updateDinoId();
    const fetchData = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
      try {

        const response = await fetch(`${API_URL}/dino/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
        }

        const fetchedData = await response.json();
        console.log(fetchedData)
        setData(fetchedData);
      } catch (error) {
        setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      try {

        const response = await fetch(`${API_URL}/dino/level/${dinoId}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
        }

        const LevelUpData = await response.json();
        if (LevelUpData.is_possible && LevelUpData.is_possible == true)
        {
          setIsLevelUp(true);
        }
        
      } catch (error) {
        setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
      }
    };

    fetchData();
  }, []);

  const handleLevelUpClick = async () => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {  
      const response = await fetch(`${API_URL}/dino/level/${dinoId}/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({}),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.dino?.ERR_LEVEL_UP);
      }
      const result = await response.json();
      setIsLevelUp(false);
    } catch (error) {
      setErrorMessage(translations.dino?.ERR_LEVEL_UP);
      setIsLevelUp(false);
    }
  };
  
  return (
    <div className="content">
      <div className='dino-container'>
        <div className="dino-card">
          <h1 className="dino-name">
            <span 
              onClick={(e) => {
                handleFavoriteToggle(data.id);
                e.preventDefault();
              }}
              style={{ cursor: 'pointer', color: data.favory ? 'gold' : 'gray', fontSize: '36px', marginRight: '20px'}}
              title={translations.dino?.ADD_FAVORY}
            >
              {data.favory ? '★' : '☆'}
            </span>
            {data.name}
          </h1>
          {isLevelUp && <ButtonFancy onClick={() => handleLevelUpClick()} label={translations.dino?.LEVEL_UP} />}
          <div className="dino-header">
            <div className="dino-info-right">
              <img src={`/avatar/${data.avatar}.webp`} alt={translations.quest?.IMAGE_PROFILE_ALT.replace("[Name]", data.name)} className="dino-profile-image" />
            </div>
            <div className="dino-info-right">
              <div className="stat-right-block">
                <div className="stat-item">
                  <p>{translations.dino?.LEVEL}: <strong>{data.level?.lvl || "N/A"}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.XP}: <strong>{data.xp}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.EMERALD}: <strong>{data.emeraude}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.LUCK}: <strong>{data.luck}</strong></p>
                </div>
              </div>
            </div>
            <div className="dino-info-right">
              <div className="stat-right-block">
                <div className="stat-item">
                  <p>{translations.dino?.AGILITE}: <strong>{data.agilite}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.INTELLIGENCE}: <strong>{data.intelligence}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.STRENGH}: <strong>{data.force}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.ENDURANCE}: <strong>{data.endurance}</strong></p>
                </div>
              </div>
            </div>
            <div className="dino-info-right">
              <div className="stat-right-block">
                <div className="stat-item">
                  <p>{translations.dino?.SIZE}: <strong>{data.taille}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.WEIGHT}: <strong>{data.poids}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.INJURY}: <strong>{data.injury}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.dino?.DISEASE}: <strong>{data.disease}</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div className="dino-stats">
              <div className="stat-block">
                <h2>{translations.dino?.LIFE}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill life-bar"
                    style={{ width: `${(data.pv / data.pv_max) * 100}%` }}
                  ></div>
                </div>
                <p>
                  {data.pv}/{data.pv_max}
                </p>
              </div>

              <div className="stat-block">
                <h2>{translations.dino?.PM}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill pm-bar"
                    style={{ width: `${(data.pm / data.pm_max) * 100}%` }}
                  ></div>
                </div>
                <p>
                  {data.pm}/{data.pm_max}
                </p>
              </div>
              <div className="stat-block">
                <h2>{translations.dino?.FATIGUE}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill fatigue-bar"
                    style={{ width: `${data.fatigue}%` }}
                  ></div>
                </div>
                <p>
                  {data.fatigue}/100
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );

};

export default DinoPage;
