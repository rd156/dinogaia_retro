"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import Link from "next/link";
import "./page.css";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [rencontreInfo, setRencontreInfo] = useState<any[]>([]);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, [
        "cave",
        "pnj",
        "global",
      ]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      try {
        const caveResponse = await fetch(`${API_URL}/rencontre/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await caveResponse.json();
        console.log(result);
        setRencontreInfo(result);
      } catch (error) {
        setErrorMessage("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="content">
      <div className="content_top">
        <div className="block_white">
          <div className="rencontre-title">
            <h2>{translations.cave?.RENCONTRE_TITLE}</h2>
          </div>

          {rencontreInfo && rencontreInfo.map((rencontre) => (
              <div key={rencontre.id}>
                <p>{rencontre.current_action.description}</p>

                <Link href={`/cave/rencontre/${rencontre.id}`}>
                  <button
                    style={{
                      marginTop: "20px",
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      backgroundColor: "#007BFF",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    {translations.pnj?.["pnj_" + rencontre.pnj.name]}
                  </button>
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    </main>
  );
};

export default CavePage;
