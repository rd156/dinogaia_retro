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

import { ScratchCard } from 'next-scratchcard';

const MyScratchCard = () => {
  const { language, toggleLanguage } = useLanguage();
  const [imageFolder, setImageFolder] = useState<string>('reborn');
  const [translations, setTranslations] = useState({});
  const [casinoDino, setCasinoDino] = useState({});
  const [item, setItem] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["casino", "item", "error", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

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
      const response = await fetch(`${API_URL}/casino/${dinoId}/gratte_item`, {
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
        console.log(result)
        resetCard()
        setCasinoDino(result.ticket);
        setItem(result.price)
      }
      else
      {
        console.log(result)
      }
    }
    catch (error) {
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    setLastPrice(item)
  };

  const resetCard = () => {
    setResetKey(prevKey => prevKey + 1);
    setProgress(0);
    setIsComplete(false);
    setLastPrice(null)
  };

  return (
    <main className="content">
        <div className="content_top"> 
            <div className="block_white">
                <div className="flex flex-col items-center p-6">
                    <div className="flex space-x-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                        <ScratchCard
                            key={resetKey}
                            width={300}
                            height={300}
                            image="/avatar/default.webp"
                            finishPercent={60}
                            onComplete={handleComplete}
                            progress={progress}
                            onProgressChange={(newProgress) => setProgress(newProgress)}
                        >
                            <img
                                src={item ? getImageUrl(`item_original/${item}.webp`) : getImageUrl(`avatar/default.webp`)} 
                                alt="Contenu révélé"
                                width={300}
                                height={300}
                            />
                        </ScratchCard>
                    </div>
                    <div style={{margin:"20px"}}>
                        {lastPrice && translations.item?.['ITEM_' + lastPrice]}
                    </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                    {casinoDino && casinoDino.ticket > 0 && (
                        <button className="button-common" onClick={() => { startGame(0) }} >
                            {translations.casino?.CASINO_FREE_PARTY_AGAIN.replace("[Number]", casinoDino.ticket)}
                        </button>
                    )}
                    <button className="button-common" onClick={() => { startGame(10) }} >
                        {translations.casino?.CASINO_PLAY.replace("[Number]", 10)}
                    </button>
                    <button className="button-common" onClick={() => { startGame(20) }} >
                        {translations.casino?.CASINO_PLAY.replace("[Number]", 20)}
                    </button>
                    <button className="button-common" onClick={() => { startGame(50) }} >
                        {translations.casino?.CASINO_PLAY.replace("[Number]", 50)}
                    </button>
                    <button className="button-common" onClick={() => { startGame(100) }} >
                        {translations.casino?.CASINO_PLAY.replace("[Number]", 100)}
                    </button>
                </div>
            </div>
        </div>
    </main>
  );
};

export default MyScratchCard;
