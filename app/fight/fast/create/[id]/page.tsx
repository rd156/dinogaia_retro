"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import "./page.css";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import { API_URL } from "@/config/config";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import { useParams } from 'next/navigation';

const CombatPage: React.FC = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const { id: player2 } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string>("");
  const [fighterOne, setFighterOne] = useState<number | null>(null);
  const [fighterTwo, setFighterTwo] = useState<number | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["fight", "item", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const createCombat = async () => {
      try {
        const token = localStorage.getItem('token');
        const dinoId = localStorage.getItem("dinoId");
        
        const response = await fetch(`${API_URL}/fight/fast/dinos`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            dino1: dinoId,
            dino2: player2,
          }),
        });
  
        const data = await response.json();
        console.log(data)
        if (data.player1 && data.player2)
        {
          setFighterOne(data.player1)
          setFighterTwo(data.player2)
        }
      } catch (error) {
      }
    };
  
    createCombat();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }

      try {
        const caveResponse = await fetch(`${API_URL}/cave/get_item/${dinoId}/type/ATK`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const item_list = await caveResponse.json()
        setItems(item_list);

        console.log(item_list)

      } catch (error) {
      }
    };

    fetchData();
  }, []);

const handleValidate = async () => {
  const dinoId = localStorage.getItem("dinoId");
  const token = localStorage.getItem("token");
  console.log()

  try {
    const dataFight = {
      "dino1": dinoId,
      "dino2": player2,
      "item": selectedItem
    };
    console.log(dataFight)
    const response = await fetch(`${API_URL}/fight/fast/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataFight),
    });
    
    const data = await response.json();
    console.log(data)
    if (data.id)
    {
      console.log(data.combat_id)
      window.location.href = "/fight/fast"  
    }
    else
    {
      setMessageError(data)
    }
  } catch (error) {
  }
};

  return (
    <main className="content">
      <div className="content_top">
        <div className="combat-container block_white">
          <h1>{translations.fight?.ACTUAL_FIGHT_DISPLAY}</h1>
          <div className="battlefield">
            <div className="character">
              {
                fighterOne ? (
                  <img src={`/avatar/${fighterOne.avatar}.webp`} alt="Image du joueur" className="character-img" />
                ):(
                  <img src={`/avatar/default.webp`} alt="Image du joueur" className="character-img" />
                )
              }
              {
                fighterOne ? (
                  <p>{fighterOne.name}</p>
                ):(
                  <p>{translations.fight?.PLAYER}</p>
                )
              }
            </div>
            <div className="vs">{translations.fight?.TITLE_VS}</div>
            <div className="character">
              {
                fighterTwo ? (
                  <img src={`/avatar/${fighterTwo.avatar}.webp`} alt="Image du joueur" className="character-img" />
                ):(
                  <img src={`/avatar/default.webp`} alt="Image du l'opposant" className="character-img" />
                )
              }
              {
                fighterTwo ? (
                  <p>{fighterTwo.name}</p>
                ):(
                  <p>{translations.fight?.ENNEMY}</p>
                )
              }
            </div>
          </div>

          <div className="selection">
            <div className="attack-selection">
              <p className="round-message">{translations.fight?.CHOSE_ITEM}</p>
              <br />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "10px" }}>
              <div
                  key="None"
                  onClick={() => setSelectedItem("None")}
                  style={{
                    border: selectedItem === "None" ? "2px solid green" : "1px solid #ccc",
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
                <h3>{translations.fight?.IMAGE_NO_ATTACK}</h3>
              </div>
                {Array.isArray(items) && items.map((item) => (
                  <div
                    key={item.item_name}
                    onClick={() => setSelectedItem(item.item_name)}
                    style={{
                      border: selectedItem === item.item_name ? "2px solid green" : "1px solid #ccc",
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
                      itemName={item.item_name}
                      quantity={item.quantite}
                      translations={translations.item}
                    />
                    <h3>{item.item_name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "50px", marginBottom: "20px", textAlign: "center" }}>
            {messageError == "" ? (
                <ButtonFancy label={translations.fight?.FIGHT_START_BUTTON} onClick={handleValidate} />
              ):(
                <h2>{translations.fight?.["ERROR_" + messageError]}</h2>
              )
            }
          </div>
        </div>
      </div>
    </main>
  );
};

export default CombatPage;