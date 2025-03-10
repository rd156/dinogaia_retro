"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const MessagesPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const actionClick = async (action: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/sloubie/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({password: inputValue}),
      });  
      const result = await response.json();
      console.log(result);
    } catch (error) {
    } finally {
    }
  };  

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white center">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div style={{ margin: "50px" }}>
              <h1
                style={{
                  border: "2px solid red",
                  display: "inline-block",
                }}
              >
                Gestion Import
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
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => actionClick("debug/storage")} label="Debug Storage" />
            </div>
            <div className="flex items-center gap-2 p-4 border rounded-lg shadow-md max-w-md">
              <ButtonFancy onClick={() => actionClick("debug/job")} label="Debug Job Name" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;
