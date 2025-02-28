"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import "./page.css";

const CavePage: React.FC = () => {
  const searchParams = useSearchParams();
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
    const loadedTranslations = await Loadtranslate(language, ["cave", "item", "global"]);
    setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  return (
    <main className="content">
      <div className="content_top">
        <ImageItemWithText 
          itemName="requin_blanc"
          quantity={10}
          translations={translations.item}
        />
      </div>
    </main>
  );
};

export default CavePage;
