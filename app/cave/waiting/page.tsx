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
  const [items, setItems] = useState([]);

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
        const caveResponse = await fetch(`${API_URL}/dino/waiting/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!caveResponse.ok) {
          setErrorMessage(translations.cave?.ERR_LOAD_ITEM);
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

  // Fonction pour trier les items
  const [sortBy, setSortBy] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  // Fonction pour trier les items
  const handleSort = (key) => {
    const sortedItems = [...items].sort((a, b) => {
      if (a[key] < b[key]) return isAscending ? -1 : 1;
      if (a[key] > b[key]) return isAscending ? 1 : -1;
      return 0;
    });

    setItems(sortedItems);
    setSortBy(key);
    setIsAscending((prevState) => (key === sortBy ? !prevState : true));
  };

  const handleButtonClick = async (action, item) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");

    console.log(action + " " +  item)
    try {
      let apiUrl;

      if (action === "get") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/collect`;
      } else if (action === "sell") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/sell`;
      } else {
        setErrorMessage(translations.cave?.ERR_TYPE_ACTION);
        return;
      }
  
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "item": item
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.cave?.ERR_ACTION);
      }
  
      const result = await response.json();
    } catch (error) {
      setErrorMessage(translations.cave?.ERR_ACTION);
    }
  };

  const handleButtonClickAll = async (action) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");

    try {
      let apiUrl;

      if (action === "get") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/collect`;
      } else if (action === "sell") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/sell`;
      } else {
        setErrorMessage(translations.cave?.ERR_TYPE_ACTION);
        return;
      }
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        }
      });
  
      if (!response.ok) {
        setErrorMessage(translations.cave?.ERR_ACTION);
      }
  
      const result = await response.json();
    } catch (error) {
      setErrorMessage(translations.cave?.ERR_ACTION);
    }
  };

  return (
    <main className="content">
      <div className="content_top"> 
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <div className='title-container'>
          <h1 className="title-name">
            {translations.cave?.ITEM_COLLECT_PAGE}
          </h1>
        </div>
        <div style={{ marginBottom: "10px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <div className="block">
            <div style={{ display: "flex", gap: "10px" }}>
              <ButtonFancy onClick={() => handleButtonClickAll("get")} label="Tout récuperer pour 2 émeraudes" />
              <ButtonNeon onClick={() => handleButtonClickAll("sell")} label="Vendre" />
            </div>
          </div>
        </div>
        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th
                  style={{ textAlign: "center", cursor: "pointer", padding: "10px" }}
                  onClick={() => handleSort("item_name")}
                >
                  Nom {sortBy === "item_name" && (isAscending ? "↑" : "↓")}
                </th>
                <th
                  style={{ textAlign: "center", cursor: "pointer", padding: "10px" }}
                  onClick={() => handleSort("origine")}
                >
                  Origine {sortBy === "origine" && (isAscending ? "↑" : "↓")}
                </th>
                <th style={{ textAlign: "center", padding: "10px" }}>Quantité</th>
                <th style={{ textAlign: "center", padding: "10px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{borderBottom: "1px solid #ddd"}}>
                  <td style={{ textAlign: "center", padding: "10px" }}>{item.item_name}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{item.origine}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{item.quantite}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                  {item.origine === "hunt" ? (
                    <ButtonFancy onClick={() => handleButtonClick("get", item.item_name)} label="Récuperer pour 2 émeraude" />
                  ) : (
                    <ButtonFancy onClick={() => handleButtonClick("get", item.item_name)} label="Récuperer" />
                  )}
                    <ButtonNeon onClick={() => handleButtonClick("sell", item.item_name)} label="Vendre" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default CavePage;
