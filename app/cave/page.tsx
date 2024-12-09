"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [weapons, setWeapons] = useState<any[]>([]);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["cave", "item", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  // Récupérer les données du serveur
  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");

      try {
        // Récupération des données de chasse
        const weaponResponse = await fetch(`${API_URL}/cave/get_item_weapon/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!weaponResponse.ok) {
          setErrorMessage(translations.hunt?.ERR_LOAD_HUNT);
        }
        const item_list = await weaponResponse.json()
        console.log(item_list)
        setWeapons(item_list);

      } catch (error) {
        setErrorMessage(translations.hunt?.ERR_LOAD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <div className="block">
          DISPLAY PAGE
        </div>
      </div>
    </main>
  );
};

export default CavePage;
