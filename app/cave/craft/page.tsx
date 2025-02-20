"use client";

import { useEffect, useState, Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ItemWithTooltip from "@/components/pattern/ItemWithTooltip";
import ImageWithText from "@/components/pattern/ImageWithText";
import ButtonGlow from "@/components/pattern/ButtonGlow";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const RecipePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [imageFolder, setImageFolder] = useState<string>('reborn');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["craft", "item", "global", "error"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    setImageFolder(localStorage.getItem("image_template") || "reborn");
  }, []);

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
          throw new Error(translations.craft?.ERR_LOAD_RECIPE);
        }
        const recipeData = await recipesResponse.json();
        console.log(recipeData)

        const itemsResponse = await fetch(`${API_URL}/cave/get_item/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!itemsResponse.ok) {
          throw new Error(translations.craft?.ERR_LOAD_ITEM);
        }
        const itemsData = await itemsResponse.json();
        console.log(itemsData)
        setItems(itemsData);

        const availableItems = new Set(itemsData.map(item => item.item_name));
        const sortedRecipes = recipeData.sort((a, b) => {
          const missingA = a.requirements.filter(req => !availableItems.has(req.item)).length;
          const missingB = b.requirements.filter(req => !availableItems.has(req.item)).length;
          return missingA - missingB;
        });
        setRecipes(sortedRecipes);

      } catch (error) {
        setErrorMessage(translations.craft?.ERR_LOAD);
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
        // Calcule les unités manquantes pour A
        const missingA = a.requirements.reduce((acc, req) => {
          const availableQuantity = items.find(item => item.item_name === req.item)?.quantite || 0;
          return acc + Math.max(req.quantity - availableQuantity, 0);
        }, 0);
  
        // Calcule les unités manquantes pour B
        const missingB = b.requirements.reduce((acc, req) => {
          const availableQuantity = items.find(item => item.item_name === req.item)?.quantite || 0;
          return acc + Math.max(req.quantity - availableQuantity, 0);
        }, 0);
  
        valueA = missingA;
        valueB = missingB;
      } else {
        return 0;
      }

      if (valueA < valueB) return newOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setRecipes(sortedRecipes);
  };

  const handleButtonClick = async (action) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    console.log(action)
    try {  
      const response = await fetch(`${API_URL}/craft/craft`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "id": dinoId,
          "id_recipe":action
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.craft?.ERR_CRAFT);
      }
  
      const result = await response.json();
      console.log(result)
      if (typeof result === "object")
      {
        setItems((prevItems) => {
          let updatedItems = prevItems.map(item => {
            const requirement = result.requirements.find(req => req.item === item.item_name);
            if (requirement) {
              return {
                ...item,
                quantite: Math.max(0, item.quantite - requirement.quantity)
              };
            }
            return item;
          }).filter(item => item.quantite > 0);
          const craftedItemIndex = updatedItems.findIndex(item => item.item_name === result.item);
          if (craftedItemIndex !== -1) {
            updatedItems[craftedItemIndex].quantite += 1;
          } else {
            updatedItems.push({ item_name: result.item, quantite: 1 });
          }
        
          return updatedItems;
        });
        setMessage(translations.craft?.CRAFT_DONE.replace("[Number]", 1).replace("[Name]", translations.item?.['ITEM_' + result.item]))
        setErrorMessage("")
      }
      else{
        setMessage("")
        setErrorMessage(result)
      }
    } catch (error) {
      setErrorMessage(translations.craft?.ERR_CRAFT);
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <div className="block_white" style={{ marginBottom: "50px"}}>
          <ButtonGlow onClick={() => { window.location.href = "/cave"; }} label={translations.craft?.CAVE_BUTTON} />
        </div>
        <div className="block_white">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => handleSort("item")}>
                  {translations.craft?.TABLE_RECIPE} {sortColumn === "item" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => handleSort("craft_type")}>
                {translations.craft?.TABLE_TYPE} {sortColumn === "craft_type" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => handleSort("requirements_length")}>
                {translations.craft?.TABLE_NB_INGREDIENT}{sortColumn === "requirements_length" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ padding: "10px" }}>{translations.craft?.TABLE_ACTION}</th>
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
                    <td style={{ padding: "10px" }}>{translations.craft?.["CRAFT_TYPE_" + entry.craft_type]}</td>
                    <td style={{ padding: "10px" }}>
                      {(() => {
                        const totalRequired = entry.requirements.reduce((acc, req) => acc + req.quantity, 0);
                        const totalAvailable = entry.requirements.reduce((acc, req) => {
                          const availableQuantity = items.find(item => item.item_name === req.item)?.quantite || 0;
                          return acc + Math.min(availableQuantity, req.quantity);
                        }, 0);

                        return totalAvailable < totalRequired ? (
                          <span style={{ color: "red" }}>
                            {totalAvailable} / {totalRequired}
                          </span>
                        ) : (
                          <span style={{ color: "green" }}>
                            {totalAvailable} / {totalRequired}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <ButtonFancy onClick={() => handleButtonClick(entry.id)} label={translations.craft?.START_CRAFT} />
                    </td>
                  </tr>

                  {openRecipeId === index && (
                    <tr>
                      <td colSpan={4} style={{ padding: "10px", backgroundColor: "#f9f9f9" }}>
                        <strong>{translations.craft?.RECIPE_DETAILS}</strong>
                        <div 
                          style={{ 
                            display: "flex", 
                            flexWrap: "wrap", 
                            gap: "10px"
                          }}
                        >
                          {entry.requirements.map((requirement, reqIndex) => {
                            const availableQuantity = items.find(item => item.item_name === requirement.item)?.quantite || 0;
                            const isAvailable = availableQuantity >= requirement.quantity;

                            return (
                              <span 
                                key={reqIndex} 
                                style={{ 
                                  color: isAvailable ? "green" : "red",
                                  backgroundColor: "#fff",
                                  padding: "5px 10px",
                                  borderRadius: "5px",
                                  border: "2px solid",
                                  borderBlockColor: isAvailable ? "green" : "red",
                                }}
                              >
                                <ImageWithText 
                                  src={getImageUrl(`item/${requirement.item}.webp`)}
                                  alt={`${requirement.item} image`}
                                  quantity={availableQuantity} 
                                />
                                <p>{translations.item?.['ITEM_' + requirement.item] ?? requirement.item} {availableQuantity} / {requirement.quantity}</p>
                              </span>
                            );
                          })}
                        </div>
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
