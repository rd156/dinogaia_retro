"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import "./page.css";
import { useRouter } from 'next/navigation';

interface Translations {
  [key: string]: any;
}

interface Item {
  item_name: string;
  item_categorie: string;
  quantite: number;
  price: number;
}

const CavePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [items, setItems] = useState<Item[]>([]);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["shop", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const caveResponse = await fetch(`${API_URL}/market/list/last`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!caveResponse.ok) {
          setErrorMessage(translations.shop?.ERR_LOAD_ITEM);
        }
        const item_list = await caveResponse.json()
        setItems(item_list);
        console.log(item_list)

      } catch (error) {
        setErrorMessage(translations.shop?.ERR_LOAD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translations]);

  const [activeCategory, setActiveCategory] = useState("LAST");
  const categories = ["LAST", "FOOD", "MEDOC", "RES", "ATK", "SKILL", "WEAPON", "ARTE", "TALIS", "HABI", "QUEST", "GOLD", "PACK", "OTHER"];
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleCategoryToggle = async (category: string) => {
    setActiveCategory(category);
    try {
      let response;
      const token = localStorage.getItem("token");
      if (category === "LAST") {
        response = await fetch(`${API_URL}/market/list/last`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(`${API_URL}/market/list/category`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "category": category
          })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const newItems = await response.json();
      setItems(newItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleItemClick = (item: Item) => {
    router.push(`/shop/hdv/${item.item_name}`);
  };

  return (
    <main className="content">
      <div className="content_top">
        <div>
          {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                style={{
                  padding: "10px",
                  margin: "10px",
                  backgroundColor: activeCategory === category ? "#007BFF" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {category === "LAST" ? translations.shop?.DISPLAY_CATEGORY_LAST : translations.item?.['CATEGORY_'+ category] ?? category}
              </button>
            ))}
        </div>
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <br />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
          {items &&
          Object.entries(items)
          .reduce((acc, [_, item]) => {
            const existingItem = acc.find(i => i.item_name === item.item_name);
            if (existingItem) {
              existingItem.quantite += item.quantite;
              existingItem.price = Math.min(existingItem.price, item.price);
            } else {
              acc.push({...item});
            }
            return acc;
          }, [] as Item[])
          .filter(item => activeCategory === "LAST" || item.item_categorie === activeCategory)
          .map((item) => (
            <div
              key={item.item_name}
              className="relative block_white center_item cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleItemClick(item)}
            >
              <ImageItemWithText 
                itemName={item.item_name}
                quantity={item.quantite}
                translations={translations.item}
              />
              <p>{translations.item?.['ITEM_' + item.item_name] ?? item.item_name}</p>
              <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {item.price} 💰
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CavePage;
