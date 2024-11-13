"use client"

import { useLanguage } from '@/context/LanguageContext';
import { translate, Loadtranslate} from '@/utils/translate';
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {API_URL} from '@/config/config';
import Link from 'next/link';
import "./page.css";


export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dinoName, setDinoName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();

  const imageNames = {
    "TR/1.webp": "Tyrannosaure",
    "VE/1.webp": "Vélociraptor",
    "PT/1.webp": "Ptéranodon",
    "DP/1.webp": "Dilophosaure",
    "SM/1.webp": "Smilodon",
    "MG/1.webp": "Megalodon"
  } as const;

  const [translations, setTranslations] = useState({});
  console.log("language:" + language)

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ['dino', 'global']);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  // Gestion de la sélection d'une image
  const handleImageSelect = (imageValue: string) => {
    setSelectedImage(imageValue);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (!selectedImage) {
      alert("Veuillez sélectionner une image pour votre dino.");
      return;
    }
  
    try {
      // Construire les données du dino à envoyer
      const dinoData = {
        name: dinoName,
        species: selectedImage,
      };
      console.log("dinoData")
      console.log(dinoData)
      const token = localStorage.getItem('token'); // Récupère le token JWT depuis le localStorage
  
      // Envoi de la requête POST
      const response = await fetch(`${API_URL}/dino/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
        },
        body: JSON.stringify(dinoData),
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de la création du dino.");
      }
  
      const result = await response.json();
      if (typeof result === 'string') {
        setErrorMessage(result);
      } else {
        setMessage(`Dino créé avec succès (Nom : ${dinoName}, Espèce : ${selectedImage})`)
      }
    } catch (error) {
      console.error("Erreur lors de la création du dino:", error);
    }
  };

  return (
<div 
      className="page-container" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <div 
        className="form-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparence
          borderRadius: '8px',
          width: '80%', // Largeur ajustée à 80% de la page
          maxWidth: '1800px', // Limite maximum de largeur pour les grands écrans
          height: '70vh', // Hauteur fixée à 50% de l'écran
        }}
      >   
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'}}>
        <button
          onClick={() => toggleLanguage('en')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          Switch to English
        </button>
        <button
          onClick={() => toggleLanguage('fr')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          Passer au Français
        </button>

          <h2 style={{fontSize: '2.5rem', padding: '20px', color: '#333', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center'}}>
            {translations.dino?.CREATE_DINO_TITLE}
            Créer un nouveau dino
          </h2>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
              {Object.keys(imageNames).map((imagePath, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <img
                    src={`/avatar/${imagePath}`}
                    alt={`Avatar ${imagePath}`}
                    onClick={() => handleImageSelect(imagePath.split("/")[0])}
                    style={{
                      width: '100px',
                      height: '100px',
                      border: selectedImage === imagePath.split("/")[0] ? '3px solid blue' : '1px solid #ccc',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  />
                  <p style={{ marginTop: '5px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.5)', color: '#333' }}>{imageNames[imagePath]}</p>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={dinoName}
              onChange={(e) => setDinoName(e.target.value)}
              placeholder="Nom du dino"
              style={{ padding: '10px', marginBottom: '20px', width: '200px' }}
              required
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                backgroundColor: '#4CAF50', // Vert vif pour le fond
                color: '#fff', // Texte blanc
                fontSize: '16px', // Taille du texte
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px', // Coins arrondis
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Ombre
                transition: 'background-color 0.3s, transform 0.2s', // Transitions pour hover
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#45A049'; // Couleur légèrement plus foncée au survol
                e.currentTarget.style.transform = 'scale(1.05)'; // Légère mise en relief
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Crée le dino
            </button>
            {errorMessage && (
              <p style={{ backgroundColor: 'red', color: 'black', marginTop: '15px' }}>{errorMessage}</p>
            )}
            {message && (
              <p style={{ backgroundColor: 'green', color: 'black', marginTop: '15px' }}>{message}</p>
            )}
          </form>
      </div>
    </div>
  );
}