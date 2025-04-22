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
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

interface Translations {
  [key: string]: any;
}

interface Store {
  [key: string]: any;
}

interface Product {
  [key: string]: any;
}

interface Companion {
  id: number;
  name: string;
  specie_name: string;
  dino: number;
  dino_name: string;
  pv: number;
  force: number;
  endurance: number;
  agilite: number;
  intelligence: number;
  taille: number;
  poids: number;
  degat: number;
  defense: number;
  vitesse: number;
  perception: number;
  entretien: number;
  niveau: number;
  xp: number;
  xp_max: number;
  loyauté: number;
  bonheur: number;
  created_at: string | null;
  is_busy: boolean;
  busy_until: string | null;
  current_event: string | null;
  current_event_name: string | null;
  time_remaining: number;
  possible_events: any[];
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
  const [showCompanions, setShowCompanions] = useState<boolean>(false);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [companionsLoading, setCompanionsLoading] = useState<boolean>(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["item", "shop", "pnj", "error", "global", "companion"]);
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
  }, [params.name, translations]);

  const fetchCompanions = async () => {
    try {
      setCompanionsLoading(true);
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setErrorMessage(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }
      
      const response = await fetch(`${API_URL}/compagnon/shop/${params.name}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch companions');
      }
      
      const data = await response.json();
      console.log(data);
      setCompanions(data);
      setErrorMessage("");
    } catch (error) {
      console.error('Error fetching companions:', error);
      setErrorMessage(translations?.companion?.ERR_LOAD_COMPANIONS ?? "Erreur lors du chargement des compagnons");
    } finally {
      setCompanionsLoading(false);
    }
  };

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

  const toggleCompanionsView = () => {
    setShowCompanions(!showCompanions);
    if (!showCompanions && companions.length === 0) {
      fetchCompanions();
    }
  };

  const handleRecruitCompanion = async (companion: Companion) => {
    try {
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setErrorMessage(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }
      
      const response = await fetch(`${API_URL}/compagnon/${dinoId}/recruit/${companion.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dinoId: dinoId
        })
      });
      
      const result = await response.json();
      console.log(result)
      if (result === 'max_companions_reached') {
        setErrorMessage(translations?.companion?.MAX_COMPANIONS_REACHED ?? "Vous avez atteint la limite maximale de compagnons");
      }
      else
      {
        setMessage(translations?.companion?.RECRUIT_SUCCESS ?? "Compagnon recruté avec succès");
        setSelectedCompanion(null);
        fetchCompanions();
      }
    } catch (error) {
      console.error('Error recruiting companion:', error);
      setErrorMessage(error instanceof Error ? error.message : (translations?.companion?.ERR_RECRUIT_COMPANION ?? "Erreur lors du recrutement du compagnon"));
    }
  };

  if (loading) return <p className="text-center">{translations.shop?.LOADING}</p>;

  return (
    <main className="content">
      <div className="content_top">
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          <h1 className="text-4xl text-center font-bold">
            <strong>Taverne {translations.pnj?.["shop_" + store?.category_name + "_" + store?.name]}</strong>
          </h1>
          <br />
          <p style={{textAlign:"center"}}><strong>{translations.shop?.TITLE_SHOP_OWNER}</strong> {translations.pnj?.["pnj_" + store?.pnj_name]}</p>
          <p style={{textAlign:"center"}}><strong>{translations.shop?.TITLE_SHOP_TYPE}</strong> {translations.shop?.['DISPLAY_CATEGORY_' + store?.category_name]}</p>
          <br />
          <div style={{textAlign:"center"}} className="buttons flex justify-center gap-4">
            <ButtonNeon label={translations.shop?.BACK_STORE_LIST} onClick={() => router.push("/shop/store")} />
            <ButtonNeon 
              label={showCompanions ? translations.shop?.SHOW_PRODUCTS ?? "Voir les produits" : translations.shop?.SHOW_CLIENTS ?? "Voir les clients"} 
              onClick={toggleCompanionsView} 
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 max-w-2xl mx-auto">
            <p className="alert-red">{errorMessage}</p>
          </div>
        )}
        
        {message && (
          <div className="mt-6 max-w-2xl mx-auto">
            <p className="alert-green">{message}</p>
          </div>
        )}

        {!showCompanions ? (
          <div className="mt-6 max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
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
        ) : (
          <div className="mt-6 max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
            <h3 className="text-lg font-semibold">{translations.shop?.COMPANIONS_LIST ?? "Compagnons disponibles"}</h3>
            
            {companionsLoading ? (
              <p className="text-center mt-4">{translations.shop?.LOADING}</p>
            ) : companions.length === 0 ? (
              <p className="text-center mt-4">{translations.shop?.NO_COMPANIONS ?? "Aucun compagnon disponible"}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {companions.map((companion) => (
                  <div key={companion.id} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => setSelectedCompanion(companion)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300">
                          <ImageGeneriqueWithText 
                            imageType="compagnon"
                            imageName={companion.specie_name}
                            defaultType="compagnon"
                            defaultName={companion.name}
                            width={64}
                            height={64}
                            alt={`Image de ${companion.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm">{translations.companion?.["TYPE_" + companion.specie_name] ?? companion.specie_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm"><strong>{translations.companion?.ENTRETIEN ?? "Entretien"}:</strong> {companion.entretien} E</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm"><strong>{translations.companion?.FORCE ?? "Force"}:</strong></span>
                        <span className="text-sm">{companion.force}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm"><strong>{translations.companion?.ENDURANCE ?? "Endurance"}:</strong></span>
                        <span className="text-sm">{companion.endurance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm"><strong>{translations.companion?.AGILITE ?? "Agilité"}:</strong></span>
                        <span className="text-sm">{companion.agilite}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm"><strong>{translations.companion?.INTELLIGENCE ?? "Intelligence"}:</strong></span>
                        <span className="text-sm">{companion.intelligence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm"><strong>{translations.companion?.TAILLE ?? "Taille"}:</strong></span>
                        <span className="text-sm">{companion.taille} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm"><strong>{translations.companion?.POIDS ?? "Poids"}:</strong></span>
                        <span className="text-sm">{companion.poids} kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

        {selectedCompanion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">{translations.companion?.RECRUIT_CONFIRM ?? "Confirmer le recrutement"}</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                  <ImageGeneriqueWithText 
                    imageType="compagnon"
                    imageName={selectedCompanion.specie_name}
                    defaultType="compagnon"
                    defaultName={selectedCompanion.name}
                    width={80}
                    height={80}
                    alt={`Image de ${selectedCompanion.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedCompanion.name}</h4>
                  <p className="text-sm text-gray-600">{translations.companion?.["TYPE_" + selectedCompanion.specie_name] ?? selectedCompanion.specie_name}</p>
                </div>
              </div>
              <p className="mb-4">{translations.companion?.RECRUIT_CONFIRM_MESSAGE ?? "Êtes-vous sûr de vouloir recruter ce compagnon ?"}</p>
              <div className="flex justify-end gap-4">
                <ButtonNeon 
                  label={translations.companion?.CANCEL ?? "Annuler"} 
                  onClick={() => setSelectedCompanion(null)} 
                />
                <ButtonFancy 
                  label={translations.companion?.RECRUIT ?? "Recruter"} 
                  onClick={() => handleRecruitCompanion(selectedCompanion)} 
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default StoreDetailPage;
