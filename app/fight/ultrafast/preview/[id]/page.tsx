"use client";

import { useState, useEffect } from "react";
import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import "./page.css";
import { API_URL } from "@/config/config";
import Link from "next/link";
import { useParams } from 'next/navigation';
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

interface Translations {
  [key: string]: any;
}

interface Combat {
  [key: string]: any;
}

const CombatPreviewPage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const { id: combatId } = useParams<{ id: string }>();
  const [combat, setCombat] = useState<Combat | null>(null);
  const [resultat, setResultat] = useState<any>(null);
  const [message, setMessage] = useState<string>("");

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
    const fetchCombatDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/fight/ultrafast/preview/${combatId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) throw new Error(translations.fight?.ERROR_LOAD_PREVIEW);
        const data = await response.json();
        setCombat(data);
        console.log(data)
        if (data.resultat)
        {
          const resultat_tmp1 = data.resultat.replace(/'/g, '"');
          const resultat_tmp2 = JSON.parse(resultat_tmp1);
          console.log(resultat_tmp2)
          setResultat(resultat_tmp2);
        }
      } catch (error) {
        setMessage(translations.fight?.ERROR_LOAD_PREVIEW);
      }
    };

    fetchCombatDetails();
  }, [combatId, translations]);

  const extractParenthesesContent = (text: string): string | null => {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  };
    
  const getOpponentName = (combat: Combat) => {
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

  const getOpponentId = (combat: Combat): number => {
    if (combat.dino2){
      return combat.dino2
    }
    else if (combat.sbire) {
      return combat.sbire
    }
    else{
      return 0
    }
  };
  
  return (
    <main className="content">
      <div className="content_top">
      <div className="combat-container block_white">
        <h1>{translations.fight?.FIGHT_FAST_PREVIEW_TITLE.replace("[Number]", combatId)}</h1>

        {message && <p className="message">{message}</p>}
          <div className="battlefield">
            <div className="character">
              <ImageGeneriqueWithText 
                imageType="avatar"
                imageName={combat?.dino1_avatar}
                defaultType="avatar"
                defaultName="default"
                width={120}
                height={120}
                alt="Image du joueur"
                className={`character-img ${combat?.winner_type === "player" ? "border-winner" : "border-loser"}`}
              />
              {
                combat && combat.dino1 ? (
                  <p>{combat.dino1_name}</p>
                ):(
                  <p>{translations.fight?.PLAYER}</p>
                )
              }
            </div>
            <div className="vs">{translations.fight?.TITLE_VS}</div>
            <div className="character">
              <ImageGeneriqueWithText 
                imageType="avatar"
                imageName={combat?.opponent_avatar}
                defaultType="avatar"
                defaultName="default"
                width={120}
                height={120}
                alt="Image du joueur"
                className={`character-img ${combat?.winner_type != "player" ? "border-winner" : "border-loser"}`}
              />
              {
                combat ? (
                  <p>{getOpponentName(combat)}</p>
                ):(
                  <p>{translations.fight?.ENNEMY}</p>
                )
              }
            </div>
          </div>
        {combat ? (
          <>
            <div className="combat-summary">
              <p><strong>{translations.fight?.PREVIEW_DATE}</strong> {new Date(combat.created_at).toLocaleString()}</p>
              <p><strong>{translations.fight?.PREVIEW_STATUS}</strong> <span className={`status ${combat.status}`}>{combat.status}</span></p>
            </div>
            <div style={{padding:"5vh"}}>
              <h2>{translations.fight?.PREVIEW_ROUND}</h2>
              <div className="rounds-container">
                {combat.dino1 ? (
                  <table className="rounds-table">
                    <thead>
                      <tr>
                        <th>{translations.fight?.PREVIEW_TABLE_ROUND}</th>
                        <th>{combat.dino1_name}</th>
                        <th>{getOpponentName(combat)}</th>
                      </tr>
                    </thead>
                    <tbody>
                    {resultat && resultat[combat.dino1.toString()] && resultat[getOpponentId(combat).toString()] && 
                      resultat[combat.dino1.toString()].hit && resultat[getOpponentId(combat).toString()].hit &&
                      resultat[combat.dino1.toString()].hit.length > 0 ? (
                      <>
                        {resultat[combat.dino1.toString()].hit.map((_: string, index: number) => (
                          <tr key={"round" + index}>
                            <td>{translations.fight?.ROUND_NORMAL.replace("[Number]", index + 1)}</td>
                            <td>{resultat[combat.dino1.toString()].hit[index]}</td>
                            <td>{resultat[getOpponentId(combat).toString()].hit[index]}</td>
                          </tr>
                        ))}
                      </>
                    ):(
                      <tr key="round">
                        <td>{translations.fight?.ROUND_NORMAL.replace("[Number]", 0)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}

                    {resultat && resultat[combat.dino1.toString()] && resultat[getOpponentId(combat).toString()] ? (
                      <tr key="total">
                        <td>{translations.fight?.ROUND_TOTAL}</td>
                        <td>{resultat[combat.dino1.toString()].total}</td>
                        <td>{resultat[getOpponentId(combat).toString()].total}</td>
                      </tr>
                    ):(
                      <tr key="total">
                        <td>{translations.fight?.ROUND_TOTAL}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                ) : (
                  <p>{translations.fight?.ERROR_NO_ROUND}</p>
                )}
              </div>
            </div>
            <Link href="/fight/ultrafast">
              <button className="btn btn-back">{translations.fight?.BACK_LIST_FICHT}</button>
            </Link>
          </>
        ) : (
          <p>{translations.fight?.LOADING}</p>
        )}
      </div>
      </div>
    </main>
  );
};

export default CombatPreviewPage;
