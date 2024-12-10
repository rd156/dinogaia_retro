"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import ImageWithText from "@/components/pattern/ImageWithText";
import "./page.css";
import { motion } from "framer-motion";
import ButtonBordered from "@/components/pattern/ButtonBordered";
import ButtonCircular from "@/components/pattern/ButtonCircular";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonGlow from "@/components/pattern/ButtonGlow";
import ButtonIcon from "@/components/pattern/ButtonIcon";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ButtonRipple from "@/components/pattern/ButtonRipple";
import ButtonThreeD from "@/components/pattern/ButtonThreeD";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [info, setInfo] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

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
        const caveResponse = await fetch(`${API_URL}/cave/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!caveResponse.ok) {
          setErrorMessage(translations.cave?.ERR_LOAD_HUNT);
        }
        const cave_info = await caveResponse.json()
        console.log(cave_info)
        setInfo(cave_info);

      } catch (error) {
        setErrorMessage(translations.cave?.ERR_LOAD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      try {
        const caveResponse = await fetch(`${API_URL}/cave/get_item/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!caveResponse.ok) {
          setErrorMessage(translations.cave?.ERR_LOAD_HUNT);
        }
        const item_list = await caveResponse.json()
        console.log(item_list)
        setItems(item_list);

      } catch (error) {
        setErrorMessage(translations.cave?.ERR_LOAD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [activeCategory, setActiveCategory] = useState("ALL");
  const categories = ["ALL", "FOOD", "MEDOC", "RES", "ATK", "SKILL", "WEAPON", "ARTE", "TALIS", "HABI", "QUEST", "GOLD", "PACK", "OTHER"];
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCategoryToggle = (category) => {
    setActiveCategory((prevCategory) => (prevCategory === category ? "ALL" : category));
  };

  const handleItemClick = (item) => {
    setSelectedItem((prev) => (prev === item ? null : item)); // Définir ou effacer l'élément sélectionné
  };

  const handleButtonClick = (action) => {
    console.log(`Action "${action}" effectuée sur l'item :`, selectedItem);
    // Ajouter ici le code pour envoyer l'action à une API ou traiter l'action localement
    setSelectedItem(null); // Réinitialise après l'action
  };

  return (
    <main className="content">
      <div className="content_top">
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              style={{
                padding: "10px",
                backgroundColor: activeCategory === category ? "#007BFF" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {category === "ALL" ? "Tout afficher" : category}
            </button>
          ))}
        </div>

        {selectedItem && (
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
            <div className="block">
              <h3>Action sur : {selectedItem.item_name}</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleButtonClick("use")}>Use</button>
                <button onClick={() => handleButtonClick("eat")}>Eat</button>
                <button onClick={() => handleButtonClick("drink")}>Drink</button>
                <ButtonBordered onClick={() => alert("ButtonBordered Clicked!")} label="Cliquez-moi" />
                <ButtonCircular onClick={() => alert("ButtonCircular Clicked!")} label="Cliquez-moi" />
                <ButtonFancy onClick={() => alert("Fancy Clicked!")} label="Cliquez-moi" />
                <ButtonGlow onClick={() => alert("Glowy!")} label="Glow!" />
                <ButtonIcon onClick={() => alert("ButtonIcon Clicked!")} label="Cliquez-moi" />
                <ButtonNeon onClick={() => alert("Neon Activated!")} label="Neon Me!" />
                <ButtonRipple onClick={() => alert("ButtonRipple Clicked!")} label="Cliquez-moi" />
                <ButtonThreeD onClick={() => alert("ButtonThreeD Clicked!")} label="Cliquez-moi" />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", }}>
          {items &&
            Object.entries(items)
              .filter(([_, item]) => activeCategory === "ALL" || item.item_categorie === activeCategory)
              .map(([name, { item_name, quantite, item_categorie }]) => (
                <div
                  key={name}
                  className="block"
                  onClick={() => handleItemClick({ item_name, quantite, item_categorie })} // Enregistre l'item sélectionné
                  >
                  <ImageWithText src={`/item/${item_name}.webp`} alt={`${item_name} image`} quantity={quantite} />
                  <p>{item_name}</p>
                </div>
              ))}
        </div>
      </div>
    </main>
  );
};

export default CavePage;
