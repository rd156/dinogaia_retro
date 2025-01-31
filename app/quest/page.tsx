"use client";

import { useEffect, useState, Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from 'next/link';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const QuestPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [questActive, setQuestActive] = useState<any[]>([]);
  const [questPossibility, setQuestPossibility] = useState<any[]>([]);
  const [questFinish, setQuestFinish] = useState<any[]>([]);
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["quest", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
      try {
        const response = await fetch(`${API_URL}/quest/possibility/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const fetchedData = await response.json();
        console.log(fetchedData)
        setQuestPossibility(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
      try {
        const response = await fetch(`${API_URL}/quest/dino/active/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const fetchedData = await response.json();
        console.log(fetchedData)
        setQuestActive(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
      try {
        const response = await fetch(`${API_URL}/quest/dino/finish/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const fetchedData = await response.json();
        console.log("Finish")
        console.log(fetchedData)
        setQuestFinish(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const [expandedRowActiveQuest, setExpandedRowActiveQuest] = useState(null);

  const toggleRow = (id) => {
    setExpandedRowActiveQuest(expandedRowActiveQuest === id ? null : id);
  };

  const handleButtonClick = async (action) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    console.log(action)
    try {  
      const response = await fetch(`${API_URL}/quest/join_quest`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "id": dinoId,
          "quest_name":action
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.quest?.ERR_JOIN_QUEST);
      }
  
      const result = await response.json();
      console.log(result)
    } catch (error) {
      setErrorMessage(translations.quest?.ERR_JOIN_QUEST);
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
        <div className="block_white">
          <p className="title-tab">{translations.quest?.POSSIBILITY_QUEST}</p>
          <br />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>{translations.quest?.TITLE}</th>
                <th style={{ padding: "10px" }}>{translations.quest?.TYPE}</th>
                <th style={{ padding: "10px" }}>{translations.quest?.JOIN}</th>
              </tr>
            </thead>
            <tbody>
              {questPossibility.map((possibility) => (
                <Fragment key={possibility.id}>
                  <tr
                    key={possibility.id}
                    onClick={() => toggleRow(possibility.id)}
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{possibility.titre}</td>
                    <td style={{ padding: "10px" }}>{possibility.type}</td>
                    <td style={{ padding: "10px" }}>
                      <ButtonFancy onClick={() => handleButtonClick(possibility.titre)} label={translations.quest?.JOIN_QUEST} />
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="block_white">
          <p className="title-tab">{translations.quest?.ACTIVE_QUEST}</p>
          <br />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>{translations.quest?.TITLE}</th>
                <th style={{ padding: "10px" }}>{translations.quest?.STEP}</th>
                <th style={{ padding: "10px" }}>{translations.quest?.EXPIRE_DATE}</th>
              </tr>
            </thead>
            <tbody>
              {questActive.map((entry) => (
                <Fragment key={entry.id}>
                  <tr
                    key={entry.id}
                    onClick={() => toggleRow(entry.id)}
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{entry.quest_name}</td>
                    <td style={{ padding: "10px" }}>{entry.step_name}</td>
                    <td style={{ padding: "10px" }}>
                      {entry.expire_date ? entry.expire_date : translations.quest?.NO_EXPIRATION}
                    </td>
                  </tr>
                  {expandedRowActiveQuest === entry.id && (
                    <tr>
                      <td colSpan="4" style={{ padding: "10px" }}>
                        <strong>{translations.quest?.DESCRIPTION}</strong>
                        <br/>
                        <strong>{translations.quest?.OBJECTIF}:</strong>
                        <ul>
                          {entry.objectifs.map((objectif, index) => ( 
                            <li key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                              {
                                objectif.type === "give" && 
                                <>
                                  <ul>
                                    {
                                      objectif.item &&
                                      translations.quest?.["OBJECTIF_" + objectif.type.toUpperCase() + "_OBJET"]
                                      .replace("[Item]", objectif.item).replace("[Number]", objectif.quantite)
                                      .replace("[TARGET_TYPE]", objectif.target).replace("[TARGET_NAME]", objectif.target_name)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.emeraude > 0 &&
                                      translations.quest?.["OBJECTIF_" + objectif.type.toUpperCase() + "_EMERALD"]
                                      .replace("[Number]", objectif.emeraude).replace("[TARGET_TYPE]", objectif.target)
                                      .replace("[TARGET_NAME]", objectif.target_name)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.luck > 0 &&
                                      translations.quest?.["OBJECTIF_" + objectif.type.toUpperCase() + "_LUCK"]
                                      .replace("[Number]", objectif.luck).replace("[TARGET_TYPE]", objectif.target)
                                      .replace("[TARGET_NAME]", objectif.target_name)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.del_emeraude > 0 &&
                                      translations.quest?.["OBJECTIF_" + objectif.type.toUpperCase() + "_LOSE_EMERALD"]
                                      .replace("[Number]", objectif.del_emeraude).replace("[TARGET_TYPE]", objectif.target)
                                      .replace("[TARGET_NAME]", objectif.target_name)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.del_luck > 0 &&
                                      translations.quest?.["OBJECTIF_" + objectif.type.toUpperCase() + "_LOSE_LUCK"]
                                      .replace("[Number]", objectif.del_luck).replace("[TARGET_TYPE]", objectif.target)
                                      .replace("[TARGET_NAME]", objectif.target_name)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "hunt" && 
                                <>
                                  <ul>
                                    {
                                      objectif.item && objectif.terrain == "all" && translations.quest?.["OBJECTIF_HUNT_OBJET"]
                                      .replace("[Item]", objectif.item).replace("[Number]", objectif.quantite)
                                    }
                                    {
                                      objectif.item && objectif.terrain != "all" && translations.quest?.["OBJECTIF_HUNT_OBJET_TERRAIN"]
                                      .replace("[Item]", objectif.item).replace("[Number]", objectif.quantite).replace("[Terrain]", objectif.Terrain)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.emeraude > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_HUNT_EMERALD"]
                                      .replace("[Number]", objectif.emeraude)
                                    }
                                    {
                                      objectif.emeraude > 0 && objectif.terrain != "all" && translations.quest?.["OBJECTIF_HUNT_EMERALD_TERRAIN"]
                                      .replace("[Number]", objectif.emeraude).replace("[Terrain]", objectif.Terrain)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.luck > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_HUNT_LUCK"]
                                      .replace("[Number]", objectif.luck)
                                    }
                                    {
                                      objectif.luck > 0 && objectif.terrain != "all" && translations.quest?.["OBJECTIF_HUNT_LUCK_TERRAIN"]
                                      .replace("[Number]", objectif.luck).replace("[Terrain]", objectif.Terrain)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.del_emeraude > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_HUNT_LOSE_EMERALD"]
                                      .replace("[Number]", objectif.del_emeraude)
                                    }
                                    {
                                      objectif.del_emeraude > 0 && objectif.terrain != "all" && translations.quest?.["OBJECTIF_HUNT_LOSE_EMERALD_TERRAIN"]
                                      .replace("[Number]", objectif.del_emeraude).replace("[Terrain]", objectif.Terrain)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.del_luck > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_HUNT_LOSE_LUCK"]
                                      .replace("[Number]", objectif.del_luck)
                                    }
                                    {
                                      objectif.del_luck > 0 && objectif.terrain != "all" && translations.quest?.["OBJECTIF_HUNT_LOSE_LUCK_TERRAIN"]
                                      .replace("[Number]", objectif.del_luck).replace("[Terrain]", objectif.Terrain)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "sell_item" && 
                                <>
                                  <ul>
                                    {
                                      objectif.item && objectif.location == "all" && translations.quest?.["OBJECTIF_SELL_ITEM_OBJET"]
                                      .replace("[Item]", objectif.item).replace("[Number]", objectif.quantite)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.emeraude > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_SELL_ITEM_EMERALD"]
                                      .replace("[Number]", objectif.emeraude)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.luck > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_SELL_ITEM_LUCK"]
                                      .replace("[Number]", objectif.luck)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "buy_item" && 
                                <>
                                  <ul>
                                    {
                                      objectif.item && objectif.location == "all" && translations.quest?.["OBJECTIF_BUY_ITEM_OBJET"]
                                      .replace("[Item]", objectif.item).replace("[Number]", objectif.quantite)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.emeraude > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_BUY_ITEM_EMERALD"]
                                      .replace("[Number]", objectif.emeraude)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.luck > 0 && objectif.terrain == "all" && translations.quest?.["OBJECTIF_BUY_ITEM_LUCK"]
                                      .replace("[Number]", objectif.luck)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "event" && 
                                <>
                                  <ul>
                                    {
                                      objectif.quantite <= 1 && objectif.categorie == "rencontre" && translations.quest?.["OBJECTIF_EVENT_RENCONTRE"]
                                      .replace("[Name]", objectif.name)
                                    }
                                    {
                                      objectif.quantite > 1 && objectif.categorie == "rencontre" && translations.quest?.["OBJECTIF_EVENT_RENCONTRE_QUANTITY"]
                                      .replace("[Name]", objectif.name).replace("[Number]", objectif.quantite)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "capture" && 
                                <>
                                  <ul>
                                    {
                                      objectif.location == "all" && objectif.quantite <= 1 && objectif.categorie == "rencontre" && translations.quest?.["OBJECTIF_EVENT_CAPTURE"]
                                      .replace("[Name]", objectif.name)
                                    }
                                    {
                                      objectif.location == "all" && objectif.quantite > 1 && objectif.categorie == "rencontre" && translations.quest?.["OBJECTIF_EVENT_CAPTURE_QUANTITY"]
                                      .replace("[Name]", objectif.name).replace("[Number]", objectif.quantite)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.location != "all" && objectif.quantite <= 1 && objectif.categorie == "rencontre" && translations.quest?.["OBJECTIF_EVENT_CAPTURE_LOCATION"]
                                      .replace("[Name]", objectif.name).replace("[Location]", objectif.location)
                                    }
                                    {
                                      objectif.location != "all" && objectif.quantite > 1 && objectif.categorie == "rencontre" && translations.quest?.["OBJECTIF_EVENT_CAPTURE_LOCATION_QUANTITY"]
                                      .replace("[Name]", objectif.name).replace("[Number]", objectif.quantite).replace("[Location]", objectif.location)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "use" && 
                                <>
                                  <ul>
                                    {
                                      objectif.item == "all" && objectif.location == "all" && translations.quest?.["OBJECTIF_USE_EVERYTHING"]
                                      .replace("[Number]", objectif.quantite)
                                    }
                                    {
                                      objectif.item == "all" && objectif.location != "all" && translations.quest?.["OBJECTIF_USE_EVERYTHING_LOCATION"]
                                      .replace("[Number]", objectif.quantite).replace("[Location]", objectif.location)
                                    }
                                    {
                                      objectif.item != "all" && objectif.location == "all" && translations.quest?.["OBJECTIF_USE"]
                                      .replace("[Number]", objectif.quantite).replace("[Item]", objectif.item)
                                    }
                                    {
                                      objectif.item != "all" && objectif.location != "all" && translations.quest?.["OBJECTIF_USE_LOCATION"]
                                      .replace("[Number]", objectif.quantite).replace("[Item]", objectif.item).replace("[Location]", objectif.location)
                                    }
                                  </ul>
                                </>
                              }
                              {
                                objectif.type === "casino" && 
                                <>
                                  <ul>
                                    {
                                      objectif.quantite > 0 && objectif.machine == "all" && translations.quest?.["OBJECTIF_CASINO_PLAY"]
                                      .replace("[Number]", objectif.quantite)
                                    }
                                    {
                                      objectif.quantite > 0 && objectif.quantite != "all" && translations.quest?.["OBJECTIF_CASINO_PLAY_MACHINE"]
                                      .replace("[Number]", objectif.del_luck).replace("[Machine]", objectif.machine)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.emeraude > 0 && objectif.machine == "all" && translations.quest?.["OBJECTIF_CASINO_EMERALD"]
                                      .replace("[Number]", objectif.emeraude)
                                    }
                                    {
                                      objectif.emeraude > 0 && objectif.machine != "all" && translations.quest?.["OBJECTIF_CASINO_EMERALD_MACHINE"]
                                      .replace("[Number]", objectif.emeraude).replace("[Machine]", objectif.machine)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.luck > 0 && objectif.machine == "all" && translations.quest?.["OBJECTIF_CASINO_LUCK"]
                                      .replace("[Number]", objectif.luck)
                                    }
                                    {
                                      objectif.luck > 0 && objectif.machine != "all" && translations.quest?.["OBJECTIF_CASINO_LUCK_MACHINE"]
                                      .replace("[Number]", objectif.luck).replace("[Machine]", objectif.machine)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.del_emeraude > 0 && objectif.machine == "all" && translations.quest?.["OBJECTIF_CASINO_LOSE_EMERALD"]
                                      .replace("[Number]", objectif.del_emeraude)
                                    }
                                    {
                                      objectif.del_emeraude > 0 && objectif.machine != "all" && translations.quest?.["OBJECTIF_CASINO_LOSE_EMERALD_MACHINE"]
                                      .replace("[Number]", objectif.del_emeraude).replace("[Machine]", objectif.machine)
                                    }
                                  </ul>
                                  <ul>
                                    {
                                      objectif.del_luck > 0 && objectif.machine == "all" && translations.quest?.["OBJECTIF_CASINO_LOSE_LUCK"]
                                      .replace("[Number]", objectif.del_luck)
                                    }
                                    {
                                      objectif.del_luck > 0 && objectif.machine != "all" && translations.quest?.["OBJECTIF_CASINO_LOSE_LUCK_MACHINE"]
                                      .replace("[Number]", objectif.del_luck).replace("[Machine]", objectif.machine)
                                    }
                                  </ul>
                                </>
                              }
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="block_white">
          <p className="title-tab">{translations.quest?.FINISH_QUEST}</p>
          <br />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>{translations.quest?.TITLE}</th>
                <th style={{ padding: "10px" }}>{translations.quest?.TYPE}</th>
                <th style={{ padding: "10px" }}>{translations.quest?.RESTART}</th>
              </tr>
            </thead>
            <tbody>
              {questFinish.map((finish) => (
                <Fragment key={finish.id}>
                  <tr
                    key={finish.id}
                    onClick={() => toggleRow(finish.id)}
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{finish.quest_name}</td>
                    <td style={{ padding: "10px" }}>{finish.quest_type}</td>
                    <td style={{ padding: "10px" }}>
                      {finish.quest_is_repetable ? (
                        <ButtonFancy onClick={() => handleButtonClick(finish.titre)} label={translations.quest?.RESTART_QUEST} />
                      ) : (
                        translations.quest?.NOT_REPETABLE
                      )}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default QuestPage;
