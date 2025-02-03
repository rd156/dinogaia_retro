"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const HomePage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [bugs, setBugs] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("ALL");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["account", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const reloadClick = async () => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/sloubie/bug`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "password": inputValue,
          "status": selectedOption
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_SALARY_JOB);
      }
      const result = await response.json();
      console.log(result)
      if (result)
      {
        setBugs(result)
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const changeStatusClick = async (id, status) => {
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
      console.log("edit")
      console.log(result)
      if (result)
      {
        setBugs((prevBugs) =>
          prevBugs.map((bug) =>
            bug.id === id ? { ...bug, status: result.status } : bug
          )
        );        
      }
    } catch (error) {
      setErrorMessage("reloas error");
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white center">
          <div style={{ margin: "50px" }}>
            <h1
              style={{
                border: "2px solid red",
                padding: "10px",
                display: "inline-block",
              }}
            >
              Gestion
            </h1>
          </div>
          <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-2 border rounded-md"
              placeholder="Tapez ici..."
            />
              <select
                value={selectedOption}
                onChange={handleSelectChange}
                className="p-2 border rounded-md"
              >
                <option value="ALL">ALL</option>
                <option value="NEW">NEW</option>
                <option value="OPEN">OPEN</option>
                <option value="CLOSE">CLOSE</option>
              </select>
            <ButtonFancy onClick={() => reloadClick()} label="Reload" />
          </div>
          <div style={{ marginTop: "30px" }}>
            {/* Ajout d'un conteneur avec max-height et overflow */}
            <div
              style={{
                maxHeight: "400px",    // Limiter la hauteur du conteneur
                overflowY: "auto",     // Ajouter une barre de défilement verticale
                border: "1px solid #ddd",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Id du ticket</th>
                    <th style={{ padding: "10px" }}>Reference</th>
                    <th style={{ padding: "10px" }}>Date</th>
                    <th style={{ padding: "10px" }}>Proprietaire (id)</th>
                    <th style={{ padding: "10px" }}>Titre</th>
                    <th style={{ padding: "10px" }}>Contenue</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.map((entry) => (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      <td style={{ padding: "10px" }}>{entry.id}</td>
                      <td style={{ padding: "10px" }}>{entry.reference}</td>
                      <td style={{ padding: "10px" }}>{entry.created_at}</td>
                      <td style={{ padding: "10px" }}>
                        {entry.username} ({entry.account})
                      </td>
                      <td style={{ padding: "10px" }}>{entry.titre}</td>
                      <td style={{ padding: "10px" }}>{entry.content.length > 50 ? entry.content.slice(0, 50) + "..." : entry.content}</td>
                      <td style={{ padding: "10px" }}>{entry.status}</td>
                      <td style={{ padding: "10px" }}>
                        <div className="flex items-center gap-2">
                          {entry.status === "CLOSE" ? (
                            <ButtonFancy onClick={() => changeStatusClick(entry.id, "OPEN")} label="Open" />
                          ) : (
                            <ButtonNeon onClick={() => changeStatusClick(entry.id, "CLOSE")} label="Close" />
                          )}
                          
                          <Link href={`/sloubie/bug/${entry.id}`}>
                            <ButtonFancy label="Edit" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
