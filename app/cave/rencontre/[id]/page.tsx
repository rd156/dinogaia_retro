"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { useParams, useRouter } from "next/navigation";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import Link from "next/link";
import "./page.css";

const RencontrePage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const [rencontreInfo, setRencontreInfo] = useState<any>(null);  // Pour stocker la rencontre
  const [loading, setLoading] = useState<boolean>(true);
  const [endRencontre, setEndrencontre] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["cave", "dialogue", "pnj", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      try {
        const caveResponse = await fetch(`${API_URL}/rencontre/${dinoId}/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await caveResponse.json();
        console.log(result)
        if (typeof result === "object"){
          setRencontreInfo(result);
        }
        else {
          setErrorMessage(result);
        }
      } catch (error) {
        setErrorMessage("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChoiceClick = async (choiceId: number) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {
      const response = await fetch(`${API_URL}/rencontre/${dinoId}/${rencontreInfo.id}/next_step_action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ choice_id: choiceId }),
      });
      const result = await response.json();
      console.log(result)

      if (typeof result === "object"){
        setRencontreInfo(result);
      }
      else if(result == "conversation_terminer")
      {
        setRencontreInfo(null);
        setEndrencontre(true);
        setErrorMessage("");
      }
      else {
        setErrorMessage(result);
        setRencontreInfo(null);
      }
    } catch (error) {
    }
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
        <div className="rencontre-container block_white">
          <div className="content_block_display">
            <div className="rencontre-header">
             {rencontreInfo && (
                <div>
                    <img src={"/pnj/"+ rencontreInfo.pnj.name + ".webp"} alt={"Image de " + translations.pnj?.["pnj_" + rencontreInfo.pnj.name]} className="dino-profile-image" />
                    <p className="text">{translations.pnj?.["pnj_" + rencontreInfo.pnj.name]}</p>
                </div>
              )}
            </div>
            <br />
            <br />
            <div className="rencontre-content">
              {endRencontre ? (
                <Link href="/cave">
                  <button
                    style={{
                      margin: "10px",
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: "pointer",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    {translations.cave?.CAVE_BUTTON}
                  </button>
                </Link>
              ) : (
                rencontreInfo ? (
                  <div>
                    <h2>{translations.dialogue?.["TEXT_" + rencontreInfo.current_action.name]}</h2>
                    <div>
                      {rencontreInfo.current_action.choices.map((choice: any) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceClick(choice.id)}
                          style={{
                            margin: "10px",
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                          }}
                        >
                          {translations.dialogue?.["CHOICE_" + choice.text]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>{translations.pnj?.RENCONTRE_NOT_FOUND}</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RencontrePage;

