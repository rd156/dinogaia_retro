"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import ImageWithText from "@/components/pattern/ImageWithText";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CraftPage: React.FC = () => {
  const [imageFolder, setImageFolder] = useState<string>('reborn');
  const [items, setItems] = useState<any[]>([]);
  const [selectedResources, setSelectedResources] = useState<any[]>([]);
  const [craftedItem, setCraftedItem] = useState(null);
  const [message, setMessage] = useState("");
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["craft", "item"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    setImageFolder(localStorage.getItem("image_template") || "reborn");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      try {
        const caveResponse = await fetch(`${API_URL}/cave/get_item/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (caveResponse.ok) {
          const resources = await caveResponse.json();
          setItems(resources);
        }
      } catch (error) {
        setMessage(translations.craft?.ERR_LOAD);
      }
    };
    fetchData();
  }, []);

  const getImageUrl = (itemName: string) => {
    return imageFolder === "reborn" ? `/${itemName}` : `/template_image/${imageFolder}/${itemName}`;
  };

  const handleResourceClick = (item) => {
    setSelectedResources((prev) => [...prev, item]);
  };

  const handleCraft = async () => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      const response = await fetch(`${API_URL}/craft/create/${dinoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resources: selectedResources }),
      });

      const result = await response.json();
      if (result.success) {
        setCraftedItem(result.item);
        setMessage(translations.craft?.SUCCESS.replace("[Item]", result.item));
      } else {
        setMessage(translations.craft?.FAIL);
      }
    } catch (error) {
      setMessage(translations.craft?.ERR_ACTION);
    }
  };

  return (
    <main className="content">
      <h1>{translations.craft?.TITLE}</h1>
      {message && <p className="alert-green">{message}</p>}
      <div className="grid">
        {items.map((item) => (
          <div key={item.item_name} className="block_white" onClick={() => handleResourceClick(item)}>
            <ImageWithText src={getImageUrl(`item/${item.item_name}.webp`)} alt={item.item_name} quantity={item.quantite} />
            <p>{translations.item?.['ITEM_' + item.item_name] ?? item.item_name}</p>
          </div>
        ))}
      </div>
      {selectedResources.length > 0 && (
        <div className="block_white">
          <h3>{translations.craft?.SELECTED_RESOURCES}</h3>
          {selectedResources.map((res, index) => (
            <p key={index}>{translations.item?.['ITEM_' + res.item_name] ?? res.item_name}</p>
          ))}
          <ButtonFancy onClick={handleCraft} label={translations.craft?.CRAFT} />
        </div>
      )}
      {craftedItem && (
        <div className="block_white">
          <h3>{translations.craft?.CRAFTED_ITEM}</h3>
          <p>{translations.item?.['ITEM_' + craftedItem] ?? craftedItem}</p>
        </div>
      )}
    </main>
  );
};

export default CraftPage;
