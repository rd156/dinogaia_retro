'use client';

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import "./page.css";

interface Translations {
  [key: string]: any;
}

interface Order {
  id: number;
  id_dino: number;
  dino_name: string;
  item: number;
  quantite: number;
  price: number;
  price_total: number;
  item_name: string;
  item_categorie: string;
}

export default function MyOrdersPage() {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["shop", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Fetching sell orders...');
      const response = await fetch(`${API_URL}/market/my`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Sell orders data:', data);
      setSellOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setSellOrders([]);
    }
  };

  const fetchBuyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Fetching buy orders...');
      const response = await fetch(`${API_URL}/market/purchase_offer/my`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch buy orders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Buy orders data:', data);
      setBuyOrders(data);
    } catch (error) {
      console.error('Error fetching buy orders:', error);
      setBuyOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBuyOrders();
  }, []);

  const handleCancelOrder = async (orderId: number, isBuyOrder: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isBuyOrder 
        ? `${API_URL}/market/purchase_offer/cancel`
        : `${API_URL}/market/cancel`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      // Rafraîchir les données
      await Promise.all([fetchOrders(), fetchBuyOrders()]);
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="container_page">
          <div className="block_white mb-4">
            <h1 className="text-2xl font-bold text-center mb-4">
              {translations?.shop?.MY_ORDERS ?? 'Mes ventes et ordres achats'}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ordres de vente */}
            <div className="block_white">
              <h2 className="text-xl font-semibold mb-4 text-red-600 border-b pb-2">
                {translations?.shop?.MY_SELL_ORDERS ?? 'Mes ventes'}
              </h2>
              <div className="space-y-2">
                {sellOrders?.map((order) => (
                  <div 
                    key={order.id}
                    className="p-2 hover:bg-gray-50 transition-colors border-b"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className="text-red-600 font-medium flex items-center gap-2 min-w-[100px]">
                          {order.price} <span className="text-lg">💰</span>
                        </span>
                        <span className="text-gray-600">
                          {order.quantite} {translations?.shop?.UNITS ?? 'unités'}
                        </span>
                        <span className="text-sm">
                          {translations?.item?.['ITEM_' + order.item_name] ?? order.item_name}
                        </span>
                      </div>
                      <ButtonNeon
                        label={translations?.global?.CANCEL ?? 'Annuler'}
                        onClick={() => handleCancelOrder(order.id, false)}
                      />
                    </div>
                  </div>
                ))}
                {sellOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    {translations?.shop?.NO_SELL_ORDERS ?? 'Aucune vente en cours'}
                  </p>
                )}
              </div>
            </div>

            {/* Ordres d'achat */}
            <div className="block_white">
              <h2 className="text-xl font-semibold mb-4 text-green-600 border-b pb-2">
                {translations?.shop?.MY_BUY_ORDERS ?? 'Mes offres d\'achat'}
              </h2>
              <div className="space-y-2">
                {buyOrders?.map((order) => (
                  <div 
                    key={order.id}
                    className="p-2 hover:bg-gray-50 transition-colors border-b"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className="text-green-600 font-medium flex items-center gap-2 min-w-[100px]">
                          {order.price} <span className="text-lg">💰</span>
                        </span>
                        <span className="text-gray-600">
                          {order.quantite} {translations?.shop?.UNITS ?? 'unités'}
                        </span>
                        <span className="text-sm">
                          {translations?.item?.['ITEM_' + order.item_name] ?? order.item_name}
                        </span>
                      </div>
                      <ButtonNeon
                        label={translations?.global?.CANCEL ?? 'Annuler'}
                        onClick={() => handleCancelOrder(order.id, true)}
                      />
                    </div>
                  </div>
                ))}
                {buyOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    {translations?.shop?.NO_BUY_ORDERS ?? 'Aucune offre d\'achat en cours'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
