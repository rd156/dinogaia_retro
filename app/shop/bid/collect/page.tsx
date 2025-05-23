"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ItemWithTooltip from "@/components/pattern/ItemWithTooltip";

interface Translations {
  [key: string]: any;
}

interface Bid {
  [key: string]: any;
}
const CavePage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [winBig, setWinBig] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<Bid[]>([]);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["shop", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      try {
        const response = await fetch(`${API_URL}/bid/result/${dinoId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setData(data);
        }
      }
      catch (error) {
      }
    };
    fetchCount();
  }, []);

  const handleButtonClick = async (id_bid: number) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      const response = await fetch(`${API_URL}/bid/result/${dinoId}/collect/${id_bid}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
      });
  
      if (!response.ok) {
        setErrorMessage(translations.cave?.ERR_ACTION);
      }
  
      const result = await response.json();
      if (result.bid.id === id_bid){
        setData(prevData => prevData.filter((entry: Bid) => entry.bid.id !== id_bid));
      }
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
        
        <div className="block_white">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_ITEM_IMAGE}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_QUANTITY}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_CATEGORY}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_LAST_PRICE}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_DAY}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_ACTION}</th>
              </tr>
            </thead>
            <tbody>
              {data && data.map((entry: Bid) => (
                <tr key={entry.bid.id} style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                  <td style={{ padding: "10px" }}>
                    <ItemWithTooltip 
                      itemName={entry.bid.item.name}
                      translations={translations.item}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>{entry.bid.quantity}</td>
                  <td style={{ padding: "10px" }}>{translations.item?.['CATEGORY_'+ entry.bid.item.categorie] ?? entry.bid.item.categorie}</td>
                  <td style={{ padding: "10px" }}>{entry.bid.last_price + " E"}</td>
                  <td style={{ padding: "10px" }}>{entry.bid.day}</td>
                  <td style={{ padding: "10px" }}>
                    {
                      entry.bid.last_dino === entry.dino ? (
                        <ButtonFancy onClick={() => handleButtonClick(entry.bid.id)} label={translations.shop?.RETRIEVE_OBJECT} />
                      ) : entry.bid.last_dino !== entry.dino && entry.price > 0 ? (
                        <ButtonNeon onClick={() => handleButtonClick(entry.bid.id)} label={translations.shop?.RETRIEVE_EMERAUD} />
                      ) : null
                    }
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
