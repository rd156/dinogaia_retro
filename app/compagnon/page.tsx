'use client';

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

interface Translations {
  [key: string]: any;
}

interface Companion {
  id: number;
  name: string;
  niveau: number;
  xp: number;
  xp_max: number;
  specie_name: string;
  image: string;
}

export default function CompanionsPage() {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["companion", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const fetchCompanions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setError(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }
      const response = await fetch(`${API_URL}/compagnon/${dinoId}`, {
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
      setError("");
    } catch (error) {
      console.error('Error fetching companions:', error);
      setError(translations?.companion?.ERR_LOAD_COMPANIONS ?? "Erreur lors du chargement des compagnons");
    }
  };

  useEffect(() => {
    fetchCompanions();
  }, []);

  const handleNameClick = (companion: Companion) => {
    setEditingId(companion.id);
    setNewName(companion.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleNameSubmit = async (companionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setError(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }

      const response = await fetch(`${API_URL}/compagnon/${dinoId}/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companionId: companionId,
          newName: newName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rename companion');
      }
      
      // Mettre à jour le nom dans la liste des compagnons
      setCompanions(companions.map(companion => 
        companion.id === companionId 
          ? { ...companion, name: newName }
          : companion
      ));
      
      setEditingId(null);
      setMessage(translations?.companion?.NAME_UPDATED ?? "Nom mis à jour avec succès");
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error('Error renaming companion:', error);
      setError(translations?.companion?.ERR_RENAME_COMPANION ?? "Erreur lors du renommage du compagnon");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, companionId: number) => {
    if (e.key === 'Enter') {
      handleNameSubmit(companionId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleCollectResources = async (companionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setError(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }
      /*
      const response = await fetch(`${API_URL}/companion/collect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dinoId: dinoId,
          companionId: companionId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to collect resources');
      }
      
      const data = await response.json();
      setMessage(translations?.companion?.RESOURCES_COLLECTED ?? "Ressources collectées avec succès");
      
      // Rafraîchir les données des compagnons
      fetchCompanions();
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setMessage("");
      }, 3000);
      */
    } catch (error) {
      console.error('Error collecting resources:', error);
      setError(translations?.companion?.ERR_COLLECT_RESOURCES ?? "Erreur lors de la collecte des ressources");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const canCollect = (lastCollected: string) => {
    const lastCollectedDate = new Date(lastCollected);
    const now = new Date();
    
    // Vérifier si la dernière collecte date d'au moins 24 heures
    const diffTime = Math.abs(now.getTime() - lastCollectedDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    return diffHours >= 24;
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="container_page">
          <div className="block_white mb-4">
            <h1 className="text-2xl font-bold text-center mb-4">
              {translations?.companion?.COMPANIONS_TITLE ?? "Mes compagnons"}
            </h1>
            <p className="text-center mb-4">
              {translations?.companion?.COMPANIONS_DESCRIPTION ?? "Vos compagnons sont vos fidèles alliés dans l'aventure."}
            </p>
          </div>

          {error && (
            <div className="alert-red mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="alert-green mb-4">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companions.map((companion) => (
              <div key={companion.id} className="block_white p-4">
                <div className="flex flex-col items-center">
                  <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', display: 'flex', alignItems: 'center'}} className='block_white'>
                    <ImageGeneriqueWithText 
                      imageType="compagnon"
                      imageName={companion.specie_name}
                      defaultType="compagnon"
                      defaultName={companion.name}
                      width={200}
                      height={200}
                      alt="Image du compagnon"
                      className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 object-cover rounded"
                    />
                  </div>
                  
                  {editingId === companion.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={handleNameChange}
                        onKeyDown={(e) => handleKeyPress(e, companion.id)}
                        className="px-2 py-1 border rounded text-center"
                        autoFocus
                      />
                      <button
                        onClick={() => handleNameSubmit(companion.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <h2 
                      className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => handleNameClick(companion)}
                    >
                      {companion.name}
                    </h2>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {translations?.companion?.LEVEL ?? "Niveau"} {companion.niveau}
                    </span>
                  </div>
                  
                  <div className="w-full mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(companion.xp / companion.xp_max) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {translations?.companion?.EXPERIENCE ?? "Expérience"}: {companion.xp} / {companion.xp_max}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {companions.length > 0 && companions.length < 3 && (
            <div className="block_white text-center py-4 mt-4">
              <p className="mb-2">
                {translations?.companion?.CAN_HAVE_MORE_COMPANIONS ?? "Vous pouvez avoir jusqu'à 3 compagnons"}
              </p>
              <ButtonFancy
                label={translations?.companion?.GET_MORE_COMPANIONS ?? "Obtenir plus de compagnons"}
                onClick={() => window.location.href = '/shop/companion'}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 