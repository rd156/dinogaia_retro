"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import AchievementWithTooltip from "@/components/pattern/AchievementWithTooltip";

interface Translations {
  [key: string]: any;
}

interface Stat {
  global_stats: {
    [key: string]: number;
  },
  combat_stats: {
    [key: string]: number;
  },
  hunting_stats: {
    [key: string]: number;
  },
  finance_stats: {
    [key: string]: number;
  },
  social_stats: {
    [key: string]: number;
  },
  special_stats: {
    [key: string]: number;
  }
}

interface Achievement {
  name: string;
  value: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
}

const AchievementPage: React.FC = () => {
  const [stats, setStats] = useState<Stat>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    GLOBAL: true,
    COMBAT: true,
    HUNT: true,
    FINANCE: true,
    SOCIAL: true,
    SPECIAL: true
  });

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["achievement", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/stats/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(translations.achievement?.ERROR_LOAD_ACHIEVEMENTS);
        }

        const result = await response.json();
        console.log(result);
        setStats(result);
        
      } catch (error) {
        setErrorMessage(translations.achievement?.ERROR_LOAD_ACHIEVEMENTS || "Erreur lors du chargement des succès");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [translations.achievement]);

  const processAchievements = (
    key: string,
    value: number
  ): { rank: 'gold' | 'silver' | 'bronze' | 'platine' | null; nextThreshold: number | null } => {
    let bronze = 1, silver = 5, gold = 10, platine = 100;
  
    if (key.startsWith('a_')) {
      bronze = 1;
      silver = 5;
      gold = 10;
      platine = 100;
    }
    else if (key.startsWith('b_')) {
      bronze = 10;
      silver = 100;
      gold = 1000;
      platine = 5000;
    }
    else if (key.startsWith('c_')) {
      bronze = 1000;
      silver = 10000;
      gold = 100000;
      platine = 1000000;
    }
    else if (key.startsWith('d_')) {
      bronze = 1;
      silver = 10;
      gold = 50;
      platine = 100;
    }
    else if (key.startsWith('e_')) {
      bronze = 1;
      silver = 5;
      gold = 10;
      platine = 100;
    }

    if (value >= platine) return { rank: 'platine', nextThreshold: null };
    if (value >= gold) return { rank: 'gold', nextThreshold: platine };
    if (value >= silver) return { rank: 'silver', nextThreshold: gold };
    if (value >= bronze) return { rank: 'bronze', nextThreshold: silver };
  
    return { rank: null, nextThreshold: bronze };
  };
  

  const renderAchievements = (stats: any, category: string) => {
    if (!stats || stats.length === 0) return null;

    let categoryStats;
    switch(category) {
      case "GLOBAL":
        categoryStats = stats?.global_stats;
        break;
      case "COMBAT":
        categoryStats = stats?.combat_stats;
        break;
      case "HUNT":
        categoryStats = stats?.hunting_stats;
        break;
      case "FINANCE":
        categoryStats = stats?.finance_stats;
        break;
      case "SOCIAL":
        categoryStats = stats?.social_stats;
        break;
      case "SPECIAL":
        categoryStats = stats?.special_stats;
        break;
      default:
        categoryStats = null;
    }

    if (!categoryStats) return null;

    return Object.entries(categoryStats).map(([key, value]) => {
      const medal = processAchievements(key, value as number);
      if (translations.achievement?.["achievement_" + key] && translations.achievement?.["achievement_" + key] != "TODO")
      {
        return (
          <AchievementWithTooltip
              key={key}
              achievementKey={key}
              medal={medal}
              value={value as number}
              translations={translations}
            />
        );
      }
      else{
        return;
      }
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="block_white">
            <h1 className="title">{translations.achievement?.TITLE || "Succès"}</h1>

            <div className="achievement-section">
              <div className="section-header" onClick={() => toggleCategory("GLOBAL")}>
                <h2 className="section-title">{translations.achievement?.GLOBAL || "Global"}</h2>
                <span className={`toggle-icon ${expandedCategories["GLOBAL"] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {expandedCategories["GLOBAL"] && (
                <div className="achievement-category">
                  <div className="achievements-list">
                    {renderAchievements(stats, "GLOBAL")}
                  </div>
                </div>
              )}
            </div>

            <div className="achievement-section">
              <div className="section-header" onClick={() => toggleCategory("COMBAT")}>
                <h2 className="section-title">{translations.achievement?.COMBAT || "Combat"}</h2>
                <span className={`toggle-icon ${expandedCategories["COMBAT"] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {expandedCategories["COMBAT"] && (
                <div className="achievement-category">
                  <div className="achievements-list">
                    {renderAchievements(stats, "COMBAT")}
                  </div>
                </div>
              )}
            </div>

            <div className="achievement-section">
              <div className="section-header" onClick={() => toggleCategory("HUNT")}>
                <h2 className="section-title">{translations.achievement?.HUNT || "Chasse"}</h2>
                <span className={`toggle-icon ${expandedCategories["HUNT"] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {expandedCategories["HUNT"] && (
                <div className="achievement-category">
                  <div className="achievements-list">
                    {renderAchievements(stats, "HUNT")}
                  </div>
                </div>
              )}
            </div>

            <div className="achievement-section">
              <div className="section-header" onClick={() => toggleCategory("FINANCE")}>
                <h2 className="section-title">{translations.achievement?.FINANCE || "Finance"}</h2>
                <span className={`toggle-icon ${expandedCategories["FINANCE"] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {expandedCategories["FINANCE"] && (
                <div className="achievement-category">
                  <div className="achievements-list">
                    {renderAchievements(stats, "FINANCE")}
                  </div>
                </div>
              )}
            </div>

            <div className="achievement-section">
              <div className="section-header" onClick={() => toggleCategory("SOCIAL")}>
                <h2 className="section-title">{translations.achievement?.SOCIAL || "Social"}</h2>
                <span className={`toggle-icon ${expandedCategories["SOCIAL"] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {expandedCategories["SOCIAL"] && (
                <div className="achievement-category">
                  <div className="achievements-list">
                    {renderAchievements(stats, "SOCIAL")}
                  </div>
                </div>
              )}
            </div>

            <div className="achievement-section">
              <div className="section-header" onClick={() => toggleCategory("SPECIAL")}>
                <h2 className="section-title">{translations.achievement?.SPECIAL || "Spécial"}</h2>
                <span className={`toggle-icon ${expandedCategories["SPECIAL"] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
              {expandedCategories["SPECIAL"] && (
                <div className="achievement-category">
                  <div className="achievements-list">
                    {renderAchievements(stats, "SPECIAL")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AchievementPage;