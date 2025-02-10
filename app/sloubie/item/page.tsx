"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import React, {Fragment} from "react";

const ItemsPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null); // Ajouté pour gérer l'item sélectionné

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["item", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const loadItems = async () => {
    const token = localStorage.getItem("token");
    console.log("inputName:", inputName);

    try {
      let url = `${API_URL}/item`; // URL par défaut

      // Définir les options pour la requête
      let options = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      // Si inputName est fourni et non vide, ajuster l'URL et la méthode de requête
      if (inputName && inputName.trim() !== "") {
        url = `${API_URL}/sloubie/item_by_name`;
        options.method = "POST";
        options.body = JSON.stringify({
          password: inputValue,
          name: inputName
        });
      }

      // Envoyer la requête
      const response = await fetch(url, options);
      if (!response.ok) {
        setErrorMessage(translations.items?.ERR_LOAD_ITEMS || "Erreur lors du chargement des items");
        return;
      }

      const result = await response.json();
      console.log(result);
      setItems(result);
    } catch (error) {
      console.error("Erreur réseau:", error);
      setErrorMessage("Erreur réseau lors du chargement des items");
    }
  };

  const exportItems = async () => {
    const token = localStorage.getItem("token");
    console.log("inputName:", inputName);

    try {
      let url = `${API_URL}/data/export/item`;
      let options = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await fetch(url, options);
      if (!response.ok) {
        setErrorMessage(translations.items?.ERR_LOAD_ITEMS || "Erreur lors du chargement des items");
        return;
      }

      const result = await response.json();
    } catch (error) {
    }
  };
  
  useEffect(() => {
    loadItems();
  }, []);

  const handleItemClick = (id: number) => {
    // Si l'item est déjà sélectionné, on le dé-sélectionne
    if (selectedItemId === id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(id);
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white center">
          <div style={{ margin: "50px" }}>
            <h1
              style={{
                border: "2px solid red",
                padding: "10px",
                display: "inline-block",
              }}
            >
              Liste des Items
            </h1>
          </div>
          <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Tapez ici..."
            />
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Rechercher un item..."
            />
            <ButtonFancy onClick={() => loadItems()} label="Recharger" />
          </div>
          <div style={{ marginTop: "30px" }}>
            <div
              style={{
                maxHeight: "100vh",
                overflowY: "auto",
                border: "1px solid #ddd",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Id de l'item</th>
                    <th style={{ padding: "10px" }}>Nom format Id</th>
                    <th style={{ padding: "10px" }}>Nom de l'item</th>
                    <th style={{ padding: "10px" }}>Catégorie</th>
                    <th style={{ padding: "10px" }}>Prix</th>
                    <th style={{ padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        style={{
                          borderBottom: "1px solid #ddd",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <td style={{ padding: "10px", width: "10%"}}>{item.id}</td>
                        <td style={{ padding: "10px", width: "20%" }}>{item.name}</td>
                        <td style={{ padding: "10px", width: "20%" }}>{translations.item?.['ITEM_' + item.name] ?? item.name}</td>                        
                        <td style={{ padding: "10px", width: "20%" }}>{item.categorie}</td>                     
                        <td style={{ padding: "10px", width: "10%" }}>{item.storage_value}</td>
                        <td style={{ padding: "10px", width: "20%" }}>{item.price_min} / {item.price_moyen} / {item.price_max} E</td>
                      </tr>
                      {selectedItemId === item.id && (
                         <tr
                         style={{
                           textAlign: "left",
                           backgroundColor: "rgb(255,255,255,0.5)"
                         }}>
                            <td colSpan="5">
                              <div style={{ 
                                display: "flex",
                                flexWrap: "wrap",
                                paddingLeft: "20px",
                                paddingRight: "50px",
                                justifyContent: "space-between",  // Répartit les éléments uniformément
                                gap: "10px",  // Ajoute un espace entre eux
                                width: "100%"  // Prend toute la largeur de la cellule
                              }}>
                                <span>EAT: {item.action?.eat ? "True" : "False"}</span>
                                <span>USE: {item.action?.use ? "True" : "False"}</span>
                                <span>OPEN: {item.action?.open ? "True" : "False"}</span>
                                <span>GIFT: {item.action?.gift ? "True" : "False"}</span>
                                <span>MOVE: {item.action?.move ? "True" : "False"}</span>
                                <span>SHOP: {item.action?.shop ? "True" : "False"}</span>
                                <span>ARENA: {item.action?.arena ? "True" : "False"}</span>
                              </div>
                            </td>
                            <td>
                            <Link href={`/sloubie/item/${item.id}`}>
                              <ButtonFancy label="Editer" />
                            </Link>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <br />
          <ButtonFancy onClick={() => exportItems()} label="Export" />
        </div>
      </div>
    </main>
  );
};

export default ItemsPage;
