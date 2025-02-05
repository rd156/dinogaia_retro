"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import "./page.css";
import { API_URL } from "@/config/config";
import Link from "next/link";
import { useParams } from 'next/navigation';

const CombatPreviewPage: React.FC = () => {
  const { id: combatId } = useParams();
  const [combat, setCombat] = useState<any>(null);
  const [message, setMessage] = useState<string>("");

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

        if (!response.ok) throw new Error("Erreur lors du chargement des détails du combat.");
        const data = await response.json();
        console.log(data)
        setCombat(data);
      } catch (error) {
        console.error("Erreur :", error);
        setMessage("Impossible de charger les informations du combat.");
      }
    };

    fetchCombatDetails();
  }, [combatId]);

  return (
    <main className="content">
      <div className="content_top">
      <div className="combat-container block_white">
        <h1>📜 Aperçu du Combat #{combatId}</h1>

        {message && <p className="message">{message}</p>}

        {combat ? (
          <>
            {/* 📌 Détails du combat */}
            <div className="combat-summary">
              <p><strong>🦖 Joueur :</strong> {combat.joueur_name}</p>
              <p><strong>⚔️ Ennemi :</strong> {combat.ennemi_name}</p>
              <p><strong>📅 Date :</strong> {new Date(combat.created_at).toLocaleString()}</p>
              <p><strong>🏁 Statut :</strong> <span className={`status ${combat.status}`}>{combat.status}</span></p>
            </div>

            {/* 🏆 Rounds du combat */}
            <h2>🔄 Rounds</h2>
            <div className="rounds-container">
              {combat.joueur_attack && combat.joueur_attack.length > 0 ? (
                <table className="rounds-table">
                  <thead>
                    <tr>
                      <th>🔢 Round</th>
                      <th>🦖 Attaque Joueur</th>
                      <th>🛡️ Défense Joueur</th>
                      <th>⚔️ Attaque Ennemi</th>
                      <th>🛡️ Défense Ennemi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combat.joueur_attack.map((_, index) => (
                      <tr key={index}>
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
                <p>Aucun round disponible.</p>
              )}
            </div>

            {/* 🔙 Retour au menu */}
            <Link href="/fight/classic/list">
              <button className="btn btn-back">Retour aux combats</button>
            </Link>
          </>
        ) : (
          <p>Chargement en cours...</p>
        )}
      </div>
      </div>
    </main>
  );
};

export default CombatPreviewPage;
