"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";

interface Translations {
  [key: string]: any;
}

interface Shop {
  [key: string]: any;
}

const MessagesPage: React.FC = () => {
  const [shopList, setShopList] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'pnj_name' | 'category_name'>('name');
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(["ALL"]);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["shop", "pnj", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/shop/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(translations.message?.ERROR_LOAD_LIST_MSG);
        }

        const result = await response.json();
        console.log(result)

        // Récupération des catégories uniques
        const uniqueCategories = ["ALL", ...Array.from(new Set(result.map((shop: Shop) => shop.category_name))) as string[]];

        setCategories(uniqueCategories);

        // Filtrer selon la catégorie active
        const filteredShops = activeCategory === "ALL"
          ? result
          : result.filter((shop: Shop) => shop.category_name === activeCategory);

        setShopList(filteredShops);
      } catch (error) {
        setErrorMessage(translations.shop?.ERROR_LOAD_LIST_SHOP);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [activeCategory, translations]);

  const sortShops = (field: 'name' | 'pnj_name' | 'category_name') => {
    const sortedShops = [...shopList];
    const order = sortOrder === 'asc' ? 1 : -1;

    sortedShops.sort((a, b) => {
      const valueA = a[field]?.toLowerCase() || "";
      const valueB = b[field]?.toLowerCase() || "";

      if (valueA < valueB) return -1 * order;
      if (valueA > valueB) return 1 * order;
      return 0;
    });

    setShopList(sortedShops);
    setSortBy(field);
    setSortOrder(order === 1 ? 'desc' : 'asc');
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {loading ? <p>Chargement...</p> : (
          <div className="block_white">
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    padding: "10px",
                    backgroundColor: activeCategory === category ? "#007BFF" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {category === "ALL" ? translations.shop?.DISPLAY_CATEGORY_ALL : translations.shop?.['DISPLAY_CATEGORY_' + category] ?? category}
                </button>
              ))}
            </div>

            {/* Tableau des magasins */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                  <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => sortShops('name')}>
                    {translations.shop?.TABLE_HEADER_shop_name} {sortBy === 'name' && (sortOrder === 'asc' ? translations.SORT_ASC : translations.SORT_DESC)}
                  </th>
                  <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => sortShops('pnj_name')}>
                    {translations.shop?.TABLE_HEADER_seller_name} {sortBy === 'pnj_name' && (sortOrder === 'asc' ? translations.SORT_ASC : translations.SORT_DESC)}
                  </th>
                  <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => sortShops('category_name')}>
                    {translations.shop?.TABLE_HEADER_shop_type} {sortBy === 'category_name' && (sortOrder === 'asc' ? translations.SORT_ASC : translations.SORT_DESC)}
                  </th>
                  <th>{translations.shop?.TABLE_HEADER_action}</th>
                </tr>
              </thead>
              <tbody>
                {shopList.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                    <td style={{ padding: "10px", width: "20%" }}>{translations.pnj?.["shop_"+entry.category_name+"_" + entry.name]}</td>
                    <td style={{ padding: "10px", width: "20%" }}>{translations.pnj?.["pnj_" + entry.pnj_name]}</td>
                    <td style={{ padding: "10px" }}>{translations.shop?.['DISPLAY_CATEGORY_' + entry.category_name]}</td>
                    <td style={{ padding: "10px"}}>
                      <Link href={`/shop/store/${entry.category_name}/${entry.name}`} passHref>
                        <button style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {translations.shop?.ENTER_SHOP}
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default MessagesPage;
