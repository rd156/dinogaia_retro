"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CasinoMachine = () => {
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [result, setResult] = useState(["❓", "❓", "❓"]);
  const [spinning, setSpinning] = useState(false);
  const [reelsCount, setReelsCount] = useState([]);
  const [casinoDino, setCasinoDino] = useState({});
  const [lastPrice, setLastPrice] = useState(null);
  
  
  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["casino", "item", "error", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);
  
  useEffect(() => {
    const fetchData = async () => {
      
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      try {
        const response = await fetch(`${API_URL}/casino/${dinoId}/ticket`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const fetchedData = await response.json();
        console.log(fetchedData)
        setCasinoDino(fetchedData);
      } catch (error) {
      } finally {
      }
    };

    fetchData();
  }, []);

  const startGame = async (bet) => {
    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const response = await fetch(`${API_URL}/casino/${dinoId}/little_slot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "bet": bet
        }),
      });

      const result = await response.json();
      if (typeof result === "object" && result !== null) {
        setReelsCount(result.result)
        setCasinoDino(result.ticket);
        setLastPrice({"price": result.price});
        spin(result.result)
      }
      else
      {
        console.log(result)
      }
    }
    catch (error) {
    }
  };

  const symbols = [
    "7️⃣", "💎", "🍀", "💰", "🎰", "🍒", "🍋", "🍊", "🍉", "🍍", "🍓", "🍇", "🍏", "🔔", "🏆", "⭐", "🍑", "🍊", "💥", "🎉"
  ];  
  
  function getRandomSymbol(reelsCount, index) {
    if (symbols.length >= reelsCount[index]){
      return symbols[reelsCount[index]]
    }
    else{
      return "❓"
    }
  }
  
  const spin = (result) => {
    if (spinning) return;
    setSpinning(true);
  
    let newResult = ["❓", "❓", "❓"];
    let delays = [0.5, 1, 1.5];
  
    delays.forEach((delay, index) => {
      setTimeout(() => {
        newResult[index] = getRandomSymbol(result, index);
        setResult([...newResult]);
      }, delay * 1000);
    });
  
    setTimeout(() => setSpinning(false), 1500);
  };
  
  return (
    <main className="content">
      <div className="content_top"> 
        <div className="block_white">
          <div className="flex flex-col items-center p-6">
            <div className="flex space-x-4 bg-gray-800 p-4 rounded-lg shadow-lg">
              {result.map((symbol, index) => (
                <motion.div
                  key={index}
                  className="text-5xl bg-white p-4 rounded-lg shadow-md"
                  animate={{ y: spinning ? [0, -20, 0] : 0 }}
                  transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>

            <div className="flex space-x-4">
              {casinoDino && casinoDino.ticket > 0 && (
                <button
                  className="button-common"
                  onClick={() => { startGame(0) }}
                  disabled={spinning}
                  >
                  {spinning ? translations.casino?.SPINNING : translations.casino?.CASINO_FREE_PARTY_AGAIN.replace("[Number]", casinoDino.ticket)}
                </button>
              )}
              <button
                className="button-common"
                onClick={() => { startGame(10) }}
                disabled={spinning}
              >
                {spinning ? translations.casino?.SPINNING : translations.casino?.CASINO_PLAY.replace("[Number]", 10)}
              </button>
              <button
                className="button-common"
                onClick={() => { startGame(20) }}
                disabled={spinning}
              >
                {spinning ? translations.casino?.SPINNING : translations.casino?.CASINO_PLAY.replace("[Number]", 20)}
              </button>
              <button
                className="button-common"
                onClick={() => { startGame(50) }}
                disabled={spinning}
              >
                {spinning ? translations.casino?.SPINNING : translations.casino?.CASINO_PLAY.replace("[Number]", 50)}
              </button>
              <button
                className="button-common"
                onClick={() => { startGame(100) }}
                disabled={spinning}
              >
                {spinning ? translations.casino?.SPINNING : translations.casino?.CASINO_PLAY.replace("[Number]", 100)}
              </button>
            </div>
            <div style={{margin:"20px"}}>
              {lastPrice && translations.casino?.LAST_PRICE.replace("[Number]", lastPrice.price)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CasinoMachine;
