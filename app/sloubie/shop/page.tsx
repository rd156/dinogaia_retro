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

    try {
      let url = `${API_URL}/shop/list`; // URL par défaut

      // Définir les options pour la requête
      let options = {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

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
  
  useEffect(() => {
    loadItems();
  }, []);


  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white center">
          Page
        </div>
      </div>
    </main>
  );
};

export default ItemsPage;
