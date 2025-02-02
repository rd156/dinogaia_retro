"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const HomePage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [players, setPlayers] = useState([]);

  const NOM_ESPECES = [
    ['TR', 'T-Rex'],
    ['VE', 'Velociraptor'],
    ['DP', 'Dilophosaure'],
    ['SM', 'Smilodon'],
    ['PT', 'Pterodactyle'],
    ['MG', 'Megalodon'],
  ];

  const getSpecieName = (speciesCode: string): string => {
    const specie = NOM_ESPECES.find(([code]) => code === speciesCode);
    return specie ? specie[1] : "Espèce inconnue";
  };

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["account", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const reloadClick = async () => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/sloubie/dino`, {
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
        setPlayers(result)
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white center">
          <div style={{ margin: "50px" }}>
            <h1
              style={{
                border: "2px solid red",
                padding: "10px",
                display: "inline-block",
              }}
            >
              Gestion
            </h1>
          </div>
          <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Tapez ici..."
            />
            <ButtonFancy onClick={() => reloadClick()} label="Reload" />
          </div>
          <div style={{ marginTop: "30px" }}>
            {/* Ajout d'un conteneur avec max-height et overflow */}
            <div
              style={{
                maxHeight: "400px",    // Limiter la hauteur du conteneur
                overflowY: "auto",     // Ajouter une barre de défilement verticale
                border: "1px solid #ddd",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Id du dino</th>
                    <th style={{ padding: "10px" }}>Nom du dino</th>
                    <th style={{ padding: "10px" }}>Proprietaire (id)</th>
                    <th style={{ padding: "10px" }}>Date de naissance</th>
                    <th style={{ padding: "10px" }}>Species</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((entry) => (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      <td style={{ padding: "10px" }}>{entry.id}</td>
                      <td style={{ padding: "10px" }}>{entry.name}</td>
                      <td style={{ padding: "10px" }}>
                        {entry.username} ({entry.proprietaire})
                      </td>
                      <td style={{ padding: "10px" }}>{entry.date_naissance}</td>
                      <td style={{ padding: "10px" }}>
                        {getSpecieName(entry.species)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
