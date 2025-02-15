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
  const [bid, setBid] = useState<any[]>([]);
  const [mybid, setMybid] = useState<any[]>([]);
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [countWin, setCountWin] = useState(null);
  const [countBid, setCountBid] = useState(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [dinoid, setDinoid] = useState();
  const [bidAmounts, setBidAmounts] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null); 

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["shop", "item", "global"]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const dinoId = localStorage.getItem("dinoId");
	  if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
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
        console.log(fetchedData)
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
	  if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
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
	  if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
      const bidData = {
        dino: dinoId,
        price: bidAmount,
      };
      const response = await fetch(`${API_URL}/bid/bid/${bidId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify(bidData),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.shop?.ERR_BID);
      }
  
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBid((prevBid) =>
          prevBid.map((entry) => {
            if (entry.id === result.bid.id) {
              return {
                ...entry,
                last_price: result.bid.last_price,
                last_dino: result.bid.last_dino,
              };
            } else {
              return entry;
            }
          })
        )
        setMybid((prevMyBid) => {
          const updatedBid = prevMyBid.find((b) => b.bid?.id === result.bid.id);
          if (updatedBid) {
            return prevMyBid.map((b) =>
              b.bid?.id === result.bid.id ? { ...b, price: result.price } : b
            );
          } else {
            return [...prevMyBid, { bid: { id: result.bid.id }, price: result.price }];
          }
        });
      }
    } catch (error) {
      setErrorMessage(translations.shop?.ERR_BID);
    }
  };

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
          const today = new Date().toISOString().split('T')[0];
          const nbenchere = data.filter(item => item.bid.day < today);
          const nbwinData = data.filter(item => item.bid.day < today && item.bid.last_dino === item.dino);
          setCountWin(nbwinData.length);
          setCountBid(nbenchere.length);
        }
      }
      catch (error) {
      }
    };

    fetchCount();
  }, []);

  const getValueById = (id) => {
    const item = mybid.find((data) => data.bid?.id === id);
    return item ? item.price + " E": translations.shop?.TABLE_NO_BID;
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
          {(countWin > 0 || countBid > 0) && (
              <div className="count-container" style={{
                marginTop: "10px",
                marginBottom: "10px",
                backgroundColor: "#41c75e",
              }}>
                {countWin > 0 && (
                  <h3 className="collect-result" onClick={() => {window.location.href = "/shop/bid/collect";}}>
                    {translations.shop?.RESULT_WIN_NUMBER.replace("[Number]", countWin)}
                  </h3>
                )}
                {countBid > 0 && countBid > countWin && (
                  <h3 className="collect-result" onClick={() => {window.location.href = "/shop/bid/collect";}}>
                    {translations.shop?.RESULT_LOSE_NUMBER.replace("[Number]", ((countBid ?? 0) - (countWin ?? 0)))}
                  </h3>
                )}
              </div>
            )}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_ITEM_IMAGE}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_CATEGORY}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_DAY}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_QUANTITY}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_LAST_PRICE}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_MY_BID}</th>
                <th style={{ padding: "10px" }}>{translations.shop?.TABLE_ACTION}</th>
              </tr>
            </thead>
            <tbody>
              {bid.map((entry) => (
                <tr
                  key={entry.id}
                  style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
                >
                  <td style={{ padding: "10px" }}>
                    <div 
                      className="relative flex items-center space-x-3" 
                      onMouseEnter={() => setHoveredItem(entry.item.name)} 
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <img
                        src={getImageUrl(`item/${entry.item.name}.webp`)}
                        alt={translations.item?.IMAGE_ITEM?.replace("[Item]", entry.item.name)}
                        style={{
                          width: "50px",
                          height: "50px",
                          marginBottom: "10px",
                        }}
                      />
                      <span>{translations.item?.["ITEM_" + entry.item.name]}</span>
                      {hoveredItem === entry.item.name && (
                        <div 
                          className="absolute bg-gray-800 text-white text-sm p-4 rounded shadow-lg z-50"
                          style={{
                            minWidth: '300px', // Définit une largeur minimale plus large
                            width: 'auto', // Permet au texte de s'adapter en fonction de la longueur
                            maxWidth: '500px', // La largeur maximale de la boîte
                            whiteSpace: 'normal', // Permet au texte de se diviser en plusieurs lignes
                            overflowWrap: 'break-word', // Casse les mots trop longs
                            wordBreak: 'break-word', // Casse les mots pour éviter qu'ils débordent
                            left: '50%', // Centre la boîte horizontalement
                            transform: 'translateX(-50%)', // Déplace la boîte pour la centrer parfaitement
                            top: '100%', // Positionne la boîte juste en dessous de l'image
                            padding: '10px', // Donne plus d'espace intérieur
                          }}
                        >
                          {translations.item?.['ITEM_DESC_' + entry.item.name] ?? translations.item?.NO_DESC.replace("[Item]", translations.item?.['ITEM_' + entry.item.name])}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px" }}>{translations.item?.['CATEGORY_'+ entry.item.categorie] ?? entry.item.categorie}</td>
                  <td style={{ padding: "10px" }}>{entry.day}</td>
                  <td style={{ padding: "10px" }}>{entry.quantity}</td>
                  <td style={{ padding: "10px" }}>{entry.last_price > 0 ? `${entry.last_price} E` : translations.shop?.TABLE_NO_PRICE} {entry.last_dino == dinoid && " (moi)"} </td>
                  <td style={{ padding: "10px" }}>{getValueById(entry.id)}</td>
                  <td style={{ padding: "10px" }}>
                    <input
                      type="number"
                      placeholder={translations.shop?.AMOUNT}
                      style={{
                        padding: "5px",
                        marginRight: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        width: "100px",
                      }}
                      value={bidAmounts[entry.id] || ""}
                      onChange={(e) =>
                        setBidAmounts((prev) => ({
                          ...prev,
                          [entry.id]: e.target.value,
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
                      onClick={() => handleBid(entry.id, bidAmounts[entry.id])}
                    >
                      {translations.shop?.BID_OR_REBID}
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
