"use client";

import { useState, useEffect } from "react";
import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import "./page.css";
import { API_URL } from "@/config/config";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import { useParams } from 'next/navigation';

const attackZones = ["haut", "milieu", "bas"];

const CombatPage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const { id: fightId } = useParams();
  const [round, setRound] = useState(1);
  const [attacks, setAttacks] = useState<string[]>([]);
  const [defenses, setDefenses] = useState<string[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageError, setMessageError] = useState<string>("");
  const [fighterOne, setFighterOne] = useState<number | null>(null);
  const [fighterTwo, setFighterTwo] = useState<number | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["fight", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    setMessage(translations.fight?.TOUR_DISPLAY_DEFAULT)
    const createCombat = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/fight/classic/${fightId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
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
  
  const handleSelect = (type: "attack" | "defense", zone: string) => {
    if (type === "attack") setSelectedAttack(zone);
    else setSelectedDefense(zone);
  };

  const handleValidateRound = async () => {
    if (!selectedAttack || !selectedDefense) {
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
      "dinoId": dinoId,
      "attacks": updatedAttacks,
      "defenses": updatedDefenses,
    };
    console.log(dataFight)
    const response = await fetch(`${API_URL}/fight/classic/update/${fightId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataFight),
    });
    
    const data = await response.json();
    console.log("data_response")
    console.log(data)
    if (data.combat_id)
    {
      console.log(data.combat_id)
      window.location.href = "/fight/classic/preview/" + data.combat_id  
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
          <h1>{translations.fight?.ACTUAL_ROUND_DISPLAY.replace("[Number]", round)}</h1>
          <p className="round-message">{message}</p>
          <div className="battlefield">
            <div className="character">
              {
                fighterTwo ? (
                  <img src={`/avatar/${fighterTwo.avatar}.webp`} alt="Image du joueur" className="character-img" />
                ):(
                  <img src={`/avatar/default.webp`} alt="Image du joueur" className="character-img" />
                )
              }
              {
                fighterTwo ? (
                  <p>{fighterTwo.name}</p>
                ):(
                  <p>{translations.fight?.PLAYER}</p>
                )
              }
            </div>
            <div className="vs">{translations.fight?.TITLE_VS}</div>
            <div className="character">
              {
                fighterOne ? (
                  <img src={`/avatar/${fighterOne.avatar}.webp`} alt="Image du joueur" className="character-img" />
                ):(
                  <img src={`/avatar/default.webp`} alt="Image du l'opposant" className="character-img" />
                )
              }
              {
                fighterOne ? (
                  <p>{fighterOne.name}</p>
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

          {messageError == "" ? (
            <ButtonFancy label={translations.fight?.ROUND_VALIDATE} onClick={handleValidateRound} />
            ):(
              <h2>{translations.fight?.["ERROR_" + messageError]}</h2>
            )
          }
        </div>
      </div>
    </main>
  );
};

export default CombatPage;
