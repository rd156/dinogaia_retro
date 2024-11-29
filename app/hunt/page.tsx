"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";

const DinoPage: React.FC = () => {
  const [dinoId, setDinoId] = useState<string | null>(null);
  const [terrains, setTerrains] = useState<any[]>([]);
  const [weapons, setWeapons] = useState<any[]>([]);
  const [data, setData] = useState<any>({});
  const [selectedTerrain, setSelectedTerrain] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [huntResult, setHuntResult] = useState<any[]>([]);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["hunt", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

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
      setError(null);

      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");

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
          throw new Error("Erreur lors de la récupération de la chasse");
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
          throw new Error("Erreur lors de la récupération des armes");
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
          throw new Error("Erreur lors de la récupération des terrains");
        }
        setTerrains(await terrainResponse.json());
      } catch (error) {
        setError("Impossible de récupérer les données. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      console.log("Terrain sélectionné:", selectedTerrain);
      console.log("Arme sélectionnée:", selectedWeapon);

      // Redirection via window.location
      window.location.href = `/hunt/result?terrain=${encodeURIComponent(selectedTerrain)}&weapon=${encodeURIComponent(selectedWeapon)}`;
    } else {
      alert("Veuillez sélectionner un terrain et une arme avant de valider.");
    }
  };

  return (
    <main className="content">
      <div className="content_top">
      {data.hunt != "ready" && timeRemaining !== "0h 0m 0s" && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
         <p>
            Prochaine chasse dans {timeRemaining}
          </p>
        </div>
      )}
      {errorMessage && (
        <p style={{ backgroundColor: 'red', color: 'black', marginTop: '15px' }}>{errorMessage}</p>
      )}
      {huntResult && (
        <p style={{ backgroundColor: 'green', color: 'black', marginTop: '15px' }}>{huntResult}</p>
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
            
          }}> Choisissez une arme
        </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "10px" }}>
            <div
                key="None"
                onClick={() => setSelectedWeapon("None")}
                style={{
                  border: selectedWeapon === "None" ? "2px solid green" : "1px solid #ccc",
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
                <img
                  src={`weapon/none.webp`}
                  alt="Image de l'arme"
                  style={{
                    width: "100px",
                    height: "100px",
                    marginBottom: "10px",
                  }}
                />
                <h3>Aucune arme</h3>
              </div>
            {weapons.map((weapon) => (
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
                <img
                  src={`weapon/${weapon.item_name}.webp`}
                  alt="Image de l'arme"
                  style={{
                    width: "100px",
                    height: "100px",
                    marginBottom: "10px",
                  }}
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
                }}>Choisissez un terrain</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
            {terrains.map((terrain) => (
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
                <img
                  src={`terrain/${terrain.name}.webp`}
                  alt="Image du terrain"
                  style={{
                    width: "200px",
                    height: "200px",
                    marginBottom: "10px",
                  }}
                />
                <h3>{terrain.name}</h3>
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
              Partir en chasse
            </button>
          </div>
        </div>
    </main>
  );
};

export default DinoPage;
