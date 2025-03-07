"use client";

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate} from '@/utils/translate';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config/config';
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {option} = useOption();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["dino", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);


  // Fonction pour basculer l'état favori
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
      setData((prevData) => {
        const updatedData = prevData.map((dino) =>
          dino.id === dinoId ? { ...dino, favory: !dino.favory } : dino
        );
        return updatedData;
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du favori:", error);
    }
  };

  useEffect(() => {
    localStorage.removeItem("option");
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/dino`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des dinos');
        }

        const fetchedData = await response.json();
        setData(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        setError('Impossible de récupérer les dinos. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer top et bottom dinos
  const topDinos = data.slice(0, 6);
  const bottomDinos = data.slice(6);

  return (
    <main className="content">
      <div className="content_top" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'start'}}>
        {topDinos.map((dino) => (
          <Link 
            key={dino.id} 
            href={'/dino/'+dino.id}
            passHref
            onClick={(e) => {
              localStorage.setItem('dinoId', dino.id);
              localStorage.setItem('selectedDino', JSON.stringify(dino));
              window.dispatchEvent(new Event("storage"));
            }}
          >
            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center'}} className='block_white'>
              <ImageGeneriqueWithText 
                imageType="avatar"
                imageName={dino.avatar}
                defaultType="avatar"
                defaultName="default"
                width={200}
                height={200}
                alt="Image de profil"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 object-cover rounded"
              />
              <div style={{padding: '25px', display: 'flex', flexDirection: 'column', color: 'black'}}>
                <h3>
                  <span 
                    onClick={(e) => {
                      handleFavoriteToggle(dino.id);
                      e.preventDefault();
                    }}
                    style={{ cursor: 'pointer', color: dino.favory ? 'gold' : 'gray', fontSize: '36px', marginRight: '20px'}}
                    title="Cliquez pour basculer le favori"
                  >
                    {dino.favory ? '★' : '☆'}
                  </span>
                  {dino.name}
                </h3>
                <p>{translations.dino?.SPECIE} : {dino.species}</p>
                <p>{translations.dino?.LEVEL} : {dino.level.lvl}</p>
                <p>{translations.dino?.XP} : {dino.xp}</p>
                <p>{translations.dino?.STATES} : {dino.disease}, {dino.injury}</p>
                <p>{translations.dino?.EMERALD} : {dino.emeraude}</p>
              </div>
            </div>
          </Link>
        ))}
        {topDinos.length < 6 && (
          <Link
            href={'/dino/create'}
            passHref
          >
            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center'}} className='block_white'>
              <div style={{padding: '25px', flexDirection: 'column', textAlign: 'center', color: 'black'}}>
                <ButtonNeon label={translations.dino?.CREATE_DINO_REDIRECT} />
              </div>
            </div>
          </Link>
        )}
      </div>
      <div className="content_bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'start'}}>
        {bottomDinos.map((dino) => (
          <Link 
            key={dino.id} 
            href={'/dino/'+dino.id}
            passHref
            onClick={(e) => {
              localStorage.setItem('dinoId', dino.id);
              localStorage.setItem('selectedDino', JSON.stringify(dino));
            }}
          >
            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center'}} className='block_white'>
              <ImageGeneriqueWithText 
                imageType="avatar"
                imageName={dino.avatar}
                defaultType="avatar"
                defaultName="default"
                width={200}
                height={200}
                alt="Image de profil"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 object-cover rounded"
              />
              <div style={{ display: 'flex', flexDirection: 'column', color: 'black' }}>
                <h3>
                  <span 
                    onClick={(e) => {
                      localStorage.setItem('selectedDino', JSON.stringify(dino));
                      handleFavoriteToggle(dino.id);
                      e.preventDefault();
                    }}
                    style={{ cursor: 'pointer', color: dino.favory ? 'gold' : 'gray', fontSize: '36px', marginRight: '20px'}}
                    title="Cliquez pour basculer le favori"
                  >
                    {dino.favory ? '★' : '☆'}
                  </span>
                  {dino.name}
                </h3>
                <p>{translations.dino?.SPECIE} : {dino.species}</p>
                <p>{translations.dino?.LEVEL} : {dino.level.lvl}</p>
                <p>{translations.dino?.XP} : {dino.xp}</p>
                <p>{translations.dino?.STATES} : {dino.disease}, {dino.injury}</p>
                <p>{translations.dino?.EMERALD} : {dino.emeraude}</p>
              </div>
            </div>
          </Link>
        ))}
        {topDinos.length >= 6 && (
          <Link
            href={'/dino/create'}
            passHref
          >
            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center'}} className='block_white'>
              <div style={{padding: '25px', flexDirection: 'column', textAlign: 'center', color: 'black'}}>
                <ButtonNeon label={translations.dino?.CREATE_DINO_REDIRECT} /> 
              </div>
            </div>
          </Link>
        )}
      </div>
    </main>
  );
}
