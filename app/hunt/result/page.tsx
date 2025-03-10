"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import ImageTerrainWithText from "@/components/pattern/ImageTerrainWithText";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import Link from "next/link";
import "./page.css";

interface Translations {
  [key: string]: any;
}

const HuntResultPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [isCollectedButton, setIsCollectedButton] = useState(true);

  const terrain = searchParams.get("terrain");
  const weapon = searchParams.get("weapon");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["hunt", "item", "error", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchHuntResult = async () => {
      setLoading(true);
  
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
  
      if (!terrain || !weapon || !dinoId) {
        if (translations && translations.hunt) {
          setErrorMessage(translations.hunt?.NEED_CHOSE);
        }
        setLoading(false);
        return;
      }
  
      try {
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
          if (translations && translations.hunt) {
            setErrorMessage(translations.hunt?.ERR_HUNT);
          }
        }
  
        const result = await response.json();
        console.log(result);
        if (typeof result === "object") {
          setResultData(result);
          setErrorMessage("");
        } else {
          if (translations && translations.error) {
            setErrorMessage(translations.error["ERROR_" + result] || result);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    if (translations && Object.keys(translations).length > 0) {
      fetchHuntResult();
    }
  }, [terrain, weapon, translations]);
  
  const handleCollectItems = async () => {
    setIsCollectedButton(false)
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
    setIsCollectedButton(false)

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
          <div>
            <p className="alert-red">{errorMessage}</p>
            <br />
          </div>
        )}
        {message && (
          <div>
            <p className="alert-green">{message}</p>
            <br />
          </div>
        )}
        {resultData && (
          <div className='hunt-result-container'>
            <div className="block_white">
                  <h1><strong>{translations.hunt?.HUNT_RESULT}</strong></h1>
                <br/>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                  <ImageTerrainWithText
                    itemName={terrain}
                    translations={translations.hunt}
                    width = {100}
                    height = {100}
                    />
                  <span style={{ fontSize: "32px", fontWeight: "bold" }}>X</span>
                  <ImageItemWithText 
                    itemName={weapon}
                    quantity=""
                    translations={translations.item}
                    width = {100}
                    height = {100}
                  />
                </div>
            </div>
          </div>
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
          {translations.hunt?.HUNT_RESULT_ITEM}
        </h2>
        {resultData && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
            {resultData.items && 
              Object.entries(resultData.items).map(([name, count]) => (
                <div
                  key={name}
                  className="block_white center_item"
                >
                  <ImageItemWithText 
                    itemName={name}
                    quantity={count}
                    translations={translations.item}
                  />
                  <p>{translations.item?.['ITEM_' + name] ?? name}</p>
                </div>
              ))
            }
        </div>
        )}
        <br/>
        {resultData && (resultData.pv || resultData.pm) && (
          <div className="block_white hunt-result-container">
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
          </div>
        )}
        {resultData && resultData.items && (
          <div style={{ marginBottom: "10px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}>
            <div className="block block_white">
              {isCollectedButton ? (          
                <div style={{ display: "flex", gap: "10px" }}>
                  <ButtonFancy onClick={handleCollectItems} label={translations.hunt?.COLLECT_ITEM} />
                  <ButtonNeon onClick={handleSellItems} label={translations.hunt?.SELL_ITEM} />
                </div>
              ) : (
                <Link href="/cave">
                  <button
                    style={{
                      margin: "10px",
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    {translations.hunt?.CAVE_BUTTON}
                  </button>
                </Link>
              )}
            </div>
         </div>
        )}
      </div>
    </main>
  );
};

export default HuntResultPage;
