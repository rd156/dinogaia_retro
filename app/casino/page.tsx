"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import "./page.css";

const CavePage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState({});

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["casino", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

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
