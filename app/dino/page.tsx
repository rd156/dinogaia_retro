"use client"

import { useLanguage } from '@/context/LanguageContext';
import { translate } from '@/utils/translate';
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {API_URL} from '../../config/config';
import Link from 'next/link';
import "./page.css";


export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topDinos, setTopDinos] = useState<any[]>([]);
  const [bottomDinos, setBottomDinos] = useState<any[]>([]);
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token'); // Récupère le token JWT depuis le localStorage
      console.log(token)
      try {
        const response = await fetch(`${API_URL}/dino`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }

        const data = await response.json();
        setData(Array.isArray(data) ? data : [data]); // Si data n'est pas un tableau, le transformer en tableau
        const topDinos = data.slice(0, 6); // Les 12 premiers dinos
        setTopDinos(Array.isArray(topDinos) ? topDinos : [topDinos]); 
        const bottomDinos = data.slice(6); // Le reste des dinos
        setBottomDinos(Array.isArray(bottomDinos) ? bottomDinos : [bottomDinos]); 
        console.log(topDinos)
        console.log(bottomDinos)
      } catch (error) {
        setError('Impossible de récupérer les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="content">
      <div className="content_top" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'start'}}>
        {topDinos.map((dino) => (
          <Link key={dino.id} href={'/dino'} passHref>
          <div key={dino.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <img src={dino.favory ? "avatar/"+ dino.avatar + ".png" : "avatar/"+ dino.species + "/default.png"} alt="Image de profil" style={{ width: '200px', height: '200px', marginRight: '10px' }} />
            <div style={{padding: '25px', display: 'flex', flexDirection: 'column', color: 'black'}}>
              <h3>{dino.name}</h3>
              <p>Favori : {dino.favory ? 'Oui' : 'Non'}</p>
              <p>Espèce : {dino.species}</p>
              <p>Niveau : {dino.level.lvl}</p>
              <p>XP : {dino.xp}</p>
              <p>État : {dino.disease}, {dino.injury}</p>
              <p>Émeraudes : {dino.emeraude}</p>
            </div>
          </div>
          </Link>
        ))}
      </div>
      <div className="content_bottom" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignItems: 'start'}}>
        {bottomDinos.map((dino) => (
          <Link key={dino.id} href={'/dino'} passHref>
          <div key={dino.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center' }}>
            <img src={dino.favory ? "avatar/"+ dino.avatar + ".png" : "avatar/"+ dino.species + "/default.png"} alt="Image de profil" style={{ width: '200px', height: '200px', marginRight: '10px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>{dino.name}</h3>
              <p>Favori : {dino.favory ? 'Oui' : 'Non'}</p>
              <p>Espèce : {dino.species}</p>
              <p>Niveau : {dino.level.lvl}</p>
              <p>XP : {dino.xp}</p>
              <p>État : {dino.disease}, {dino.injury}</p>
              <p>Émeraudes : {dino.emeraude}</p>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </main>
  );
}