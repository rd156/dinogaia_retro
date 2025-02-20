"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const HomePage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [bugs, setBugs] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("ALL");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["account", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const importClick = async (value) => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/data/import/${value}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        }
      });
  
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBugs(result)
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  const exportClick = async (value) => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/data/export/${value}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        }
      });
  
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBugs(result)
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white center">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div style={{ margin: "50px" }}>
              <h1
                style={{
                  border: "2px solid red",
                  display: "inline-block",
                }}
              >
                Gestion Import
              </h1>
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("fight")} label="Import Combat" />
              <ButtonFancy onClick={() => exportClick("fight")} label="Export Combat" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("hunt")} label="Import Chasse" />
              <ButtonFancy onClick={() => exportClick("hunt")} label="Export Chasse" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("item")} label="Import Items" />
              <ButtonFancy onClick={() => exportClick("item")} label="Export Items" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("job")} label="Import Metier" />
              <ButtonFancy onClick={() => exportClick("job")} label="Export Metier" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("level")} label="Import Niveau" />
              <ButtonFancy onClick={() => exportClick("level")} label="Export Niveau" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("quest")} label="Import Quête" />
              <ButtonFancy onClick={() => exportClick("quest")} label="Export Quête" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("pnj")} label="Import PNJ" />
              <ButtonFancy onClick={() => exportClick("pnj")} label="Export PNJ" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("shop")} label="Import Magasin" />
              <ButtonFancy onClick={() => exportClick("shop")} label="Export Magasin" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => importClick("craft")} label="Import Craft" />
              <ButtonFancy onClick={() => exportClick("craft")} label="Export Craft" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
