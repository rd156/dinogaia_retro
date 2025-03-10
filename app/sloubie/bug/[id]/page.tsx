"use client"

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate} from '@/utils/translate';
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {API_URL} from '@/config/config';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";
import "./page.css";

interface Translations {
  [key: string]: any;
}

interface Bug {
  [key: string]: any;
}

interface Recompense {
  [key: string]: any;
}

const DinoPage: React.FC = () => {
  const params = useParams();
  const [bugId, setBugId] = useState(params?.id);
  const [accountId, setAccountId] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [bug, setBug] = useState<Bug>({});
  const [recompense, setRecompense] = useState<Recompense>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageAnswer, setErrorMessageAnswer] = useState("");
  const [errorMessageGift, setErrorMessageGift] = useState("");
  
  const [messageAnswer, setMessageAnswer] = useState("");
  const [messageGift, setMessageGift] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [response, setResponse] = useState("");
  const [giftType, setGiftType] = useState("items");
  const [giftName, setGiftName] = useState("");
  const [giftQuantity, setGiftQuantity] = useState(1);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["dino", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const reloadClick = async () => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/sloubie/bug/${bugId}/get_status`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "password": inputValue
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_SALARY_JOB);
      }
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBug(result)
        setResponse(result.answer)
        setRecompense({});
        const tmp = JSON.parse(result.recompense)
        if (tmp)
        {
          setRecompense(tmp);
        }
      }
    } catch (error) {
    }
  };

  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      setErrorMessageAnswer("La réponse ne peut pas être vide.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const responseData = await fetch(`${API_URL}/sloubie/bug/${bugId}/add_answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "password": inputValue,
          "answer": response
        }),
      });

      if (!responseData.ok) {
        setErrorMessageAnswer("Une erreur est survenue lors de l'envoi de la réponse.");
      } else {
        const result = await responseData.json();
        setBug(result)
        setMessageAnswer("Réponse envoyée avec succès !");
      }
    } catch (error) {
      setErrorMessageAnswer("Une erreur est survenue. Essayez à nouveau.");
    }
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!giftName.trim() || giftQuantity <= 0) {
      setErrorMessageGift("Le nom de l'objet et la quantité doivent être valides.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const giftData = await fetch(`${API_URL}/sloubie/bug/${bugId}/add_gift`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "password": inputValue,
          "giftType": giftType,
          "name": giftName,
          "quantity": giftQuantity,
        }),
      });

      if (!giftData.ok) {
        setErrorMessageGift("Une erreur est survenue lors de l'envoi du cadeau.");
      } else {
        const result = await giftData.json();
        setBug(result)
        const tmp = JSON.parse(result.recompense)
        if (tmp)
        {
          setRecompense(tmp);
        }
        setMessageGift("Cadeau envoyé avec succès !");
      }
    } catch (error) {
      setErrorMessageGift("Une erreur est survenue. Essayez à nouveau.");
    }
  };

  const changeStatusClick = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/sloubie/bug/${id}/change_status`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "password": inputValue,
          "status" : status
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_SALARY_JOB);
      }
      const result = await response.json();
      if (result)
      {
        setBug(result)   
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  const changeAccountClick = async () => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/sloubie/bug/${bugId}/change_account`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "password": inputValue,
          "account_id": accountId
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.bug?.ERR_CHANGE_ACCOUNT);
      }
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBug(result)
        setResponse(result.answer)
        setRecompense({});
        const tmp = JSON.parse(result.recompense)
        if (tmp)
        {
          setRecompense(tmp);
        }
      }
    } catch (error) {
    }
  };

  return (
    <div className="content">
      <div className='content_top'>
        <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
          <input
            type="text"
            value={bugId}
            onChange={(e) => setBugId(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="id"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="password"
          />
          <ButtonFancy onClick={reloadClick} label="Reload" />
        </div>
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          {bug.status === "CLOSE" && (
            <ButtonFancy onClick={() => changeStatusClick(bug.id, "OPEN")} label="Open" />
          )}
          {(bug.status === "OPEN" || bug.status === "NEW") && (
            <ButtonNeon onClick={() => changeStatusClick(bug.id, "CLOSE")} label="Close" />
          )}
          <h2 className="text-2xl font-bold mb-4">Bug #{bug.id}</h2>

          <p className="text-gray-600"><strong>Référence :</strong> {bug.reference}</p>
          <p className="text-gray-600"><strong>Date :</strong> {bug.created_at}</p>
          {bug.username && (
            <p className="text-gray-600"><strong>Username :</strong> {bug.username} ({bug.account})</p>
          )}
          <p className="text-gray-600"><strong>Statut :</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${
              bug.status === "OPEN" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            }`}>
              {bug.status}
            </span>
          </p>

          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">Titre :</h3>
            <p className="text-gray-700">{bug.title}</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">Contenu :</h3>
            <p className="text-gray-700 whitespace-pre-line">{bug.content || "Aucun contenu."}</p>
          </div>

          {bug.answer && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-100">
              <h3 className="text-lg font-semibold">Réponse :</h3>
              <p className="text-gray-700 whitespace-pre-line">{bug.answer}</p>
            </div>
          )}

          <div className="mt-4 p-4 border rounded-lg bg-yellow-100">
            <h3 className="text-lg font-semibold">Récompense :</h3>
            <p className="text-gray-700"><strong>Emeraud : </strong>{recompense.emeraud || "Aucune"}</p>
            
            {recompense && recompense.items && Object.keys(recompense.items).length > 0 ? (
              <table className="w-full mt-2 border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Item</th>
                    <th className="border px-4 py-2">Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(recompense.items).map(([item, quantity]) => (
                    <tr key={item}>
                      <td className="border px-4 py-2">{item}</td>
                      <td className="border px-4 py-2">{quantity as number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">Aucun item associé à la récompense.</p>
            )}
          </div>
          <div className="mt-6 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">Ajouter une réponse :</h3>
            {errorMessageAnswer && <p className="text-red-500">{errorMessageAnswer}</p>}
            {messageAnswer && <p className="text-green-500">{messageAnswer}</p>}
            <form onSubmit={handleSubmitResponse}>
              <textarea
                value={response}
                onChange={handleResponseChange}
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder={"Écrivez votre réponse ici..."}
              />
              <div className="mt-2">
                <button type="submit" className="button">Envoyer la réponse</button>
              </div>
            </form>
          </div>
          <div className="mt-6 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">Ajouter un cadeau :</h3>
            {errorMessageGift && <p className="text-red-500">{errorMessageGift}</p>}
            {messageGift && <p className="text-green-500">{messageGift}</p>}
            <form onSubmit={handleGiftSubmit}>
              <select
                value={giftType}
                onChange={(e) => setGiftType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="items">Items</option>
                <option value="emeraud">Emeraud</option>
                <option value="luck">Luck</option>
              </select>

              <input
                type="text"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Nom de l'objet"
              />
              <input
                type="number"
                value={giftQuantity}
                onChange={(e) => setGiftQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Quantité"
                min="1"
              />

              <div className="mt-2">
                <button type="submit" className="button">Envoyer le cadeau</button>
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(parseInt(e.target.value))}
              className="flex-1 p-2 border rounded-md"
              placeholder="id"
            />
            <ButtonFancy onClick={changeAccountClick} label="Affecter" />
          </div>
        </div>
      </div>
    </div>
  );

};

export default DinoPage;
