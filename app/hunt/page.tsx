"use client";

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import ImageTerrainWithText from "@/components/pattern/ImageTerrainWithText";

interface Translations {
  [key: string]: any;
}

const DinoPage: React.FC = () => {
  const [dinoId, setDinoId] = useState<string | null>(null);
  const [terrains, setTerrains] = useState<any[]>([]);
  const [weapons, setWeapons] = useState<any[]>([]);
  const [data, setData] = useState<any>({});
  const [selectedTerrain, setSelectedTerrain] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["hunt", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);


  // Récupérer l'ID du dino depuis localStorage
  const updateDinoId = () => {
    const value = localStorage.getItem("dinoId");
    setDinoId(value);
  };

  // Récupérer les données du serveur
  useEffect(() => {
    updateDinoId();

    const fetchData = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }

      try {
        // Récupération des données de chasse
        const huntResponse = await fetch(`${API_URL}/hunt/status/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!huntResponse.ok) {
          setErrorMessage(translations.hunt?.ERR_LOAD_HUNT);
        }

        const huntData = await huntResponse.json();
        console.log(huntData);
        setData(huntData);

        // Récupération des armes
        const weaponResponse = await fetch(`${API_URL}/cave/get_item_weapon/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!weaponResponse.ok) {
          setErrorMessage(translations.hunt?.ERR_LOAD_WEAPON);
        }
        setWeapons(await weaponResponse.json());

        // Récupération des terrains
        const terrainResponse = await fetch(`${API_URL}/hunt/terrain_possible/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!terrainResponse.ok) {
          setErrorMessage(translations.hunt?.ERR_LOAD_LAND);
        }
        const list_terrain = await terrainResponse.json()
        setTerrains(list_terrain);
        console.log(list_terrain)
      } catch (error) {
        setErrorMessage(translations.hunt?.ERR_LOAD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translations]);

  // Calcul du temps restant
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const huntDate = new Date(data.hunt);
      huntDate.setDate(huntDate.getDate() + 1);
      const now = new Date();
      const timeDiff = huntDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining("0h 0m 0s");
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [data]);

  // Validation et redirection
  const handleValidation = async () => {
    if (selectedTerrain && selectedWeapon) {
      // Redirection via window.location
      window.location.href = `/hunt/result?terrain=${encodeURIComponent(selectedTerrain)}&weapon=${encodeURIComponent(selectedWeapon)}`;
    } else {
        
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
      {data.hunt != "ready" && timeRemaining !== "0h 0m 0s" && (
         <p className="alert-red">
          {translations.hunt?.NEXT_HUNT?.replace("[Time]", timeRemaining)}
          </p>
      )}
        <h2 style={{
            marginTop: "20px",
                  marginBottom: "20px",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
            
          }}>
          {translations.hunt?.SELECT_WEAPON}
        </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "10px" }}>
            <div
                key="None"
                onClick={() => setSelectedWeapon("none")}
                style={{
                  border: selectedWeapon === "none" ? "2px solid green" : "1px solid #ccc",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <ImageItemWithText 
                  itemName="none"
                  quantity=""
                  translations={translations.item}
                />
              <h3>{translations.hunt?.NO_WEAPON}</h3>
            </div>
            {Array.isArray(weapons) && weapons.map((weapon) => (
              <div
                key={weapon.item_name}
                onClick={() => setSelectedWeapon(weapon.item_name)}
                style={{
                  border: selectedWeapon === weapon.item_name ? "2px solid green" : "1px solid #ccc",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <ImageItemWithText 
                  itemName={weapon.item_name}
                  quantity=""
                  translations={translations.item}
                />
                
                <h3>{weapon.item_name}</h3>
              </div>
            ))}
          </div>

          <h2 style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                }}>{translations.hunt?.CHOSE_LAND}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
            {terrains.filter(terrain => terrain.possible).map((terrain) => (
              <div
                key={terrain.name}
                onClick={() => setSelectedTerrain(terrain.name)}
                style={{
                  border: selectedTerrain === terrain.name ? "2px solid green" : "1px solid #ccc",
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <ImageTerrainWithText 
                  itemName={terrain.name}
                  translations={translations.hunt}
                />
                <h3>{translations.hunt?.['TERRAIN_'+ terrain.name] ?? terrain.name}</h3>
                <h3>{translations.hunt?.DANGEROUS_SCORE?.replace("[Number]", terrain.danger)}</h3>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "20px", marginBottom: "50px", textAlign: "center" }}>
            <button
              onClick={handleValidation}
              style={{
                padding: "15px 30px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {translations.hunt?.START_HUNT}
            </button>
          </div>
        </div>
    </main>
  );
};

export default DinoPage;
