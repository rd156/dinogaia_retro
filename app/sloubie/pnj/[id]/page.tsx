"use client";

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate} from '@/utils/translate';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL } from '@/config/config';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";

const PnjPage: React.FC = () => {
  const params = useParams();
  const [pnjId, setPnjId] = useState(params?.id);
  const [password, setPassword] = useState("");
  const [pnjData, setPnjData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const {option} = useOption();
  const [translations, setTranslations] = useState<any>({});

  const SPECIES_OPTIONS = [
    { value: "TR", label: "T-Rex" },
    { value: "VE", label: "Velociraptor" },
    { value: "DP", label: "Dilophosaure" },
    { value: "SM", label: "Smilodon" },
    { value: "PT", label: "Pterodactyle" },
    { value: "MG", label: "Megalodon" },
  ];
  
  const TYPE_OPTIONS = [
    { value: "SELLER", label: "Vendeur" },
    { value: "BOSS", label: "Boss" },
    { value: "OTHER", label: "Autre" },
  ];

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["pnj", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const fetchPnjData = async () => {
    if (!pnjId || !password) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/pnj/${pnjId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        setErrorMessage(translations?.error || "Erreur lors de la récupération du PNJ.");
        return;
      }

      const result = await response.json();
      console.log(result)
      setPnjData(result);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Une erreur est survenue.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/sloubie/pnj/${pnjId}/create_or_update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
          pnj: pnjData,
        }),
      });

      if (!response.ok) {
        setErrorMessage("Une erreur est survenue lors de la mise à jour ou création du PNJ.");
        setLoading(false);
        return;
      }

      const result = await response.json();
      setSuccessMessage("PNJ mis à jour/créé avec succès !");
      setPnjData(result);
      setLoading(false);
      console.log(result)
    } catch (error) {
      setErrorMessage("Une erreur est survenue. Essayez à nouveau.");
      setLoading(false);
    }
  };

  const handlePnjDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPnjData((prevData: any) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="content">
      <div className='content_top'>
        <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
          <input
            type="text"
            value={pnjId}
            onChange={(e) => setPnjId(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="ID du PNJ"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="Mot de passe"
          />
          <ButtonFancy onClick={fetchPnjData} label="Charger le PNJ" />
        </div>

        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">{pnjId ? `PNJ ${pnjId}` : "Créer un PNJ"}</h2>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {successMessage && <p className="text-green-500">{successMessage}</p>}
              
              <form onSubmit={handleSubmit}>
                <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                  <h3 className="text-lg font-semibold">Nom :</h3>
                  <input
                    type="text"
                    name="name"
                    value={pnjData.name || ''}
                    onChange={handlePnjDataChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Nom du PNJ"
                  />
                </div>

                <div className="mt-4">
                  <label>Espèce :</label>
                  <select name="species" value={pnjData.species} onChange={handlePnjDataChange} className="w-full p-2 border rounded-md">
                    {SPECIES_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="mt-4">
                  <label>Type :</label>
                  <select name="type" value={pnjData.type} onChange={handlePnjDataChange} className="w-full p-2 border rounded-md">
                    {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                  <h3 className="text-lg font-semibold">Avatar :</h3>
                  <input
                    type="text"
                    name="avatar"
                    value={pnjData.avatar || ''}
                    onChange={handlePnjDataChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Avatar"
                  />
                </div>

                {["level", "pv", "pm", "pv_max", "pm_max", "force", "endurance", "agilite", "intelligence", "taille", "poids", "fatigue", "emeraude", "luck"].map(field => (
                  <div key={field} className="mt-4">
                    <label>{field} :</label>
                    <input type="number" name={field} value={pnjData[field]} onChange={handlePnjDataChange} className="w-full p-2 border rounded-md" />
                  </div>
                ))}

                <div className="mt-4 p-4">
                  <ButtonFancy onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)} label="Sauvegarder le PNJ" />
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PnjPage;
