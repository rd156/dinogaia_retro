"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const CombatPage: React.FC = () => {
  const params = useParams();
  const attackZones = ["haut", "milieu", "bas"];

  // Données des combattants en dur (en attendant l'API)
  const [fighter1, setFighter1] = useState({
    id: 1,
    name: "Dragon Rouge",
    avatar: "/images/dragon_rouge.png",
    hp: 100,
    attackPower: 20,
    defense: { haut: 0.8, milieu: 0.6, bas: 0.5 },
  });

  const [fighter2, setFighter2] = useState({
    id: 2,
    name: "Raptor Noir",
    avatar: "/images/raptor_noir.png",
    hp: 100,
    attackPower: 18,
    defense: { haut: 0.7, milieu: 0.5, bas: 0.6 },
  });

  const [playerAttack, setPlayerAttack] = useState<string | null>(null);
  const [playerDefense, setPlayerDefense] = useState<string | null>(null);
  const [roundMessage, setRoundMessage] = useState<string>("Choisissez votre attaque et défense !");
  const [isFighting, setIsFighting] = useState<boolean>(false);

  const handleFight = () => {
    if (!playerAttack || !playerDefense || isFighting) return;

    setIsFighting(true); // Désactiver les actions pendant l'animation

    setTimeout(() => {
      // Calcul des dégâts pour Fighter1 -> Fighter2
      const attackValue = fighter1.attackPower;
      const defenseMultiplier = fighter2.defense[playerAttack];
      const damage = Math.max(Math.round(attackValue * (1 - defenseMultiplier)), 0);

      // Mise à jour des PV
      setFighter2((prev) => ({
        ...prev,
        hp: Math.max(prev.hp - damage, 0),
      }));

      // Message du tour
      setRoundMessage(`${fighter1.name} attaque ${fighter2.name} au ${playerAttack} et inflige ${damage} dégâts !`);

      setTimeout(() => {
        // Réactiver les actions après l'animation
        setIsFighting(false);
      }, 2000);
    }, 1000);
  };

  return (
    <main className="combat-container">
      <h1>⚔️ Combat ⚔️</h1>

      <div className="fighters">
        <div className="fighter">
          <h3>{fighter1.name}</h3>
          <img src={fighter1.avatar} alt={fighter1.name} className="avatar" />
          <div className="hp-bar">
            <div className="hp" style={{ width: `${fighter1.hp}%` }}></div>
          </div>
          <p>{fighter1.hp} / 100 ❤️</p>
        </div>

        <div className="vs">🔥 VS 🔥</div>

        <div className="fighter">
          <h3>{fighter2.name}</h3>
          <img src={fighter2.avatar} alt={fighter2.name} className="avatar" />
          <div className="hp-bar">
            <div className="hp" style={{ width: `${fighter2.hp}%`, backgroundColor: "red" }}></div>
          </div>
          <p>{fighter2.hp} / 100 ❤️</p>
        </div>
      </div>

      <div className="choices">
        <div>
          <h3>🗡️ Choisissez une attaque</h3>
          {attackZones.map((zone) => (
            <button
              key={zone}
              className={`choice-button ${playerAttack === zone ? "selected" : ""}`}
              onClick={() => setPlayerAttack(zone)}
            >
              {zone.toUpperCase()}
            </button>
          ))}
        </div>

        <div>
          <h3>🛡️ Choisissez une défense</h3>
          {attackZones.map((zone) => (
            <button
              key={zone}
              className={`choice-button ${playerDefense === zone ? "selected" : ""}`}
              onClick={() => setPlayerDefense(zone)}
            >
              {zone.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ButtonFancy label="⚔️ Lancer l'attaque" onClick={handleFight} disabled={isFighting} />

      <p className="round-message">{roundMessage}</p>
    </main>
  );
};

export default CombatPage;
