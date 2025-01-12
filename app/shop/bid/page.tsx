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
  const [bid, setBid] = useState<any[]>([]);
  const [mybid, setMybid] = useState<any[]>([]);
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [dinoid, setDinoid] = useState();
  const [bidAmounts, setBidAmounts] = useState({});

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["shop", "item", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const dinoId = localStorage.getItem("dinoId");
      setDinoid(dinoId)
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/bid/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const fetchedData = await response.json();
        setBid(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        setErrorMessage('Impossible de récupérer les bids. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const dinoId = localStorage.getItem("dinoId");
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/bid/get_bid/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const fetchedData = await response.json();
        setMybid(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        setErrorMessage('Impossible de récupérer les bids. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBid = async (bidId, bidAmount) => {
    setErrorMessage("");
    setMessage("");
    console.log(`Enchérir sur le bid avec l'ID : ${bidId} au prix de ${bidAmount}`);
    try {
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      const bidData = {
        dino: dinoId,
        price: bidAmount,
      };
      console.log("bidData")
      console.log(bidData)
      const response = await fetch(`${API_URL}/bid/bid/${bidId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
        },
        body: JSON.stringify(bidData),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.shop?.ERR_BID);
      }
  
      const result = await response.json();
      console.log(result)
    } catch (error) {
      setErrorMessage(translations.shop?.ERR_BID);
    }
  };

  const getValueById = (id) => {
    const item = mybid.find((data) => data.bid.id === id);
    return item ? item.bid.last_price + " E": "Aucune enchere";
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
                <th style={{ padding: "10px" }}>Nom</th>
                <th style={{ padding: "10px" }}>Catégorie</th>
                <th style={{ padding: "10px" }}>Jour</th>
                <th style={{ padding: "10px" }}>Quantité</th>
                <th style={{ padding: "10px" }}>Dernier prix</th>
                <th style={{ padding: "10px" }}>Mon enchere</th>
                <th style={{ padding: "10px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bid.map((entry) => (
                <tr
                  key={entry.id}
                  style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
                >
                  <td style={{ padding: "10px" }}>{entry.item.name}</td>
                  <td style={{ padding: "10px" }}>{entry.item.categorie}</td>
                  <td style={{ padding: "10px" }}>{entry.day}</td>
                  <td style={{ padding: "10px" }}>{entry.quantity}</td>
                  <td style={{ padding: "10px" }}>{entry.last_price > 0 ? `${entry.last_price} E` : "Aucun prix"} {entry.last_dino == dinoid && " (moi)"} </td>
                  <td style={{ padding: "10px" }}>{getValueById(entry.id)}</td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      placeholder="Montant"
                      style={{
                        padding: "5px",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        width: "100px",
                      }}
                      value={bidAmounts[entry.id] || ""} // Associer la valeur au montant spécifique à la ligne
                      onChange={(e) =>
                        setBidAmounts((prev) => ({
                          ...prev,
                          [entry.id]: e.target.value, // Mettre à jour uniquement pour cette ligne
                        }))
                      }
                    />
                    <button
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleBid(entry.id, bidAmounts[entry.id])} // Passer le montant de cette ligne
                    >
                      Enchérir
                    </button>
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
