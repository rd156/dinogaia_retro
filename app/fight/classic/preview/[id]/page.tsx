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

interface Fighter {
  [key: string]: any;
}

const CombatPreviewPage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const { id: combatId } = useParams<{ id: string }>();
  const [combat, setCombat] = useState<Fighter | null>(null);
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
        const response = await fetch(`${API_URL}/fight/classic/preview/${combatId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) throw new Error(translations.fight?.ERROR_LOAD_PREVIEW);
        const data = await response.json();
        console.log(data)
        setCombat(data);
      } catch (error) {
        setMessage(translations.fight?.ERROR_LOAD_PREVIEW);
      }
    };

    fetchCombatDetails();
  }, [combatId, translations]);

  const getDinoId = () => {
    return (localStorage.getItem("dinoId"))
  };

  return (
    <main className="content">
      <div className="content_top">
      <div className="combat-container block_white">
        <h1>{translations.fight?.FIGHT_PREVIEW_TITLE.replace("[Number]", combatId)}</h1>

        {message && <p className="message">{message}</p>}
          <div className="battlefield">
            <div className="character">
              <ImageGeneriqueWithText 
                imageType="avatar"
                imageName={combat?.ennemi_avatar}
                defaultType="avatar"
                defaultName="default"
                width={120}
                height={120}
                alt="Image du joueur"
                className={`character-img ${combat?.gagnant === combat?.ennemi ? "border-winner" : "border-loser"}`}
              />
              {
                combat && combat.ennemi ? (
                  <p>{combat.ennemi_name}</p>
                ):(
                  <p>{translations.fight?.PLAYER}</p>
                )
              }
            </div>
            <div className="vs">{translations.fight?.TITLE_VS}</div>
            <div className="character">
              <ImageGeneriqueWithText 
                imageType="avatar"
                imageName={combat?.joueur_avatar}
                defaultType="avatar"
                defaultName="default"
                width={120}
                height={120}
                alt="Image du joueur"
                className={`character-img ${combat?.gagnant === combat?.joueur ? "border-winner" : "border-loser"}`}
              />
              {
                combat && combat.joueur ? (
                  <p>{combat.joueur_name}</p>
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
                {combat.joueur_attack && combat.joueur_attack.length > 0 ? (
                  <table className="rounds-table">
                    <thead>
                      <tr>
                        <th>{translations.fight?.PREVIEW_TABLE_ROUND}</th>
                        <th>{translations.fight?.PREVIEW_TABLE_ATTACK.replace("[Name]", combat.joueur_name)}</th>
                        <th>{translations.fight?.PREVIEW_TABLE_DEFENSE.replace("[Name]", combat.joueur_name)}</th>
                        <th>{translations.fight?.PREVIEW_TABLE_ATTACK.replace("[Name]", combat.ennemi_name)}</th>
                        <th>{translations.fight?.PREVIEW_TABLE_DEFENSE.replace("[Name]", combat.ennemi_name)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combat.joueur_attack.map((_: string, index: number) => (
                        <tr key={index} style={{backgroundColor: combat.gagnant == getDinoId() ? "rgb(0, 255, 0, 0.3)" : "rgb(255, 0, 0, 0.3)"}}>
                          <td>{index + 1}</td>
                          <td>{Array.isArray(combat.joueur_attack[index]) ? combat.joueur_attack[index].join(", ") : combat.joueur_attack[index] || "—"}</td>
                          <td>{Array.isArray(combat.joueur_defense[index]) ? combat.joueur_defense[index].join(", ") : combat.joueur_defense[index] || "—"}</td>
                          <td>{Array.isArray(combat.ennemi_attack[index]) ? combat.ennemi_attack[index].join(", ") : combat.ennemi_attack[index] || "—"}</td>
                          <td>{Array.isArray(combat.ennemi_defense[index]) ? combat.ennemi_defense[index].join(", ") : combat.ennemi_defense[index] || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>{translations.fight?.ERROR_NO_ROUND}</p>
                )}
              </div>
            </div>
            <div style={{padding:"5vh"}}>
              <h2>{translations.fight?.PREVIEW_POINT}</h2>
              <div className="rounds-container">
                {combat.joueur_attack && combat.joueur_attack.length > 0 ? (
                  <table className="rounds-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>{translations.fight?.PREVIEW_TABLE_POINT.replace("[Name]", combat.joueur_name)}</th>
                        <th>{translations.fight?.PREVIEW_TABLE_POINT.replace("[Name]", combat.ennemi_name)}</th>
                        <th>{translations.fight?.PREVIEW_TABLE_WINNER_ROUND}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combat.joueur_attack.map((_: string, index: number) => (
                        <tr key={index} style={{backgroundColor: combat.gagnant == getDinoId() ? "rgb(0, 255, 0, 0.3)" : "rgb(255, 0, 0, 0.3)",}}>
                          <td>{index + 1}</td>
                          <td>{Array.isArray(combat.points_joueur[index]) ? combat.points_joueur[index].join(", ") : combat.points_joueur[index] || "—"}</td>
                          <td>{Array.isArray(combat.points_ennemi[index]) ? combat.points_ennemi[index].join(", ") : combat.points_ennemi[index] || "—"}</td>
                          <td>
                            {
                              Array.isArray(combat.points_ennemi[index]) && combat.points_ennemi[index].join(", ") > combat.points_joueur[index].join(", ")
                              ? combat.ennemi_name : combat.joueur_name  || "—"
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>{translations.fight?.ERROR_NO_ROUND}</p>
                )}
              </div>
            </div>
            <Link href="/fight/classic">
              <button className="btn btn-back">{translations.fight?.BACK_LIST_FICHT}</button>
            </Link>
            {
              getDinoId() == combat.joueur ? (
                <Link href={`/fight/classic/create/${combat.ennemi}`}>
                  <button className="btn btn-revenge">{translations.fight?.BUTTON_REVENGE}</button>
                </Link>
              ):(
                <Link href={`/fight/classic/create/${combat.joueur}`}>
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
