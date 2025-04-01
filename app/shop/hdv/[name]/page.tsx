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

interface GroupedOrder {
  price: number;
  totalQuantity: number;
  orders: Order[];
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

  const groupOrdersByPrice = (orders: Order[] | undefined): GroupedOrder[] => {
    if (!orders || !Array.isArray(orders)) return [];
    
    // Grouper les ordres par prix
    const groupedByPrice = orders.reduce((acc: { [key: number]: Order[] }, order) => {
      if (!acc[order.price]) {
        acc[order.price] = [];
      }
      acc[order.price].push(order);
      return acc;
    }, {});

    // Convertir en tableau et calculer les totaux
    return Object.entries(groupedByPrice)
      .map(([price, orders]) => ({
        price: Number(price),
        totalQuantity: orders.reduce((sum, order) => sum + order.quantite, 0),
        orders: orders
      }))
      .sort((a, b) => a.price - b.price);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/market/list/item`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item: name
          })
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        console.log(data)
        const groupedSells = groupOrdersByPrice(data);
        setSellOrders(groupedSells);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [name]);

  useEffect(() => {
    const fetchBuyOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/market/purchase_offer/list/item`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item: name
          })
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        // Les données sont directement un tableau, pas besoin d'accéder à .buys
        const groupedBuys = groupOrdersByPrice(data);
        setBuyOrders(groupedBuys);
      } catch (error) {
        console.error('Error fetching buy orders:', error);
        setBuyOrders([]);
      }
    };

    fetchBuyOrders();
  }, [name]);

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
                {sellOrders.map((groupedOrder) => (
                <div 
                    key={groupedOrder.price}
                    className="p-2 hover:bg-gray-50 transition-colors border-b"
                >
                    <div className="flex justify-between items-center">
                    <span className="text-red-600 font-medium flex items-center gap-2">
                        {groupedOrder.price} <span className="text-lg">💰</span>
                    </span>
                    <span className="text-gray-600">
                        {groupedOrder.totalQuantity} {translations?.shop?.UNITS ?? 'unités'}
                    </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                    {groupedOrder.orders.map(order => (
                        <div key={order.id} className="flex justify-between items-center text-xs">
                        <span>{order.dino_name}</span>
                        <span>{order.quantite} unités</span>
                        </div>
                    ))}
                    </div>
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
                {buyOrders.map((groupedOrder) => (
                <div 
                    key={groupedOrder.price}
                    className="p-2 hover:bg-gray-50 transition-colors border-b"
                >
                    <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium flex items-center gap-2">
                    {groupedOrder.price} <span className="text-lg">💰</span>
                    </span>
                    <span className="text-gray-600">
                    {groupedOrder.totalQuantity} {translations?.shop?.UNITS ?? 'unités'}
                    </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                    {groupedOrder.orders.map(order => (
                        <div key={order.id} className="flex justify-between items-center text-xs">
                        <span>{order.dino_name}</span>
                        <span>{order.quantite} unités</span>
                        </div>
                    ))}
                    </div>
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
