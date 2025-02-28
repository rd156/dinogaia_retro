"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonGlow from "@/components/pattern/ButtonGlow";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [info, setInfo] = useState<any[]>([]);
  const [rencontre, setRencontre] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(null);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["cave", "item", "global"]);
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
        const caveResponse = await fetch(`${API_URL}/cave/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!caveResponse.ok) {
          setErrorMessage(translations.cave?.ERR_LOAD_CAVE);
        }
        const cave_info = await caveResponse.json()
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
        const rencontreResponse = await fetch(`${API_URL}/dino/rencontre/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const rencontre_info = await rencontreResponse.json()
        if (typeof rencontre_info === "object"){
          console.log(rencontre_info)
          setRencontre(rencontre_info);
        }
        else{
          setRencontre(null);
        }
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
      
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }

      try {
        const caveResponse = await fetch(`${API_URL}/cave/get_item/${dinoId}`, {
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
        setItems(item_list);

        console.log(item_list)

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
    console.log(item)
    setSelectedItem((prev) => (prev === item ? null : item));
  };

  const removeItem = (itemToRemove) => {
    const updatedItems = items.map(item => 
      item.item_name === itemToRemove.item_name 
        ? { ...item, quantite: item.quantite - 1 }
        : item
    ).filter(item => item.quantite > 0);
  
    setItems(updatedItems);
  };  
  
  const handleButtonClick = async (action) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");

    try {
      let apiUrl;
  
      if (action === "use") {
        apiUrl = `${API_URL}/cave/use/${dinoId}`;
      } else if (action === "eat") {
        apiUrl = `${API_URL}/cave/eat/${dinoId}`;
      }else if (action === "sell_shop") {
        apiUrl = `${API_URL}/cave/sell_item/${dinoId}`;
      } else {
        setErrorMessage(translations.cave?.ERR_TYPE_ACTION);
        return;
      }
  
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
        },
        body: JSON.stringify({
          "item": selectedItem.item_name,
          "quantity": 1
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.cave?.ERR_ACTION);
      }
  
      const result = await response.json();
      console.log(result)
      if (result.message && result.message==action){
        setMessage(translations.cave?.["ACTION_DONE_" + action] ?? translations.cave?.ACTION_DONE);
        setErrorMessage("")
        removeItem(selectedItem)
      }
      else if (result.sell)
      {
        setMessage(translations.cave?.SELL_RESULT_VALUE.replace("[Number]", result.sell))
        setErrorMessage("")
        removeItem(selectedItem)
      }
      else{
        setMessage("")
        setErrorMessage(translations.cave?.ERR_IMPOSSIBLE_ACTION);
      }
  
      setSelectedItem(null);
    } catch (error) {
      setErrorMessage(translations.cave?.ERR_ACTION);
    }
  };

  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      try {
        const response = await fetch(`${API_URL}/dino/waiting_item/${dinoId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCount(data.count);
        }
      }
      catch (error) {
      }
    };

    fetchCount();
  }, []);
  
  return (
    <main className="content">
      <div className="content_top"> 
        <div className='cave-container'>
            <div className="cave-card block_white">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div>
                  <h1 className="cave-name">
                    {info.name}
                  </h1>
                  {info.description}
                </div>
                  { rencontre && (
                    <div style={{ marginLeft: 'auto' }}>
                      <ButtonFancy onClick={() => { window.location.href = "/cave/rencontre/"+ rencontre.id }} label={translations.cave?.RENCONTRE_CAVE_SOMEONE} />
                    </div>
                  )}
              </div>
              <div className="cave-header">
                <div className="stat-item">
                  <p>{translations.cave?.LEVEL}: <strong>{info.lvl}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.cave?.SECURITY}: <strong>{info.security}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.cave?.HYGIENE}: <strong>{info.hygiene}</strong></p>
                </div>
                <div className="stat-item">
                  <p>{translations.cave?.CONFORT}: <strong>{info.confort}</strong></p>
                </div>
              </div>
              <div className="cave-stats">
                <div className="stat-block">
                  <div className="progress-bar">
                    <div
                      className="progress-fill storage-bar"
                      style={{ width: `${(info.storage/info.storage_max) * 100}%` }}
                    >
                      {info.storage > 0 && (
                      <span className="progress-text">
                        {info.storage}/{info.storage_max}
                      </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {count > 0 && (
                <div className="count-container" style={{
                  marginTop: "10px",
                  backgroundColor: "#41c75e",
                }}>
                  <h3 className="cave-name" onClick={() => {
                      window.location.href = "/cave/waiting";
                    }}>
                    {translations.cave?.WAINTING_NUMBER.replace("[Number]", count)}
                  </h3>
                </div>
              )}
              <ButtonGlow onClick={() => { window.location.href = "/cave/craft"; }} label={translations.cave?.CRAFT_BUTTON} />
            </div>
        </div>
        <div>
          {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                style={{
                  padding: "10px",
                  margin: "10px",
                  backgroundColor: activeCategory === category ? "#007BFF" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {category === "ALL" ? translations.cave?.DISPLAY_ALL : translations.item?.['CATEGORY_'+ category] ?? category}
              </button>
            ))}
        </div>
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <br />
        {selectedItem && (
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
            <div className="block_white">
              <h3 style={{marginBottom: "10px"}}>
                {translations.cave?.["ACTION_ON"].replace("[Item]", translations.item?.['ITEM_' + selectedItem.item_name] ?? selectedItem.item_name)}
              </h3>
              {translations.item?.['ITEM_DESC_' + selectedItem.item_name] ?? translations.item?.NO_DESC.replace("[Item]", translations.item?.['ITEM_' + selectedItem.item_name])}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
                {selectedItem.action && selectedItem.action.use && (
                  <ButtonFancy onClick={() => handleButtonClick("use")} label={translations.cave?.USE} />
                )}
                {selectedItem.action && selectedItem.action.eat && (
                  <ButtonNeon onClick={() => handleButtonClick("eat")} label={translations.cave?.EAT} />
                )}
                {selectedItem.action && selectedItem.action.open && (
                  <ButtonFancy onClick={() => handleButtonClick("open")} label={translations.cave?.USE} />
                )}
                <ButtonNeon onClick={() => handleButtonClick("sell_shop")} label={translations.cave?.SELL_SHOP_PRICE.replace("[Number]", Math.floor(selectedItem.item_price_min / 2))} />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
          {items &&
          Object.entries(items)
          .filter(([_, item]) => activeCategory === "ALL" || item.item_categorie === activeCategory)
          .map(([name, item]) => (
            <div
              key={name}
              className="relative block_white"
              onClick={() => handleItemClick(item)}
            >
              <ImageItemWithText 
                itemName={item.item_name}
                quantity={item.quantite}
                translations={translations.item}
              />
              <p>{translations.item?.['ITEM_' + item.item_name] ?? item.item_name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CavePage;
