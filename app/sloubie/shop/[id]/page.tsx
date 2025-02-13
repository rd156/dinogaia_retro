"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const StoreDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [imageFolder, setImageFolder] = useState<string>('reborn');
  const [translations, setTranslations] = useState<any>({});
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState("");

  const [newProduct, setNewProduct] = useState<any>({
    item_name: '',
    price: 0,
    quantity: 0,
    have_limit: false,
    limit: 0,
  });

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["item", "shop", "pnj", "error", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const getImageUrl = (itemName: string) => {
    if (imageFolder == "reborn") {
      return `/${itemName}`;
    } else {
      return `/template_image/${imageFolder}/${itemName}`;
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [params.id]);

  const reloadClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/sloubie/shop/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({password: inputValue}),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du magasin");
      }

      const result = await response.json();
      console.log(result)
      setStore(result);
    } catch (error) {
      setErrorMessage(translations.shop?.ERROR_LOAD_STORE);
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveProduct = async (selectedProduct) => {
    if (!selectedProduct) return;
    const token = localStorage.getItem("token");
  
    const productData = {
      item_name: selectedProduct.item_name,
      "password": inputValue
    };
  
    try {
      const response = await fetch(`${API_URL}/sloubie/shop/${params.id}/item/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
  
      const result = await response.json();
      if (typeof result === "object"){
        const updatedProducts = store.products.filter((product) => product.item_name !== result.item_name);
        setStore({ ...store, products: updatedProducts });
        setErrorMessage("");
        setMessage("Modification faite");
      }
      else
      {
        setMessage("");
        setErrorMessage(result);
      }
    } catch (error) {
    }
  };

  const handleModifyProduct = async (selectedProduct) => {
    if (!selectedProduct) return;
    const token = localStorage.getItem("token");
  
    const productData = {
      item_name: selectedProduct.item_name,
      price: selectedProduct.price,
      limit: selectedProduct.limit,
      have_limit: selectedProduct.have_limit,
      "password": inputValue
    };
  
    try {
      const response = await fetch(`${API_URL}/sloubie/shop/${params.id}/item/updade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
  
      const result = await response.json();
      if (typeof result === "object"){
        const updatedProducts = store.products.map((product) =>
          product.item_name === selectedProduct.item_name
            ? { ...product, ...result } // Mettre à jour le produit avec les nouvelles données
            : product
        );
        setStore({ ...store, products: updatedProducts });
        setErrorMessage("");
        setMessage("Modification faite");
      }
      else
      {
        setMessage("");
        setErrorMessage(result);
      }
    } catch (error) {
    }
  };
  
  const handlePriceChange = (productId: string, newPrice: string) => {
    const updatedProducts = store.products.map((product: any) =>
      product.item_name === productId ? { ...product, price: newPrice } : product
    );
    setStore({ ...store, products: updatedProducts });
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const updatedProducts = store.products.map((product: any) =>
      product.item_name === productId ? { ...product, limit: newQuantity } : product
    );
    setStore({ ...store, products: updatedProducts });
  };

  const handleLimitToggle = (productId: string, isChecked: boolean) => {
    const updatedProducts = store.products.map((product: any) =>
      product.item_name === productId ? { ...product, have_limit: isChecked } : product
    );
    setStore({ ...store, products: updatedProducts });
  };

  const handleAddProduct = async () => {
    setNewProduct({
      item_name: '',
      price: 0,
      quantity: 0,
      have_limit: false,
      limit: 0,
    });
  
    const token = localStorage.getItem("token");
    const productData = {
      item_name: newProduct.item_name,
      price: newProduct.price,
      limit: newProduct.limit,
      have_limit: newProduct.have_limit,
      password: inputValue,
    };
  
    try {
      const response = await fetch(`${API_URL}/sloubie/shop/${params.id}/item/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
  
      const result = await response.json();
      if (typeof result === "object") {
        const updatedProducts = [...store.products, newProduct];
        setStore({ ...store, products: updatedProducts });
        setErrorMessage("");
        setMessage("Produit ajouté avec succès");
      } else {
        setMessage("");
        setErrorMessage(result);
      }
    } catch (error) {
      setMessage("");
      setErrorMessage("Une erreur est survenue");
    }
  };  

  if (loading) return <p className="text-center">{translations.shop?.LOADING}</p>;

  return (
    <main className="content">
      <div className="content_top">
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
          {store && (
            <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
              <h1 className="text-4xl text-center font-bold">
                <strong>{translations.pnj?.["shop_" + store.category_name + "_" + store.name]}</strong>
              </h1>
              <br />
              <p style={{ textAlign: "center" }}>
                <strong>{translations.shop?.TITLE_SHOP_OWNER}</strong> {translations.pnj?.["pnj_" + store.pnj_name]}
              </p>
              <p style={{ textAlign: "center" }}>
                <strong>{translations.shop?.TITLE_SHOP_TYPE}</strong> {translations.shop?.['DISPLAY_CATEGORY_' + store.category_name]}
              </p>
              <br />
              <div style={{ textAlign: "center" }} className="buttons">
                <ButtonNeon label={translations.shop?.BACK_STORE_LIST} onClick={() => router.push("/sloubie/shop")} />
              </div>
            </div>
          )}
        <div className="mt-6 max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          {errorMessage && (
            <p className="alert-red">{errorMessage}</p>
          )}
          {message && (
            <p className="alert-green">{message}</p>
          )}
          <h3 className="text-lg font-semibold">{translations.shop?.PRODUCTS_LIST}</h3>
          <table className="w-full mt-4 border-collapse text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">{translations.shop?.PRODUCT_NAME}</th>
                <th className="p-2">{translations.shop?.PRICE}</th>
                <th className="p-2">{translations.shop?.LIMIT}</th>
                <th className="p-2">{translations.shop?.BUY}</th>
              </tr>
            </thead>
            <tbody>
              {store?.products?.map((product: any) => (
                <tr key={product.item_name} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getImageUrl(`item/${product.item_name}.webp`)}
                        alt={translations.item?.IMAGE_ITEM?.replace("[Item]", product.item_name)}
                        className="w-12 h-12"
                      />
                      <span>{translations.item?.["ITEM_" + product.item_name]}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handlePriceChange(product.item_name, e.target.value)}
                      className="w-20 p-2 border rounded-md"
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center space-x-3">
                      <label>
                        <input
                          type="checkbox"
                          checked={product.have_limit}
                          onChange={(e) => handleLimitToggle(product.item_name, e.target.checked)}
                          className="mr-2"
                        />
                        {translations.shop?.LIMIT_LABEL}
                      </label>
                      {product.have_limit && (
                        <input
                          type="number"
                          value={product.limit}
                          onChange={(e) => handleQuantityChange(product.item_name, e.target.value)}
                          className="w-20 p-2 border rounded-md"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center space-x-4">
                      <ButtonFancy label="Modifier" onClick={() => handleModifyProduct(product)} />
                      <ButtonNeon label="Supprimer" onClick={() => handleRemoveProduct(product)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Section pour ajouter un produit */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">{translations.shop?.ADD_PRODUCT}</h3>
            <div className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder={translations.shop?.PRODUCT_NAME_PLACEHOLDER}
                value={newProduct.item_name}
                onChange={(e) => setNewProduct({ ...newProduct, item_name: e.target.value })}
                className="p-2 border rounded-md"
              />
              <input
                type="number"
                placeholder={translations.shop?.PRICE_PLACEHOLDER}
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                className="p-2 border rounded-md"
              />
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newProduct.have_limit}
                  onChange={(e) => setNewProduct({ ...newProduct, have_limit: e.target.checked })}
                  className="mr-2"
                />
                <label>{translations.shop?.LIMIT_LABEL}</label>
                {newProduct.have_limit && (
                  <input
                    type="number"
                    value={newProduct.limit}
                    onChange={(e) => setNewProduct({ ...newProduct, limit: parseInt(e.target.value) })}
                    className="p-2 border rounded-md"
                  />
                )}
              </div>
              <ButtonFancy label="Ajouter" onClick={handleAddProduct} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StoreDetailPage;

