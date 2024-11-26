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
    <main className="content">
      <div className="content_top">
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <p>Data Name = {data.name}</p>
        </div>
      </div>
    </main>
  );
};

export default DinoPage;
