'use client';

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";
import ButtonFancyGreen from "@/components/pattern/ButtonFancyGreen";

interface Translations {
  [key: string]: any;
}

interface PossibleEvent {
  name: string;
  duration_minutes: number;
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
  possible_events: PossibleEvent[];
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
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [showEventSelector, setShowEventSelector] = useState<number | null>(null);

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

      const response = await fetch(`${API_URL}/compagnon/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dinoId: dinoId,
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

  const calculateTimeRemaining = (busyUntil: string | null): string | null => {
    if (!busyUntil) return null;
    
    try {
      const endTime = new Date(busyUntil);
      const now = new Date();

      if (endTime <= now) {
        return null;
      }
      const diffTime = endTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);
      
      if (diffMinutes === 0) return `${diffSeconds}s`;
      return `${diffMinutes}m ${diffSeconds}s`;
    } catch (error) {
      console.error("Erreur lors du calcul du temps restant:", error);
      return null;
    }
  };

  const handleCollectEvent = async (companionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setError(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }

      const response = await fetch(`${API_URL}/compagnon/${dinoId}/${companionId}/collect_event`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to collect event');
      }
      
      // Rafraîchir les données des compagnons
      fetchCompanions();
      
      setMessage(translations?.companion?.EVENT_COLLECTED ?? "Événement collecté avec succès");
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error('Error collecting event:', error);
      setError(translations?.companion?.ERR_COLLECT_EVENT ?? "Erreur lors de la collecte de l'événement");
    }
  };

  const handleEventSelect = (eventName: string) => {
    setSelectedEvent(eventName);
  };

  const handleStartEvent = async (companionId: number) => {
    if (!selectedEvent) {
      setError(translations?.companion?.SELECT_EVENT ?? "Veuillez sélectionner un événement");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setError(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }
      const response = await fetch(`${API_URL}/compagnon/${dinoId}/${companionId}/start_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventName: selectedEvent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start event');
      }
      
      // Rafraîchir les données des compagnons
      fetchCompanions();
      
      setShowEventSelector(null);
      setSelectedEvent("");
      setMessage(translations?.companion?.EVENT_STARTED ?? "Événement démarré avec succès");
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error('Error starting event:', error);
      setError(translations?.companion?.ERR_START_EVENT ?? "Erreur lors du démarrage de l'événement");
    }
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
                  
                  {companion.is_busy && companion.current_event_name && calculateTimeRemaining(companion.busy_until) && (
                    <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                      <div>{companion.current_event_name}</div>
                      <div>Temps restant: {calculateTimeRemaining(companion.busy_until)}</div>
                    </div>
                  )}
                  {companion.is_busy && !calculateTimeRemaining(companion.busy_until) && (
                    <div className="mt-2">
                      <ButtonFancyGreen
                        label={translations?.companion?.COLLECT_EVENT ?? "Collecter"}
                        onClick={() => handleCollectEvent(companion.id)}
                      />
                    </div>
                  )}

                  {!companion.is_busy && companion.possible_events && companion.possible_events.length > 0 && (
                    <div className="mt-2 w-full">
                      {showEventSelector === companion.id ? (
                        <div className="flex flex-col gap-2">
                          <select 
                            className="w-full p-2 border rounded"
                            value={selectedEvent}
                            onChange={(e) => handleEventSelect(e.target.value)}
                          >
                            <option value="">{translations?.companion?.SELECT_EVENT ?? "Sélectionner un événement"}</option>
                            {companion.possible_events.map((event, index) => (
                              <option key={index} value={event.name}>
                                {translations?.companion?.["action_" + event.name] ?? event.name} ({event.duration_minutes} min)
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <ButtonNeon
                              label={translations?.companion?.START_EVENT ?? "Démarrer"}
                              onClick={() => handleStartEvent(companion.id)}
                            />
                            <button
                              onClick={() => {
                                setShowEventSelector(null);
                                setSelectedEvent("");
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              {translations?.companion?.CANCEL ?? "Annuler"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-center">
                          <ButtonNeon
                            label={translations?.companion?.START_EVENT ?? "Démarrer un événement"}
                            onClick={() => setShowEventSelector(companion.id)}
                          />
                        </div>
                      )}
                    </div>
                  )}
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
                label={translations?.companion?.GET_MORE_COMPANIONS ?? "Vous pouvez obtenir plus de compagnons"}
                onClick={() => window.location.href = '/cave'}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 