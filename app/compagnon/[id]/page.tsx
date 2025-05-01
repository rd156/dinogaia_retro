"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

interface Translations {
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
  next_entretien: string | null;
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

const CompanionDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getMaintenanceColor = (date: string | null) => {
    if (!date) return 'text-gray-600';
    
    const nextMaintenance = new Date(date);
    const today = new Date();
    const diffTime = nextMaintenance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 7) return 'text-orange-600';
    return 'text-green-600';
  };

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["companion", "global", "error"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchCompanionDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const dinoId = localStorage.getItem("dinoId");
        
        if (!token || !dinoId) {
          setErrorMessage(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
          return;
        }

        const response = await fetch(`${API_URL}/compagnon/${dinoId}/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(translations?.companion?.ERR_LOAD_COMPANION ?? "Erreur lors du chargement du compagnon");
        }

        const result = await response.json();
        console.log(result);
        setCompanion(result);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : (translations?.companion?.ERR_LOAD_COMPANION ?? "Erreur lors du chargement du compagnon"));
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCompanionDetail();
    }
  }, [params.id, translations]);

  const handlePaySalary = async () => {
    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      
      if (!token || !dinoId) {
        setErrorMessage(translations?.global?.NOT_LOGGED_IN ?? "Vous devez être connecté");
        return;
      }

      const response = await fetch(`${API_URL}/compagnon/${dinoId}/${params.id}/pay_salary`, {
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
      
      if (!response.ok) {
        if (result.error === 'not_enough_money') {
          throw new Error(translations?.companion?.NOT_ENOUGH_MONEY ?? "Vous n'avez pas assez d'argent");
        }
        throw new Error(result.message || 'Failed to pay salary');
      }

      setMessage(translations?.companion?.SALARY_PAID ?? "Salaire payé avec succès");
      
      // Rafraîchir les informations du compagnon
      const companionResponse = await fetch(`${API_URL}/compagnon/${dinoId}/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (companionResponse.ok) {
        const companionData = await companionResponse.json();
        setCompanion(companionData);
      }
    } catch (error) {
      console.error('Error paying salary:', error);
      setErrorMessage(error instanceof Error ? error.message : (translations?.companion?.ERR_PAY_SALARY ?? "Erreur lors du paiement du salaire"));
    }
  };

  if (loading) return <p className="text-center">{translations.companion?.LOADING ?? "Chargement..."}</p>;

  return (
    <main className="content">
      <div className="content_top">
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">
              {companion?.name}
            </h1>
            <ButtonNeon 
              label={translations.companion?.BACK_COMPANIONS ?? "Retour aux compagnons"} 
              onClick={() => router.push("/compagnon")} 
            />
          </div>

          {errorMessage && (
            <div className="mb-4">
              <p className="alert-red">{errorMessage}</p>
            </div>
          )}
          
          {message && (
            <div className="mb-4">
              <p className="alert-green">{message}</p>
            </div>
          )}

          {companion && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300">
                  <ImageGeneriqueWithText 
                    imageType="compagnon"
                    imageName={companion.specie_name}
                    defaultType="compagnon"
                    defaultName={companion.name}
                    width={128}
                    height={128}
                    alt={`Image de ${companion.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg text-gray-600">{translations.companion?.["TYPE_" + companion.specie_name] ?? companion.specie_name}</p>
                  <p className="text-sm text-gray-500">{translations.companion?.LEVEL ?? "Niveau"}: {companion.niveau}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">{translations.companion?.STATS ?? "Statistiques"}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{translations.companion?.FORCE ?? "Force"}:</span>
                      <span>{companion.force}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.companion?.ENDURANCE ?? "Endurance"}:</span>
                      <span>{companion.endurance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.companion?.AGILITE ?? "Agilité"}:</span>
                      <span>{companion.agilite}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.companion?.INTELLIGENCE ?? "Intelligence"}:</span>
                      <span>{companion.intelligence}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">{translations.companion?.PHYSICAL ?? "Caractéristiques physiques"}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{translations.companion?.TAILLE ?? "Taille"}:</span>
                      <span>{companion.taille} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.companion?.POIDS ?? "Poids"}:</span>
                      <span>{companion.poids} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.companion?.DEGAT ?? "Dégâts"}:</span>
                      <span>{companion.degat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.companion?.DEFENSE ?? "Défense"}:</span>
                      <span>{companion.defense}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">{translations.companion?.STATUS ?? "Statut"}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{translations.companion?.LOYALTY ?? "Loyauté"}:</span>
                    <span>{companion.loyauté}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{translations.companion?.HAPPINESS ?? "Bonheur"}:</span>
                    <span>{companion.bonheur}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{translations.companion?.MAINTENANCE ?? "Entretien"}:</span>
                    <span>{companion.entretien} E</span>
                  </div>
                  {companion.next_entretien && (
                    <div className="flex justify-between">
                      <span>{translations.companion?.NEXT_MAINTENANCE ?? "Prochain entretien"}:</span>
                      <span className={getMaintenanceColor(companion.next_entretien)}>
                        {new Date(companion.next_entretien).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <ButtonNeon 
                  label={translations.companion?.PAY_SALARY ?? "Payer le salaire"} 
                  onClick={handlePaySalary}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CompanionDetailPage; 