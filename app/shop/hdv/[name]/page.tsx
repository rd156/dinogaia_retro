'use client';

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import ImageItemWithText from "@/components/pattern/ImageItemWithText";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import { useParams } from "next/navigation";

interface Translations {
    [key: string]: any;
  }

interface Order {
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
}

interface GroupedOrder {
  price: number;
  totalQuantity: number;
}

export default function ItemOrdersPage() {
  const { name } = useParams();
  const [sellOrders, setSellOrders] = useState<GroupedOrder[]>([]);
  const [buyOrders, setBuyOrders] = useState<GroupedOrder[]>([]);
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});


  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["shop", "item", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/market/purchase_offer/sell`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        
        const groupedSells = groupOrdersByPrice(data.sells);
        
        setSellOrders(groupedSells);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [name, translations]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/market/purchase_offer/buy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        const groupedBuys = groupOrdersByPrice(data.buys);
        setBuyOrders(groupedBuys);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [name, translations]);
  
  const groupOrdersByPrice = (orders: Order[]): GroupedOrder[] => {
    const grouped = orders.reduce((acc: { [key: number]: number }, order) => {
      if (acc[order.price]) {
        acc[order.price] += order.quantity;
      } else {
        acc[order.price] = order.quantity;
      }
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([price, totalQuantity]) => ({
        price: Number(price),
        totalQuantity
      }))
      .sort((a, b) => a.price - b.price);
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="container_page">
        <div className="block_white mb-4">
            <h1 className="text-2xl font-bold text-center mb-4">
            {translations?.item?.['ITEM_' + name] ?? name}
            </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ordres de vente */}
            <div className="block_white">
            <h2 className="text-xl font-semibold mb-4 text-red-600 border-b pb-2">
                {translations?.shop?.SELL_ORDERS ?? 'Ordres de vente'}
            </h2>
            <div className="space-y-2">
                {sellOrders.map((order, index) => (
                <div 
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 transition-colors"
                >
                    <span className="text-red-600 font-medium flex items-center gap-2">
                    {order.price} <span className="text-lg">💰</span>
                    </span>
                    <span className="text-gray-600">
                    {order.totalQuantity} {translations?.shop?.UNITS ?? 'unités'}
                    </span>
                </div>
                ))}
                {sellOrders.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                    {translations?.shop?.NO_SELL_ORDERS ?? 'Aucun ordre de vente'}
                </p>
                )}
            </div>
            </div>

            {/* Ordres d'achat */}
            <div className="block_white">
            <h2 className="text-xl font-semibold mb-4 text-green-600 border-b pb-2">
                {translations?.shop?.BUY_ORDERS ?? 'Ordres d\'achat'}
            </h2>
            <div className="space-y-2">
                {buyOrders.map((order, index) => (
                <div 
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 transition-colors"
                >
                    <span className="text-green-600 font-medium flex items-center gap-2">
                    {order.price} <span className="text-lg">💰</span>
                    </span>
                    <span className="text-gray-600">
                    {order.totalQuantity} {translations?.shop?.UNITS ?? 'unités'}
                    </span>
                </div>
                ))}
                {buyOrders.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                    {translations?.shop?.NO_BUY_ORDERS ?? 'Aucun ordre d\'achat'}
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
