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
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["casino", "item", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);


  return (
<main className="content">
  <div className="content_top">
    <div className="block_white">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <h1
          style={{
            width: "100%",
            textAlign: "center",
            border: "2px solid red",
            padding: "10px",
            display: "inline-block",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {translations.casino?.CASINO_CHOICE}
        </h1>
      </div>
    </div>
  </div>
</main>

  );
};

export default CavePage;
