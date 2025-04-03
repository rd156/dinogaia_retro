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
import { Dialog } from '@headlessui/react';

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">
          <Dialog.Title className="text-xl font-bold mb-4">{title}</Dialog.Title>
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default function ItemOrdersPage() {
  const { name } = useParams();
  const [sellOrders, setSellOrders] = useState<GroupedOrder[]>([]);
  const [buyOrders, setBuyOrders] = useState<GroupedOrder[]>([]);
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell' | 'directBuy' | 'directSell' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<GroupedOrder | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

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
      const groupedSells = groupOrdersByPrice(data);
      setSellOrders(groupedSells);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

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
      const groupedBuys = groupOrdersByPrice(data);
      setBuyOrders(groupedBuys);
    } catch (error) {
      console.error('Error fetching buy orders:', error);
      setBuyOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [name]);

  useEffect(() => {
    fetchBuyOrders();
  }, [name]);

  const handleOpenModal = (type: 'buy' | 'sell' | 'directBuy' | 'directSell', order?: GroupedOrder) => {
    setModalType(type);
    setSelectedOrder(order || null);
    
    if (type === 'sell') {
      // Trouver le prix minimum parmi les ordres de vente
      const minPrice = sellOrders.length > 0 
        ? Math.min(...sellOrders.map(order => order.price))
        : 0;
      // Si un prix minimum existe, on le définit légèrement en dessous
      setPrice(minPrice > 0 ? minPrice : 100);
    } else if (type === 'buy') {
      // Trouver le prix minimum parmi les offres d'achat
      const minBuyPrice = buyOrders.length > 0 
        ? Math.min(...buyOrders.map(order => order.price))
        : 0;
      // Si un prix minimum existe, on le définit légèrement en dessous
      setPrice(minBuyPrice > 0 ? minBuyPrice : 10);
    } else if (order) {
      // Pour les achats/ventes directs, on utilise le prix de l'ordre sélectionné
      setPrice(order.price);
    }

    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const dinoId = localStorage.getItem("dinoId");
    try {
      let endpoint = '';
      let body = {};

      console.log(modalType);
      switch (modalType) {
        case 'buy':
          endpoint = `${API_URL}/market/purchase_offer/buy`;
          break;
        case 'sell':
          endpoint = `${API_URL}/market/sell`;
          break;
        case 'directBuy':
          endpoint = `${API_URL}/market/buy`;
          break;
        case 'directSell':
          endpoint = `${API_URL}/market/purchase_offer/sell`;
          break;
      }
      body = { dinoId: dinoId, item: name, price: price, quantity: quantity};
      console.log(body);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to submit order');

      const data = await response.json();
      console.log(data);

      await Promise.all([fetchOrders(), fetchBuyOrders()]);
      setIsModalOpen(false);
      setQuantity(1);
      setPrice(0);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="container_page">
          <div className="block_white mb-4">
            <h1 className="text-2xl font-bold text-center mb-4">
              {translations?.item?.['ITEM_' + name] ?? name}
            </h1>
            <div className="flex justify-center gap-4 mt-4">
              <ButtonFancy
                label={translations?.shop?.SELL ?? 'Mettre en vente '}
                onClick={() => handleOpenModal('sell')}
              />
              <ButtonFancy
                label={translations?.shop?.CREATE_BUY_ORDER ?? 'Créer une offre d\'achat'}
                onClick={() => handleOpenModal('buy')}
              />
            </div>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className="text-red-600 font-medium flex items-center gap-2 min-w-[100px]">
                          {groupedOrder.price} <span className="text-lg">💰</span>
                        </span>
                        <span className="text-gray-600">
                          {groupedOrder.totalQuantity} {translations?.shop?.UNITS ?? 'unités'}
                        </span>
                      </div>
                      <ButtonNeon
                        label={translations?.shop?.BUY ?? 'Acheter'}
                        onClick={() => handleOpenModal('directBuy', groupedOrder)}
                      />
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className="text-green-600 font-medium flex items-center gap-2 min-w-[100px]">
                          {groupedOrder.price} <span className="text-lg">💰</span>
                        </span>
                        <span className="text-gray-600">
                          {groupedOrder.totalQuantity} {translations?.shop?.UNITS ?? 'unités'}
                        </span>
                      </div>
                      <ButtonNeon
                        label={translations?.shop?.SELL ?? 'Vendre'}
                        onClick={() => handleOpenModal('directSell', groupedOrder)}
                      />
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            modalType === 'buy' ? (translations?.shop?.CREATE_BUY_ORDER ?? 'Créer une offre d\'achat') :
            modalType === 'sell' ? (translations?.shop?.CREATE_SELL_ORDER ?? 'Créer une offre de vente') :
            modalType === 'directBuy' ? (translations?.shop?.DIRECT_BUY ?? 'Acheter directement') :
            (translations?.shop?.DIRECT_SELL ?? 'Vendre directement')
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations?.shop?.QUANTITY ?? 'Quantité'}
              </label>
              <input
                type="number"
                min="1"
                max={selectedOrder?.totalQuantity || 999999}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {(modalType === 'buy' || modalType === 'sell') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations?.shop?.PRICE ?? 'Prix unitaire'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <ButtonFancy
                label={translations?.global?.CANCEL ?? 'Annuler'}
                onClick={() => setIsModalOpen(false)}
              />
              <ButtonFancy
                label={translations?.global?.CONFIRM ?? 'Confirmer'}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
