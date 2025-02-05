"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import "./page.css";
import { API_URL } from "@/config/config";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import { useParams } from 'next/navigation';

const attackZones = ["haut", "milieu", "bas"];

const CombatPage: React.FC = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const { id: player2 } = useParams();
  const [round, setRound] = useState(1);
  const [attacks, setAttacks] = useState<string[]>([]);
  const [defenses, setDefenses] = useState<string[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<string | null>(null);
  const [message, setMessage] = useState<string>();
  const [messageError, setMessageError] = useState<string>("");
  const [fighterOne, setFighterOne] = useState<number | null>(null);
  const [fighterTwo, setFighterTwo] = useState<number | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["fight", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const createCombat = async () => {
      setMessage(translations.fight?.TOUR_DISPLAY_DEFAULT)
      try {
        const token = localStorage.getItem('token');
        const dinoId = localStorage.getItem("dinoId");
        
        const response = await fetch(`${API_URL}/fight/classic/dinos`, {
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
        setMessageError(translations.fight?.ERROR_CREATE_FIGHT);
      }
    };
  
    createCombat();
  }, []);
  
  const handleSelect = (type: "attack" | "defense", zone: string) => {
    if (type === "attack") setSelectedAttack(zone);
    else setSelectedDefense(zone);
  };

  const handleValidateRound = async () => {
    if (!selectedAttack || !selectedDefense) {
      setMessage("Vous devez choisir une attaque et une défense !");
      return;
    }
    const newAttacks = [...attacks, selectedAttack];
    const newDefenses = [...defenses, selectedDefense];
  
    setAttacks(newAttacks);
    setDefenses(newDefenses);
    setSelectedAttack(null);
    setSelectedDefense(null);
    if (round < 3) {
      setRound(round + 1);
      setMessage(translations.fight?.TOUR_DISPLAY.replace("[Number]", round + 1));
    } else {
      sendCombatData(newAttacks, newDefenses);
    }
  };

const sendCombatData = async (updatedAttacks: string[], updatedDefenses: string[]) => {
  const dinoId = localStorage.getItem("dinoId");
  const token = localStorage.getItem("token");
  try {
    const dataFight = {
      "dino1": dinoId,
      "dino2": fighterTwo.id,
      "attacks": updatedAttacks,
      "defenses": updatedDefenses,
    };
    console.log(dataFight)
    const response = await fetch(`${API_URL}/fight/classic/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataFight),
    });
    
    const data = await response.json();
    console.log(data)
    if (data.combat_id)
    {
      console.log(data.combat_id)
      window.location.href = "/fight/classic"  
    }
    else
    {
    }
  } catch (error) {
  }
};

  return (
    <main className="content">
      <div className="content_top">
        <div className="combat-container block_white">
          <h1>{translations.fight?.ACTUAL_ROUND_DISPLAY.replace("[Number]", round)}</h1>
          <p className="round-message">{message}</p>
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
              <h3>{translations.fight?.CHOSE_ATTACK}</h3>
              {attackZones.map((zone) => (
                <button
                  key={zone}
                  className={`choice-button ${selectedAttack === zone ? "selected" : ""}`}
                  onClick={() => handleSelect("attack", zone)}
                >
                  <img src={`/bouton/sword_white_${zone}.webp`} alt={zone} className="zone-img" />
                </button>
              ))}
            </div>

            <div className="defense-selection">
              <h3>{translations.fight?.CHOSE_DEFENSE}</h3>
              {attackZones.map((zone) => (
                <button
                  key={zone}
                  className={`choice-button ${selectedDefense === zone ? "selected" : ""}`}
                  onClick={() => handleSelect("defense", zone)}
                >
                  <img src={`/bouton/shield_${zone}.webp`} alt={zone} className="zone-img" />
                </button>
              ))}
            </div>
          </div>

          <ButtonFancy label={translations.fight?.ROUND_VALIDATE} onClick={handleValidateRound} />
        </div>
      </div>
    </main>
  );
};

export default CombatPage;
