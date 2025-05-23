"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ItemWithTooltip from "@/components/pattern/ItemWithTooltip";

interface Translations {
  [key: string]: any;
}

interface Item {
  id: number;
  item_name: string;
  origine: string;
  quantite: number;
  expire_date: string;
  item_price_min: string;
}

const CavePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorResult, setErrorResult] = useState("");
  const [message, setMessage] = useState("");
  const [cost, setCost] = useState(0);
  const [totalSell, setTotalSell] = useState(0);
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [items, setItems] = useState<Item[]>([]);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["cave", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);


  // Récupérer les données du serveur

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

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
        if (item_list.some((item: Item) => item.origine === "hunt")) {
          setCost(prevCost => prevCost + 2);
        }
        const totalCost = item_list.reduce(
          (sum: number, item: Item) => sum + (parseInt(item.item_price_min) * item.quantite),
          0
        )
        setTotalSell(totalCost / 2);

      } catch (error) {
        setErrorMessage(translations.cave?.ERR_LOAD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translations]);

  // Fonction pour trier les items
  const [sortBy, setSortBy] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  // Fonction pour trier les items
  const handleSort = (key: keyof Item) => {
    const sortedItems = [...items].sort((a, b) => {
      if (a[key] < b[key]) return isAscending ? -1 : 1;
      if (a[key] > b[key]) return isAscending ? 1 : -1;
      return 0;
    });

    setItems(sortedItems);
    setSortBy(key);
    setIsAscending((prevState) => (key === sortBy ? !prevState : true));
  };

  const handleButtonClick = async (action: "get" | "sell", item: Item) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    console.log(item)
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
          "waitingId": item.id
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.cave?.ERR_ACTION);
      }
  
      const result = await response.json();
      setItems((prevItems) =>
        prevItems.filter(item => !result.some((removeItem: Item) => removeItem.id === item.id))
      );
    } catch (error) {
      setErrorMessage(translations.cave?.ERR_ACTION);
    }
  };

  const handleButtonClickAll = async (action: "get" | "sell" | "get_free") => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      let apiUrl;

      if (action === "get") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/collect`;
      } else if (action === "sell") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/sell`;
      } else if (action === "get_free") {
        apiUrl = `${API_URL}/dino/waiting/${dinoId}/collect_free`;
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
      console.log(result)
      if (Array.isArray(result)) {
        setItems((prevItems) =>
          prevItems.filter(item =>
            !result.some(removeItem => removeItem.id === item.id)
          )
        );
      }
      else{
        setErrorResult(result)
        setErrorMessage(translations.cave?.CAVE_ERROR_storage_full)
      }
    } catch (error) {
      setErrorMessage(translations.cave?.ERR_ACTION);
    }
  };

  const getSellValue = (item: Item) => {
    return (parseInt(item.item_price_min) * item.quantite) / 2
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
              {errorResult == "" && (
                cost > 0 ? (
                  <>
                    <ButtonFancy onClick={() => handleButtonClickAll("get")} label={translations.cave?.GET_ALL.replace("[Number]", cost)} />
                    <ButtonFancy onClick={() => handleButtonClickAll("get_free")} label={translations.cave?.GET_ALL_FREE} />
                  </>
                ) : (
                  <ButtonFancy onClick={() => handleButtonClickAll("get")} label={translations.cave?.GET_ALL_WHEN_FREE} />
                )
              )}
              <ButtonNeon onClick={() => handleButtonClickAll("sell")} label={translations.cave?.SELL_ALL_VALUE.replace("[Number]", totalSell)} />
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
                <th style={{ textAlign: "center", padding: "10px" }}>{translations.cave?.TABLE_EXPIRE}</th>
                <th style={{ textAlign: "center", padding: "10px" }}>{translations.cave?.TABLE_ACTION}</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(items) && items.map((item, index) => (
                <tr key={index} style={{borderBottom: "1px solid #ddd"}}>
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      <ItemWithTooltip 
                        itemName={item.item_name}
                        translations={translations.item}
                      />
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{translations.item?.['ORIGIN_'+ item.origine] ?? item.origine}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{item.quantite}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{formatDate(item.expire_date)}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {item.origine === "hunt" ? (
                        <ButtonFancy onClick={() => handleButtonClick("get", item)} label={translations.cave?.GET.replace("[Number]", 2)} />
                      ) : (
                        <ButtonFancy onClick={() => handleButtonClick("get", item)} label={translations.cave?.FREE_GET}/>
                      )}
                      <ButtonNeon onClick={() => handleButtonClick("sell", item)} label={translations.cave?.SELL_VALUE.replace("[Number]", getSellValue(item))}/>
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
