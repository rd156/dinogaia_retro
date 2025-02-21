"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import Link from "next/link"; // Importation de Link

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [imageFolder, setImageFolder] = useState<string>("reborn");
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [rencontreInfo, setRencontreInfo] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, [
        "cave",
        "item",
        "global",
      ]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  // Charger la gestion des images
  useEffect(() => {
    setImageFolder(localStorage.getItem("image_template") || "reborn");
  }, []);

  const getImageUrl = (itemName: string) => {
    if (imageFolder == "reborn") {
      return `/${itemName}`;
    } else {
      return `/template_image/${imageFolder}/${itemName}`;
    }
  };

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

  // Fonction pour gérer l'action lorsque le choix est sélectionné
  const handleChoiceClick = (nextActionId: number) => {
    // Ici tu pourrais ajouter une logique pour gérer ce qui se passe après un choix
    console.log("Choix sélectionné, action suivante:", nextActionId);
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="block_white">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            // Affichage des informations de la rencontre
            rencontreInfo.map((rencontre) => (
              <div key={rencontre.id}>
                <h2>Action en cours: {rencontre.current_action.name}</h2>
                <p>{rencontre.current_action.description}</p>

                {/* Ajouter un bouton pour rediriger vers la page de la rencontre */}
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
                    Voir la rencontre #{rencontre.id}
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default CavePage;
