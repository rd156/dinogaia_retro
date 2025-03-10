"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ItemWithTooltip from "@/components/pattern/ItemWithTooltip";

interface Translations {
  [key: string]: any;
}

interface Store {
  [key: string]: any;
}
interface Product {
  [key: string]: any;
}

const StoreDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["item", "shop", "pnj", "error", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchStoreDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/shop/${params.name}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
    };

    if (params.name) {
      fetchStoreDetail();
    }
  }, [params.name]);

  const handleBuyProduct = async (selectedProduct: Product) => {
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const response = await fetch(`${API_URL}/shop/${params.name}/buy/${selectedProduct.item_name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "quantity": quantity,
          "price": selectedProduct.price,
          "dinoId": dinoId
        }),
      });

      const result = await response.json();
      console.log(result)
      if (typeof result === "object"){
        const updatedProducts = store?.products.map((product: Product) => {
          if (product.item_name === selectedProduct.item_name) {
            const newQuantity = product.limit - quantity;
            return {
              ...product,
              limit: newQuantity >= 0 ? newQuantity : 0
            };
          }
          return product;
        });
    
        setStore((prevState) => ({
          ...prevState,
          products: updatedProducts,
        }));
        setMessage(translations.shop?.ACHAT_RESUME.replace("[Number]", quantity)
        .replace("[Name]", translations.item?.["ITEM_" + result.item_name]).replace("[Price]", selectedProduct.price * quantity))
        setErrorMessage("")
      }
      else
      {
        setMessage("")
        setErrorMessage(translations.error?.["ERROR_" + result])
      }
      setSelectedProduct(null);
    }
    catch (error) {
    }
  };

  if (loading) return <p className="text-center">{translations.shop?.LOADING}</p>;

  return (
    <main className="content">
      <div className="content_top">
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          <h1 className="text-4xl text-center font-bold">
            <strong>{translations.pnj?.["shop_" + store?.category_name + "_" + store?.name]}</strong>
          </h1>
          <br />
          <p style={{textAlign:"center"}}><strong>{translations.shop?.TITLE_SHOP_OWNER}</strong> {translations.pnj?.["pnj_" + store?.pnj_name]}</p>
          <p style={{textAlign:"center"}}><strong>{translations.shop?.TITLE_SHOP_TYPE}</strong> {translations.shop?.['DISPLAY_CATEGORY_' + store?.category_name]}</p>
          <br />
          <div style={{textAlign:"center"}} className="buttons">
            <ButtonNeon label={translations.shop?.BACK_STORE_LIST} onClick={() => router.push("/shop/store")} />
          </div>
        </div>
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
                  <td className="p-2 relative">
                    <ItemWithTooltip 
                      itemName={product.item_name}
                      translations={translations.item}
                    />
                  </td>
                  <td className="p-2">{translations.shop?.DISPLAY_PRICE.replace("[Number]", product.price)}</td>
                  <td className="p-2">
                    {product.have_limit 
                      ? product.limit === 0 
                        ? <span className="text-red-500">{translations.shop?.RUPTURE_OF_STOCK}</span>
                        : <span className="text-green-800">{translations.shop?.QUANTITY_LIMIT.replace("[Number]", product.limit)}</span>
                      : <span className="text-green-800">{translations.shop?.QUANTITY_NO_LIMIT}</span>
                    }
                  </td>
                  <td className="p-2">
                    {product.have_limit && product.limit === 0 
                      ? null
                      : <ButtonFancy label="Acheter" onClick={() => setSelectedProduct(product)} />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold">{translations.shop?.BUY_CONFIRM}</h3>
              <p><strong>{translations.shop?.MODAL_PRODUCT}</strong> {translations.item?.["ITEM_" + selectedProduct.item_name]}</p>
              <p><strong>{translations.shop?.MODAL_PRICE_UNIT}</strong> {translations.shop?.DISPLAY_PRICE.replace("[Number]", selectedProduct.price)}</p>
              <p><strong>{translations.shop?.MODAL_STOCK}</strong> 
                {selectedProduct.have_limit 
                  ? selectedProduct.limit === 0 
                    ? <span className="text-red-500">{translations.shop?.RUPTURE_OF_STOCK}</span>
                    : <span className="text-green-800">{selectedProduct.limit}</span>
                  : <span className="text-green-800"></span>
                }
              </p>
              <label className="block mt-2">
                <span>{translations.shop?.MODAL_FORM_QUANTITY}</span>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.limit}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 border rounded-md mt-1"
                />
              </label>
              <p className="mt-4"><strong>{translations.shop?.MODAL_TOTAL_PRICE}</strong> {translations.shop?.DISPLAY_PRICE.replace("[Number]", selectedProduct.price * quantity)}</p>
              <div className="flex justify-between mt-4">
                <ButtonNeon label={translations.shop?.MODAL_CANCEL} onClick={() => setSelectedProduct(null)} />
                <ButtonFancy label={translations.shop?.MODAL_BUY} onClick={() => handleBuyProduct(selectedProduct)} />
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default StoreDetailPage;
