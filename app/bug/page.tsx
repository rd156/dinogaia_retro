"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from 'next/link';
import ButtonNeon from "@/components/pattern/ButtonNeon";

const CavePage: React.FC = () => {
  const [bug, setBug] = useState<any[]>([]);
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Charger les traductions
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
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/bug`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const fetchedData = await response.json();
        console.log(fetchedData)
        setBug(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <main className="content">
      <div className="content_top">
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        <div className="block_white">
          <Link
            href={'/bug/create'}
            passHref
          >
            <div style={{padding: '25px', flexDirection: 'column', textAlign: 'center', color: 'black'}}>
              <ButtonNeon label={translations.bug?.CREATE_BUG} />
            </div>
          </Link>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>{translations.bug?.REFERENCE}</th>
                <th style={{ padding: "10px" }}>{translations.bug?.TITLE}</th>
                <th style={{ padding: "10px" }}>{translations.bug?.STATUS}</th>
                <th style={{ padding: "10px" }}>{translations.bug?.CONTENT}</th>
                <th style={{ padding: "10px" }}>{translations.bug?.REWARD}</th>
              </tr>
            </thead>
            <tbody>
              {bug.map((entry) => (
                <tr
                  key={entry.id}
                  style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
                  onClick={() => (window.location.href = `/bug/${entry.id}`)}
                >
                  <td style={{ padding: "10px" }}>{entry.reference}</td>
                  <td style={{ padding: "10px" }}>{entry.title}</td>
                  <td style={{ padding: "10px" }}>{entry.status}</td>
                  <td style={{ padding: "10px" }}>
                    {entry.content.length > 100 ? entry.content.substring(0, 100) + "..." : entry.content}
                  </td>
                  <td style={{ padding: "10px", color: 
                    entry.status === "CLOSE"
                      ? hasReward(entry.recompense) 
                        ? "green"
                        : "red"
                      : "red"
                  }}>
                    {entry.status === "CLOSE"
                      ? hasReward(entry.recompense) 
                        ? translations.bug?.HAVE_REWARD
                        : translations.bug?.NO_REWARD
                      : translations.bug?.HAVE_NOT_REWARD
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default CavePage;
