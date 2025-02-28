"use client";

import { useState, useEffect } from "react";
import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import Link from "next/link";
import "./page.css";
import { API_URL } from "@/config/config";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CombatListPage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [combatsTermines, setCombatsTermines] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [messageError, setMessageError] = useState<string>("");

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
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    const fetchCombats = async () => {
      try {
        const response = await fetch(`${API_URL}/fight/ultrafast/list/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(translations.fight?.ERROR_LOAD_FIGHT);
        
        const data = await response.json();
        setCombatsTermines(data);
        console.log(data)
      } catch (error) {
        setMessage(translations.fight?.ERROR_LOAD_FIGHT);
      }
    };
    fetchCombats();
  }, []);

  const handleAccountSelect = async () => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      const dataFight = {
        "dinoId": dinoId
      };
      const response = await fetch(`${API_URL}/fight/ultrafast/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataFight),
      });
      if (!response.ok) throw new Error(translations.fight?.ERROR_LOAD_DINO);
      
      const newCombat = await response.json();
      console.log(newCombat)
      if (newCombat.id)
      {
        setCombatsTermines((prevCombats) => [...prevCombats, newCombat]);
      }
      else
      {
        setMessageError(newCombat)
      }
    }
    catch (error) {
    }
  };

  const getDinoId = () => {
    return (localStorage.getItem("dinoId"))
  };
  
  const extractParenthesesContent = (text: string): string | null => {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  };
    
  const getOpponentName = (combat: CombatType) => {
    switch (combat.opponent_type) {
      case "player":
        return extractParenthesesContent(combat.opponent_name);
      case "sbire":
        return translations.fight?.NAME_SBIRE.replace("[Name]", combat.opponent_name);
      case "shadow":
        return translations.fight?.NAME_SHADOW.replace("[Name]", extractParenthesesContent(combat.dino1_account_name));
      default:
        return translations.fight?.UNKNOW
    }
  };
    
  return (
    <main className="content">
      <div className="content_top">
        <div className="combat-container">
          <div>
            <h1 className="title block_white">{translations.fight?.FIGHT_ULTRAFAST_LIST_TITLE}</h1>
          </div>
          <div className="select-dino-container block_white">
            {
              messageError == "" ? (
                <Link href="" onClick={() => handleAccountSelect()}>
                  <ButtonNeon label={translations.fight?.ULTRAFAST_ALEA_START} />
                </Link>
              ):(
                <h2>{translations.fight?.["ERROR_" + messageError]}</h2>
              )
            }
          </div>
          <div className="combat-grid">
            <div className="combat-card completed block_white">
              <h2>{translations.fight?.FIGHT_END_TITLE}</h2>
              {combatsTermines.length > 0 ? (
                <table className="combat-table">
                  <thead>
                    <tr>
                      <th>{translations.fight?.TABLE_AGAIN}</th>
                      <th>{translations.fight?.TABLE_RESULT}</th>
                      <th>{translations.fight?.TABLE_ACTION}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combatsTermines.slice().reverse().map((combat) => (
                      <tr key={combat.id} style={{backgroundColor: combat.winner_type == "player" ? "rgb(0, 255, 0, 0.3)" : "rgb(255, 0, 0, 0.3)",}}>
                        <td>{getOpponentName(combat)}</td>
                        {
                          combat.winner_type == "player" ? (
                            <td>{translations.fight?.WINNER}</td>
                          ):(
                            <td>{translations.fight?.LOSER}</td>
                          )
                        }
                        <td>
                          <Link href={`/fight/ultrafast/preview/${combat.id}`}>
                            {
                              combat.winner_type == "player"?(
                                <button className="btn btn-result-win">{translations.fight?.SEE_RESULT}</button>
                              ):(
                                <button className="btn btn-result-lose">{translations.fight?.SEE_RESULT}</button>
                              )
                            }
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">{translations.fight?.NO_FIGHT_END_TITLE}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CombatListPage;
