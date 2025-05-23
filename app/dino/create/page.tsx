"use client"

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate} from '@/utils/translate';
import { useEffect, useState } from 'react';
import {API_URL} from '@/config/config';
import "./page.css";
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

interface Translations {
  [key: string]: any;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dinoName, setDinoName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});

  const imageNames = {
    "TR/1/1": "Tyrannosaure",
    "VE/1/1": "Vélociraptor",
    "PT/1/1": "Ptéranodon",
    "DP/1/1": "Dilophosaure",
    "SM/1/1": "Smilodon",
    "MG/1/1": "Megalodon"
  } as const;

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["dino", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);


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
      setErrorMessage(translations.dino?.ERR_MISSING_IMAGE);
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
        setErrorMessage(translations.dino?.ERR_CREATION_FAILED);
      }
  
      const result = await response.json();
      if (typeof result === 'string') {
        setErrorMessage(result);
      } else {
        window.location.href = "/dino"
      }
    } catch (error) {
      setErrorMessage(translations.dino?.ERR_CREATION_FAILED);
    }
  };

  return (
    <div 
      className="content" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      {errorMessage && (
        <p className="alert-red">{errorMessage}</p>
      )}
      {message && (
        <p className="alert-green">{message}</p>
      )}
      <div className="block_white">
          <h2 style={{fontSize: '2.5rem', padding: '20px', color: '#333', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center'}}>
            {translations.dino?.CREATE_DINO_TITLE}
          </h2>
          <form onSubmit={handleSubmit} style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
              {Object.keys(imageNames).map((imagePath, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <ImageGeneriqueWithText 
                    imageType="avatar"
                    imageName={imagePath}
                    defaultType="avatar"
                    defaultName="default"
                    width={100}
                    height={100}
                    alt={`Avatar ${imagePath}`}
                    onClick={() => handleImageSelect(imagePath.split("/")[0])}
                    className={`selectable-avatar ${selectedImage === imagePath.split("/")[0] ? "selected-avatar" : ""}`}
                  />
                  <p style={{ marginTop: '5px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.5)', color: '#333' }}>{imageNames[imagePath as keyof typeof imageNames]}</p>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={dinoName}
              onChange={(e) => setDinoName(e.target.value)}
              placeholder={translations.dino?.DINO_CREATION_NAME}
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
              {translations.dino?.SUBMIT_BUTTON_CREATION}
            </button>
          </form>
      </div>
    </div>
  );
}