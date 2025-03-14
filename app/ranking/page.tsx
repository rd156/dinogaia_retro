"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

interface Translations {
  [key: string]: any;
}

interface Dino {
  name: string;
  dino_name_account: string;
  level: {
    species: number;
    lvl: number;
  };
}

interface RankingEntry {
  id: number;
  dino: Dino;
  score: number;
  category: string;
}

interface RankingState {
  top: RankingEntry[];
  user: RankingEntry;
}

const RankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<RankingState>();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [activeCategory, setActiveCategory] = useState<string>("fight");
  const categories = ["FIGHT", "HUNT"];

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["dino","ranking", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem("token");
        const dinoId = localStorage.getItem("dinoId");
        const response = await fetch(`${API_URL}/ranking/${dinoId}/${activeCategory.toLowerCase()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(translations.ranking?.ERROR_LOAD_RANKING);
        }

        const result = await response.json();
        console.log(result);
        setRankings(result);
      } catch (error) {
        setErrorMessage(translations.ranking?.ERROR_LOAD_RANKING || "Erreur lors du chargement du classement");
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [activeCategory, translations.ranking]);

  const isUserInTop = rankings?.top.some((entry) => entry.id === rankings?.user?.id);
  
  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
          <div className="block_white">
            <h1 className="title">{translations.ranking?.TITLE || "Classement"}</h1>
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
              {categories.map((category) => (
                <ButtonFancy
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  label={translations.ranking?.[`CATEGORY_${category}`] || category}
                />
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center"}}>
                <thead>
                  <tr style={{ backgroundColor: "#f4f4f4" }}>
                    <th className="px-4 py-2">{translations.ranking?.RANK || "Rang"}</th>
                    <th className="px-4 py-2">{translations.ranking?.DINO_NAME || "Nom du Dino"}</th>
                    <th className="px-4 py-2">{translations.ranking?.PSEUDO || "Pseudo"}</th>
                    <th className="px-4 py-2">{translations.ranking?.SPECIE || "Espece"}</th>
                    <th className="px-4 py-2">{translations.ranking?.LEVEL || "Niveau"}</th>
                    <th className="px-4 py-2">{translations.ranking?.SCORE || "Score"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings && rankings.top && rankings.top.length > 0 && rankings.top.map((entry, index) => (
                    <tr 
                      key={index}
                      style={{ 
                        backgroundColor: index < 3 ? "rgba(255, 215, 0, 0.1)" : "transparent",
                        borderBottom: "1px solid #ddd",
                        textAlign: "center"
                      }}
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 text-center">
                        {index < 3 ? (
                          <span style={{ 
                            fontSize: "1.2em",
                            color: ["#FFD700", "#C0C0C0", "#CD7F32"][index]
                          }}>
                            {entry.dino.name}
                          </span>
                        ) : entry.dino.name}
                      </td>
                      <td className="px-4 py-2">{entry.dino.dino_name_account}</td>
                      <td className="px-4 py-2">{translations.dino?.["SPECIE_" + entry.dino.level.species]}</td>
                      <td className="px-4 py-2">{entry.dino.level.lvl}</td>
                      <td className="px-4 py-2">{entry.score}</td>
                    </tr>
                  ))}
                  {rankings && rankings.user && !isUserInTop && (
                    <tr 
                      key={101}
                      style={{
                        borderBottom: "1px solid #ddd"
                      }}
                    >
                      <td className="px-4 py-2">......</td>
                      <td className="px-4 py-2 text-center">......</td>
                      <td className="px-4 py-2">......</td>
                      <td className="px-4 py-2">......</td>
                      <td className="px-4 py-2">......</td>
                      <td className="px-4 py-2">......</td>
                    </tr>
                  )}
                  {rankings && rankings.user && !isUserInTop && (
                    <tr 
                      key={102}
                      style={{
                        borderBottom: "1px solid #ddd"
                      }}
                    >
                      <td className="px-4 py-2">ꝏ</td>
                      <td className="px-4 py-2 text-center">{rankings.user.dino.name}</td>
                      <td className="px-4 py-2">{rankings.user.dino.dino_name_account}</td>
                      <td className="px-4 py-2">{translations.dino?.["SPECIE_" + rankings.user.dino.level.species]}</td>
                      <td className="px-4 py-2">{rankings.user.dino.level.lvl}</td>
                      <td className="px-4 py-2">{rankings.user.score}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </main>
  );
};

export default RankingPage; 