"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [imageFolder, setImageFolder] = useState<string>('reborn');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [cost, setCost] = useState(0);
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

    // Charger la gestion des images
    useEffect(() => {
      setImageFolder(localStorage.getItem("image_template") || "reborn");
    }, []);
  
    const getImageUrl = (itemName: string) => {
      if (imageFolder == "reborn"){
        return `/${itemName}`;
      }
      else{
        return `/template_image/${imageFolder}/${itemName}`;
      }
    };

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
        if (item_list.some(item => item.origine === "hunt")) {
          setCost(prevCost => prevCost + 2);
        }

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
      console.log(result)
      setItems((prevItems) =>
        prevItems.filter(item => !result.some(removeItem => removeItem.item_name === item.item_name))
      );
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
      setItems((prevItems) =>
        prevItems.filter(item => !result.some(removeItem => removeItem.item_name === item.item_name))
      );
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
        <div className='block_white title-container'>
          <h1 className="title-name">
            {translations.cave?.ITEM_COLLECT_PAGE}
          </h1>
        </div>
        <div style={{ marginBottom: "10px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <div className="block block_white">
            <div style={{ display: "flex", gap: "10px" }}>
              {
                cost > 0 ? (
                  <ButtonFancy onClick={() => handleButtonClickAll("get")} label={translations.cave?.GET_ALL.replace("[Number]", cost)} />
                ):(
                  <ButtonFancy onClick={() => handleButtonClickAll("get")} label={translations.cave?.GET_ALL_FREE} />
                )
              }
              <ButtonNeon onClick={() => handleButtonClickAll("sell")} label={translations.cave?.SELL_ALL} />

            </div>
          </div>
        </div>
        <div className="block_white">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th
                  style={{ textAlign: "center", cursor: "pointer", padding: "10px" }}
                  onClick={() => handleSort("item_name")}
                >
                  {translations.cave?.TABLE_NAME} {sortBy === "item_name" && (isAscending ? "↑" : "↓")}
                </th>
                <th
                  style={{ textAlign: "center", cursor: "pointer", padding: "10px" }}
                  onClick={() => handleSort("origine")}
                >
                  {translations.cave?.TABLE_ORIGIN} {sortBy === "origine" && (isAscending ? "↑" : "↓")}
                </th>
                <th style={{ textAlign: "center", padding: "10px" }}>{translations.cave?.TABLE_QUANTITY}</th>
                <th style={{ textAlign: "center", padding: "10px" }}>{translations.cave?.TABLE_ACTION}</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(items) && items.map((item, index) => (
                <tr key={index} style={{borderBottom: "1px solid #ddd"}}>
                  <td style={{ padding: "10px" }}>
                  <img
                    src={getImageUrl(`item/${item.item_name}.webp`)}
                    alt={translations.item?.IMAGE_ITEM?.replace("[Item]", item.item_name)}
                    style={{
                      width: "50px",
                      height: "50px",
                      marginBottom: "10px",
                    }}
                  />
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{translations.item?.['ORIGIN_'+ item.origine] ?? item.origine}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{item.quantite}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {item.origine === "hunt" ? (
                        <ButtonFancy onClick={() => handleButtonClick("get", item.item_name)} label={translations.cave?.GET.replace("[Number]", 2)} />
                      ) : (
                        <ButtonFancy onClick={() => handleButtonClick("get", item.item_name)} label={translations.cave?.FREE_GET}/>
                      )}
                      <ButtonNeon onClick={() => handleButtonClick("sell", item.item_name)} label={translations.cave?.SELL}/>
                    </div>
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
