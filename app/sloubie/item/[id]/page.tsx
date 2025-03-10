"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import { useParams } from 'next/navigation';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";

const ItemEditPage: React.FC = () => {
  const params = useParams();
  const [item, setItem] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [itemId, setItemId] = useState(params?.id);
  const categories = ["MEDOC", "FOOD", "ATK", "GOLD", "WEAPON","SKILL", "PACK", "ARTE", "OTHER", "HABI","TALIS", "QUEST", "KEY", "CHEST", "RES","ANIMAL"];


  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  // Charger les détails de l'item à partir du serveur
  useEffect(() => {
    if (itemId) {
      const fetchItem = async () => {
        const token = localStorage.getItem("token");

        try {
          const response = await fetch(`${API_URL}/item/get/${itemId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            setErrorMessage("Erreur lors du chargement de l'item");
            setIsLoading(false);
            return;
          }

          const result = await response.json();
          setItem(result);
        } catch (error) {
          console.error("Erreur réseau:", error);
          setErrorMessage("Erreur réseau lors du chargement de l'item");
        } finally {
          setIsLoading(false);
        }
      };

      fetchItem();
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const updatedItem = {
      ...item,
    };

    try {
      const response = await fetch(`${API_URL}/sloubie/item/${itemId}/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: inputValue,
          ...updatedItem,
        }),
      });      

      if (!response.ok) {
        setErrorMessage("Erreur lors de la mise à jour de l'item");
        return;
      }
      const result = await response.json();
      setItem(result)
      console.log(result)
      setSuccessMessage("Item mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur réseau:", error);
      setErrorMessage("Erreur réseau lors de la mise à jour de l'item");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setItem({
        ...item,
        action: {
          ...item.action,
          [name]: (e.target as HTMLInputElement).checked,
        },
      });
    } else {
      setItem({
        ...item,
        [name]: value,
      });
    }
  };
  

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  if (!item) {
    return <p>Item non trouvé</p>;
  }

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {successMessage && <p className="alert-green">{successMessage}</p>}
        <div className="block_white center">
          <h1>Éditer l&apos;Item</h1>
          <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Tapez ici..."
            />
          <br />
          <br />
          <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="flex flex-col gap-4">
              <div>
                <label>Nom de l&apos;item</label>
                <input
                  type="text"
                  name="name"
                  value={item.name || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Catégorie</label>
                <select
                  name="categorie"
                  value={item.categorie || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((categorie, index) => (
                    <option key={index} value={categorie}>
                      {categorie}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Prix Minimum</label>
                <input
                  type="number"
                  name="price_min"
                  value={item.price_min || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Prix Moyen</label>
                <input
                  type="number"
                  name="price_moyen"
                  value={item.price_moyen || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Prix Maximum</label>
                <input
                  type="number"
                  name="price_max"
                  value={item.price_max || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Stockage</label>
                <input
                  type="text"
                  name="storage"
                  value={item.storage || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Valeur de stockage</label>
                <input
                  type="number"
                  name="storage_value"
                  value={item.storage_value || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Bonheur</label>
                <input
                  type="text"
                  name="bonheur"
                  value={item.bonheur || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>PV</label>
                <input
                  type="text"
                  name="pv"
                  value={item.pv || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>PM</label>
                <input
                  type="text"
                  name="pm"
                  value={item.pm || ""}
                  onChange={handleChange}
                  className="p-2 border rounded-md w-full"
                />
              </div>
              <div>
                <label>Actions</label>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="eat"
                      checked={item?.action?.eat || false}
                      onChange={handleChange}
                    />
                    Manger
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="use"
                      checked={item?.action?.use || false}
                      onChange={handleChange}
                    />
                    Utiliser
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="open"
                      checked={item?.action?.open || false}
                      onChange={handleChange}
                    />
                    Ouvrir
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="move"
                      checked={item?.action?.move || false}
                      onChange={handleChange}
                    />
                    Déplacer
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="gift"
                      checked={item?.action?.gift || false}
                      onChange={handleChange}
                    />
                    Offrir
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="arena"
                      checked={item?.action?.arena || false}
                      onChange={handleChange}
                    />
                    Drop en arene
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <ButtonFancy onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)} label="Mettre à jour" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ItemEditPage;
