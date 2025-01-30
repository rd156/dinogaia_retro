"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";

const HuntResultPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [imageFolder, setImageFolder] = useState<string>('normal');
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});

  // Récupérer les paramètres terrain et weapon
  const terrain = searchParams.get("terrain");
  const weapon = searchParams.get("weapon");

    // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["hunt", "item", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  // Charger la gestion des images
  useEffect(() => {
    setImageFolder(localStorage.getItem("image_template") || "normal");
  }, []);

  const getImageUrl = (itemName: string) => {
    if (imageFolder == "normal"){
      return `${itemName}`;
    }
    else{
      return `template_image/${imageFolder}/${itemName}`;
    }
  };
  useEffect(() => {
    const fetchHuntResult = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");

      if (!terrain || !weapon || !dinoId) {
        setErrorMessage(translations.hunt?.NEED_CHOSE);
        setLoading(false);
        return;
      }

      try {
        // Appeler l'API pour effectuer la chasse
        const response = await fetch(`${API_URL}/hunt/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: dinoId,
            terrain,
            weapon,
          }),
        });

        if (!response.ok) {
          setErrorMessage(translations.hunt?.ERR_HUNT);
        }

        const result = await response.json();
        console.log(result);
        setResultData(result);
      } catch (error) {
        setErrorMessage(translations.hunt?.ERR_LOAD_HUNT);
      } finally {
        setLoading(false);
      }
    };

    fetchHuntResult();
  }, [terrain, weapon]);

  const handleCollectItems = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      const response = await fetch(`${API_URL}/dino/waiting/${dinoId}/collect_hunt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setErrorMessage(translations.hunt?.ERR_HUNT);
      }

      const result = await response.json();
      setMessage(translations.hunt?.COLLECT_SUCCESS);
    } catch (err) {
      setErrorMessage(translations.hunt?.ERR_HUNT);
    } finally {
      setLoading(false);
    }
  };

  const handleSellItems = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      const response = await fetch(`${API_URL}/dino/waiting/${dinoId}/sell_hunt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setErrorMessage(translations.hunt?.ERR_HUNT);
      }

      const result = await response.json();
      setMessage(translations.hunt?.SELL_SUCCESS);
    } catch (err) {
      setErrorMessage(translations.hunt?.ERR_HUNT);
    } finally {
      setLoading(false);
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
        {resultData && (
          <div className="block">
            <h2><strong>{translations.hunt?.HUNT_RESULT}</strong></h2>
            <br/>
            <ul>
              <li><strong>{translations.hunt?.LAND}</strong> {resultData.terrain}</li>
              {weapon !== "None" && (
                <li><strong>{translations.hunt?.USE_WEAPON}</strong> {weapon}</li>
              )}
              <li><strong>{translations.hunt?.HUNT_SUCCESS}</strong> {resultData.type ? "Oui" : "Non"}</li>
            </ul>
            <br/>
            <h3><strong>{translations.hunt?.DETAIL}</strong></h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
            {resultData.items && 
              Object.entries(resultData.items).map(([name, count]) => (
                <div key={name} className="block">
                  <img
                    src={getImageUrl(`item/${name}.webp`)}
                    alt={translations.hunt?.IMAGE_OF?.replace("[ItemName]", name)}
                    style={{
                      width: "100px",
                      height: "100px",
                      marginBottom: "10px",
                    }}
                  />
                  <p>{translations.hunt?.QUANTITY}{count}</p>
                </div>
              ))
            }
            </div>
            <br/>
            {resultData.pv && (
              <div className={resultData.pv < 0 ? "block-red" : "block-green"}>
                <p>
                  {resultData.pv < 0 
                    ? translations.hunt?.LOSE_PV?.replace("[nb]", resultData.pv) 
                    : translations.hunt?.WIN_PV?.replace("[nb]", resultData.pv) }
                </p>
              </div>
            )}
            {resultData.pm && (
              <div className={resultData.pm < 0 ? "block-red" : "block-green"}>
                <p>
                  {resultData.pm < 0 
                    ? translations.hunt?.LOSE_PM?.replace("[nb]", resultData.pm) 
                    : translations.hunt?.WIN_PM?.replace("[nb]", resultData.pm)}
                </p>
              </div>
            )}
            {resultData.items && (
              <div>
                <button
                onClick={handleCollectItems}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: loading ? "#ccc" : "#32ca39",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {translations.hunt?.COLLECT_ITEM}
                </button>
                <br />
                <button
                onClick={handleSellItems}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: loading ? "#ccc" : "#ff0000",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {translations.hunt?.SELL_ITEM}
                </button>
            </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default HuntResultPage;
