"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";

const MessagesPage: React.FC = () => {
  const params = useParams();
  const [shopList, setShopList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'pnj_name' | 'category_name'>('name');
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>(["ALL"]);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["message", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

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

        // Récupération des catégories uniques
        const uniqueCategories = ["ALL", ...new Set(result.map((shop) => shop.category_name))];

        setCategories(uniqueCategories);

        // Filtrer selon la catégorie active
        const filteredShops = activeCategory === "ALL"
          ? result
          : result.filter(shop => shop.category_name === activeCategory);

        setShopList(filteredShops);
      } catch (error) {
        setErrorMessage(translations.message?.ERROR_LOAD_LIST_MSG);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [activeCategory]);

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
            {/* Boutons de filtre par catégorie */}
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
                  {category === "ALL" ? translations.message?.DISPLAY_CATEGORIE_ALL : translations.message?.['DISPLAY_CATEGORIE_' + category] ?? category}
                </button>
              ))}
            </div>

            {/* Tableau des magasins */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                  <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => sortShops('name')}>
                    Nom du magasin {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => sortShops('pnj_name')}>
                    Nom du vendeur {sortBy === 'pnj_name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => sortShops('category_name')}>
                    Type de magasin {sortBy === 'category_name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shopList.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                    <td style={{ padding: "10px", width: "20%" }}>{entry.name}</td>
                    <td style={{ padding: "10px", width: "20%" }}>{entry.pnj_name}</td>
                    <td style={{ padding: "10px" }}>{entry.category_name}</td>
                    <td style={{ padding: "10px", width: "10%" }}>
                      <Link href={`/shop/store/${entry.name}`} passHref>
                        <button style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                          Voir
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
