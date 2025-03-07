"use client";

import { useState, useEffect } from "react";
import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import "./page.css";
import { API_URL } from "@/config/config";
import Link from "next/link";
import { useParams } from 'next/navigation';
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

const CombatPreviewPage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const { id: combatId } = useParams();
  const [combat, setCombat] = useState<any>(null);
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
        const response = await fetch(`${API_URL}/fight/fast/preview/${combatId}`, {
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
  }, [combatId]);

  const getDinoId = () => {
    return (localStorage.getItem("dinoId"))
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
                className={`character-img ${combat?.winner === combat?.dino1 ? "border-winner" : "border-loser"}`}
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
                imageName={combat?.dino2_avatar}
                defaultType="avatar"
                defaultName="default"
                width={120}
                height={120}
                alt="Image du joueur"
                className={`character-img ${combat?.winner === combat?.dino2 ? "border-winner" : "border-loser"}`}
              />
              {
                combat && combat.dino2 ? (
                  <p>{combat.dino2_name}</p>
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
                        <th>{combat.dino2_name}</th>
                      </tr>
                    </thead>
                    <tbody>
                    <tr key="item">
                      <td>{translations.fight?.ROUND_ITEM}</td>
                      <td>{resultat && resultat[combat.dino1.toString()] ? resultat[combat.dino1.toString()].item : ""}</td>
                      <td>{resultat && resultat[combat.dino2.toString()] ? resultat[combat.dino2.toString()].item : ""}</td>
                    </tr>

                    {resultat && resultat[combat.dino1.toString()] && resultat[combat.dino2.toString()] && 
                      resultat[combat.dino1.toString()].hit && resultat[combat.dino2.toString()].hit &&
                      resultat[combat.dino1.toString()].hit.length > 0 ? (
                      <>
                        {resultat[combat.dino1.toString()].hit.map((_, index) => (
                          <tr key={"round" + index}>
                            <td>{translations.fight?.ROUND_NORMAL.replace("[Number]", index + 1)}</td>
                            <td>{resultat[combat.dino1.toString()].hit[index]}</td>
                            <td>{resultat[combat.dino2.toString()].hit[index]}</td>
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

                    {resultat && resultat[combat.dino1.toString()] && resultat[combat.dino2.toString()] ? (
                      <tr key="total">
                        <td>{translations.fight?.ROUND_TOTAL}</td>
                        <td>{resultat[combat.dino1.toString()].total}</td>
                        <td>{resultat[combat.dino2.toString()].total}</td>
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
            <Link href="/fight/fast">
              <button className="btn btn-back">{translations.fight?.BACK_LIST_FICHT}</button>
            </Link>
            {
              getDinoId() == combat.dino1 ? (
                <Link href={`/fight/fast/create/${combat.dino2}`}>
                  <button className="btn btn-revenge">{translations.fight?.BUTTON_REVENGE}</button>
                </Link>
              ):(
                <Link href={`/fight/fast/create/${combat.dino1}`}>
                  <button className="btn btn-revenge">{translations.fight?.BUTTON_REVENGE}</button>
                </Link>
              )
            }
            
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
