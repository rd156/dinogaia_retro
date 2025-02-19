"use client";

import { useEffect, useState, Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ItemWithTooltip from "@/components/pattern/ItemWithTooltip";

const RecipePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [imageFolder, setImageFolder] = useState<string>('reborn');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["craft", "item", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    setImageFolder(localStorage.getItem("image_template") || "reborn");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");

      if (!dinoId) {
        window.location.href = "/dino";
        return;
      }

      try {
        const recipesResponse = await fetch(`${API_URL}/craft/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!recipesResponse.ok) {
          throw new Error("Erreur lors de la récupération des recettes");
        }
        const recipeData = await recipesResponse.json();

        const itemsResponse = await fetch(`${API_URL}/cave/get_item/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!itemsResponse.ok) {
          throw new Error("Erreur lors de la récupération des items");
        }

        const itemsData = await itemsResponse.json();
        setItems(itemsData);
  
        // Trier les recettes par le nombre d'ingrédients manquants (le plus bas en premier)
        const availableItems = new Set(itemsData.map(item => item.item_name));
        const sortedRecipes = recipeData.sort((a, b) => {
          const missingA = a.requirements.filter(req => !availableItems.has(req.item)).length;
          const missingB = b.requirements.filter(req => !availableItems.has(req.item)).length;
          return missingA - missingB; // Tri ascendant par le nombre d'ingrédients manquants
        });
        setRecipes(sortedRecipes);

      } catch (error) {
        setErrorMessage("Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleRecipe = (recipeId: number) => {
    setOpenRecipeId(openRecipeId === recipeId ? null : recipeId);
  };

  // Fonction de tri
  const handleSort = (column: string) => {
    const newOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);

    const sortedRecipes = [...recipes].sort((a, b) => {
      let valueA, valueB;

      if (column === "item") {
        valueA = a.item.toLowerCase();
        valueB = b.item.toLowerCase();
      } else if (column === "craft_type") {
        valueA = a.craft_type.toLowerCase();
        valueB = b.craft_type.toLowerCase();
      } else if (column === "requirements_length") {
        const ownedB = b.requirements.filter(req => availableItems.has(req.item)).length;
        const ownedA = a.requirements.filter(req => availableItems.has(req.item)).length;
      
        valueA = ownedA; // On trie sur ce qu'on possède, pas sur ce qui manque
        valueB = ownedB;
      } else {
        return 0;
      }

      if (valueA < valueB) return newOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setRecipes(sortedRecipes);
  };

  // Créer un Set des items disponibles pour une vérification rapide
  const availableItems = new Set(items.map(item => item.item_name));

  return (
    <main className="content">
      <div className="content_top">
        <div className="block_white">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => handleSort("item")}>
                  Recette {sortColumn === "item" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => handleSort("craft_type")}>
                  Type {sortColumn === "craft_type" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => handleSort("requirements_length")}>
                  nb_ingredient {sortColumn === "requirements_length" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((entry, index) => (
                <Fragment key={index}>
                  <tr
                    onClick={() => toggleRecipe(index)}
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      cursor: "pointer",
                      backgroundColor: openRecipeId === index ? "#eef" : "transparent",
                    }}
                  >
                    <td style={{ padding: "10px" }}>
                      <ItemWithTooltip 
                        itemName={entry.item}
                        translations={translations.item}
                      />
                    </td>
                    <td style={{ padding: "10px" }}>{entry.craft_type}</td>
                    <td style={{ padding: "10px" }}>
                      {(() => {
                        const totalIngredients = entry.requirements.length;
                        const missingIngredients = entry.requirements.filter(req => !availableItems.has(req.item)).length;

                        return missingIngredients > 0 ? (
                          <span style={{ color: "red" }}>
                            {missingIngredients} / {totalIngredients}
                          </span>
                        ) : (
                          <span style={{ color: "green" }}>{totalIngredients + "/" + totalIngredients}</span>
                        );
                      })()}
                    </td>

                    <td style={{ padding: "10px" }}>CRAFT</td>
                  </tr>

                  {openRecipeId === index && (
                    <tr>
                      <td colSpan={4} style={{ padding: "10px", backgroundColor: "#f9f9f9" }}>
                        <strong>Détails de la recette :</strong>
                        <ul>
                          {entry.requirements.map((requirement, reqIndex) => {
                            const isAvailable = availableItems.has(requirement.item);
                            return (
                              <li 
                                key={reqIndex} 
                                style={{ color: isAvailable ? "black" : "red" }}
                              >
                                {requirement.item} x {requirement.quantity}
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default RecipePage;
