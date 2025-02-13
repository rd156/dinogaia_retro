"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const MessagesPage: React.FC = () => {
  const params = useParams();
  const [shopList, setShopList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'pnj_name' | 'category_name'>('name');
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(["ALL"]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const actionClick = async (action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/sloubie/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({password: inputValue}),
      });  
      const result = await response.json();
      console.log(result);
    } catch (error) {
    } finally {
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
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Tapez ici..."
              />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => actionClick("debug/storage")} label="Debug Storage" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;
