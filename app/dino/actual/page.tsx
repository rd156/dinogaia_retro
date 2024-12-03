"use client"

import { useLanguage } from '@/context/LanguageContext';
import { translate, Loadtranslate} from '@/utils/translate';
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {API_URL} from '@/config/config';
import "./page.css";

const DinoPage: React.FC = () => {
  const params = useParams();
  const id = params?.id;
  const [dinoId, setDinoId] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});


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

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du favori.");

      // Mise à jour locale de l'état favori du dino
      setData((prevDino) => ({
        ...prevDino,
        favory: !prevDino.favory,
      }));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du favori:", error);
    }
  };

  useEffect(() => {
    updateDinoId();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      try {

        const response = await fetch(`${API_URL}/dino/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du dino');
        }

        const fetchedData = await response.json();
        console.log(fetchedData)
        setData(fetchedData);
      } catch (error) {
        setError('Impossible de récupérer le dino. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ['dino', 'global']);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

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
              title="Cliquez pour basculer le favori"
            >
              {data.favory ? '★' : '☆'}
            </span>
            {data.name}
          </h1>
          <div className="dino-header">
            <div className="dino-info-right">
              <img src={`/avatar/${data.avatar}.webp`} alt={`Image de profil${data.name}`} className="dino-profile-image" />
            </div>
            <div className="dino-info-right">
              <div className="stat-right-block">
                <div className="stat-item">
                  <p>Niveau: <strong>{data.level?.lvl || "N/A"}</strong></p>
                </div>
                <div className="stat-item">
                  <p>XP: <strong>{data.xp}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Emeraude: <strong>{data.emeraude}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Luck: <strong>{data.luck}</strong></p>
                </div>
              </div>
            </div>
            <div className="dino-info-right">
              <div className="stat-right-block">
                <div className="stat-item">
                  <p>Agilite: <strong>{data.agilite}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Intelligence: <strong>{data.intelligence}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Force: <strong>{data.force}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Endurance: <strong>{data.endurance}</strong></p>
                </div>
              </div>
            </div>
            <div className="dino-info-right">
              <div className="stat-right-block">
                <div className="stat-item">
                  <p>Taille: <strong>{data.taille}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Poids: <strong>{data.poids}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Blessure: <strong>{data.injury}</strong></p>
                </div>
                <div className="stat-item">
                  <p>Maladie: <strong>{data.disease}</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div className="dino-stats">
              <div className="stat-block">
                <h2>Vie</h2>
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
                <h2>PM</h2>
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
                <h2>Fatigue</h2>
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
