"use client"

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate} from '@/utils/translate';
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {API_URL} from '@/config/config';
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";

interface Translations {
  [key: string]: any;
}
interface Bug {
  id: number;
  reference: string;
  username: string;
  account: string;
  status: string;
  title: string;
  answer: string;
  content: string;
}
interface Recompense {
  emeraud: number;
  luck: number;
  items: [];
}

const DinoPage: React.FC = () => {
  const params = useParams();
  const [bugId, setBugId] = useState(params?.id);
  const [bug, setBug] = useState<Bug | null>(null);
  const [recompense, setRecompense] = useState<Recompense | null>(null);
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [response, setResponse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["bug", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {  
        const response = await fetch(`${API_URL}/bug/get/${bugId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          }
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
          setRecompense(null);
          const tmp = JSON.parse(result.recompense)
          if (tmp)
          {
            setRecompense(tmp);
          }
        }
      } catch (error) {   
      }
    };

    fetchData();
  }, [bugId, translations]);

  const collectClick = async (id_bug: number) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    if (dinoId)
    {
      try {
  
        const response = await fetch(`${API_URL}/bug/get_recompense/${id_bug}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token, // Ajoute le token JWT dans l'en-tête Authorization
          },
          body: JSON.stringify({
            "dino_id": dinoId
          }),
        });
    
        if (!response.ok) {
          setErrorMessage(translations.bug?.ERR_COLLECT);
        }
    
        const result = await response.json();
        console.log(result)
        if (result)
        {
          setBug(result)
          setResponse(result.answer)
          setRecompense(null);
          const tmp = JSON.parse(result.recompense)
          if (tmp)
          {
            setRecompense(tmp);
          }
        }
    
      } catch (error) {
        setErrorMessage(translations.bug?.ERR_COLLECT);
      }
    }
  };

  const hasReward = (recompense: any) => {
    if (!recompense) return false;
  
    let tmp;
    try {
      tmp = typeof recompense === "string" ? JSON.parse(recompense) : recompense;
    } catch (error) {
      console.error("Invalid JSON format for recompense:", error);
      return false;
    }
  
    return (
      tmp && (
        (tmp.items && typeof tmp.items === "object" && Object.keys(tmp.items).length > 0) || 
        tmp.emeraud || 
        tmp.luck
      )
    );
  };
  return (
    <div className="content">
      <div className='content_top'>
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          <h2 className="text-2xl font-bold mb-4">{bug && translations.bug?.USER_BUG_ID.replace("[Number]", bug.id)}</h2>
          <p className="text-gray-600"><strong>{translations.bug?.USER_BUG_REFERENCE}</strong> {bug && bug.reference}</p>
          {bug && (
            <p className="text-gray-600"><strong>Username :</strong> {bug.username} ({bug.account})</p>
          )}
          <p className="text-gray-600"><strong>{translations.bug?.USER_BUG_STATUS}</strong> 
            <span className={`ml-2 px-2 py-1 rounded ${
              bug && bug.status === "OPEN" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            }`}>
              {bug && bug.status}
            </span>
          </p>

          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">{translations.bug?.USER_BUG_TITLE}</h3>
            <p className="text-gray-700">{bug && bug.title}</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">{translations.bug?.USER_BUG_CONTENT}</h3>
            <p className="text-gray-700 whitespace-pre-line">{bug && bug.content || translations.bug?.USER_BUG_NONE_CONTENT}</p>
          </div>

          {bug && bug.answer && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-100">
              <h3 className="text-lg font-semibold">{translations.bug?.USER_BUG_ANSWER}</h3>
              <p className="text-gray-700 whitespace-pre-line">{bug && bug.answer}</p>
            </div>
          )}

          <div className="mt-4 p-4 border rounded-lg bg-yellow-100">
            <h3 className="text-lg font-semibold">{translations.bug?.USER_BUG_REWARD}</h3>
            <p className="text-gray-700"><strong>{translations.bug?.USER_BUG_EMERAUD}</strong>{recompense && recompense.emeraud || translations.bug?.USER_BUG_NONE}</p>
            <p className="text-gray-700"><strong>{translations.bug?.USER_BUG_LUCK}</strong>{recompense && recompense.luck || translations.bug?.USER_BUG_NONE}</p>
            
            {recompense && recompense.items && Object.keys(recompense.items).length > 0 ? (
              <table className="w-full mt-2 border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">{translations.bug?.USER_BUG_ITEM}</th>
                    <th className="border px-4 py-2">{translations.bug?.USER_BUG_QUANTITE}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(recompense.items).map(([item, quantity]) => (
                    <tr key={item}>
                      <td className="border px-4 py-2">{item}</td>
                      <td className="border px-4 py-2">{quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">{translations.bug?.USER_BUG_NO_ITEM}</p>
            )}
            <br />
            {hasReward(recompense) && bug && bug.status === "CLOSE" && (
              <ButtonFancy onClick={() => collectClick(bug.id)} label={translations.bug?.COLLECT} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default DinoPage;
