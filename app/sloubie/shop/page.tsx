"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const MessagesPage: React.FC = () => {
  const params = useParams();
  const [shopList, setShopList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'pnj_name' | 'category_name'>('name');
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(["ALL"]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["pnj", "shop", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

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
  
  const reloadClick = async (category = "ALL") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/sloubie/shop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({password: inputValue}),
      });
  
      if (!response.ok) {
        throw new Error(translations.message?.ERROR_LOAD_LIST_MSG);
      }
  
      const result = await response.json();
      console.log(result);
  
      const uniqueCategories = ["ALL", ...new Set(result.map((shop) => shop.category_name))];
      setCategories(uniqueCategories);
  
      const filteredShops = category === "ALL" ? result : result.filter(shop => shop.category_name === category);

      setShopList(filteredShops);
    } catch (error) {
      setErrorMessage(translations.shop?.ERROR_LOAD_LIST_SHOP);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    reloadClick(category);
  };
  

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
          <div className="block_white">
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Tapez ici..."
              />
              <ButtonFancy onClick={() => reloadClick()} label="Reload" />
            </div>
            <br />
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
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
                      <Link href={`/sloubie/shop/${entry.name}`} passHref>
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
      </div>
    </main>
  );
};

export default MessagesPage;
