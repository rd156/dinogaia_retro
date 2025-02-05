"use client";

import { useState } from "react";
import "./combat.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const attackZones = ["haut", "milieu", "bas"];

const CombatPage: React.FC = () => {
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

  // Stocke les 3 attaques et 3 défenses
  const [playerAttacks, setPlayerAttacks] = useState<string[]>([]);
  const [playerDefenses, setPlayerDefenses] = useState<string[]>([]);
  const [roundMessage, setRoundMessage] = useState<string>("Sélectionnez vos attaques et défenses !");
  const [isFighting, setIsFighting] = useState<boolean>(false);

  // Ajoute une attaque si la liste est < 3
  const selectAttack = (zone: string) => {
    if (playerAttacks.length < 3) {
      setPlayerAttacks([...playerAttacks, zone]);
    }
  };

  // Ajoute une défense si la liste est < 3
  const selectDefense = (zone: string) => {
    if (playerDefenses.length < 3) {
      setPlayerDefenses([...playerDefenses, zone]);
    }
  };

  // Réinitialise les choix
  const resetChoices = () => {
    setPlayerAttacks([]);
    setPlayerDefenses([]);
    setRoundMessage("Sélectionnez vos attaques et défenses !");
  };

  // Exécute les 3 tours de combat
  const handleFight = () => {
    if (playerAttacks.length < 3 || playerDefenses.length < 3) {
      setRoundMessage("Vous devez choisir 3 attaques et 3 défenses !");
      return;
    }

    setIsFighting(true);
    let logMessages = [];

    let tempFighter2HP = fighter2.hp;

    for (let i = 0; i < 3; i++) {
      const attackZone = playerAttacks[i];
      const defenseMultiplier = fighter2.defense[attackZone];
      const damage = Math.max(Math.round(fighter1.attackPower * (1 - defenseMultiplier)), 0);

      tempFighter2HP = Math.max(tempFighter2HP - damage, 0);

      logMessages.push(
        `Tour ${i + 1}: ${fighter1.name} attaque ${fighter2.name} au ${attackZone} → ${damage} dégâts`
      );
    }

    setFighter2((prev) => ({ ...prev, hp: tempFighter2HP }));
    setRoundMessage(logMessages.join(" | "));
    setTimeout(() => setIsFighting(false), 2000);
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
          <h3>🗡️ Choisissez 3 attaques</h3>
          {attackZones.map((zone) => (
            <button
              key={zone}
              className={`choice-button ${playerAttacks.includes(zone) ? "selected" : ""}`}
              onClick={() => selectAttack(zone)}
              disabled={playerAttacks.length >= 3}
            >
              {zone.toUpperCase()}
            </button>
          ))}
          <p>Attaques : {playerAttacks.join(", ")}</p>
        </div>

        <div>
          <h3>🛡️ Choisissez 3 défenses</h3>
          {attackZones.map((zone) => (
            <button
              key={zone}
              className={`choice-button ${playerDefenses.includes(zone) ? "selected" : ""}`}
              onClick={() => selectDefense(zone)}
              disabled={playerDefenses.length >= 3}
            >
              {zone.toUpperCase()}
            </button>
          ))}
          <p>Défenses : {playerDefenses.join(", ")}</p>
        </div>
      </div>

      <ButtonFancy label="⚔️ Attaquer" onClick={handleFight} disabled={isFighting} />
      <ButtonFancy label="🔄 Réinitialiser" onClick={resetChoices} />

      <p className="round-message">{roundMessage}</p>
    </main>
  );
};

export default CombatPage;
