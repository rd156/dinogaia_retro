import { useState } from "react";

interface Translations {
  [key: string]: any;
}

interface Medal {
  rank: "platine" | "gold" | "silver" | "bronze" | null;
  nextThreshold: number | null;
}

const AchievementWithTooltip = ({ medal, translations, achievementKey, value }: { 
  medal: Medal, 
  translations: Translations, 
  achievementKey: string, 
  value: number 
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="achievement-item relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`achievement-medal ${medal.rank || ''}`}>
        {medal && <span className="medal-icon">🏆</span>}
      </div>
      <div className="achievement-info">
        <h3>{translations.achievement?.["achievement_" + achievementKey] || achievementKey}</h3>
        {medal.nextThreshold !== null ? (
          <p>{value} / {medal.nextThreshold}</p>
        ) : (
          <p>{value}</p>
        )}
      {hovered && (
        <div>
          {translations.achievement?.["achievement_desc_" + achievementKey] || "Aucune description"}  
        </div>
      )}
      </div>
    </div>
  );
};

export default AchievementWithTooltip;
