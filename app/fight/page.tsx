"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const FightPage: React.FC = () => {
  const searchParams = useSearchParams();
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["fight", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h1 style={{ width: "100%", textAlign: "center", border: "2px solid red", padding: "10px", display: "inline-block", fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
              {translations.fight?.FIGHT_CHOICE}
            </h1>
          </div>

          <div className="blocks_container" style={{ display: "flex", justifyContent: "space-between", padding: "20px", height: "50vh"}}>
            <div className="left_block" style={{ 
              width: "45%", 
              border: "2px solid gold", 
              padding: "20px", 
              textAlign: "center",
              borderRadius: "10px", 
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease-in-out",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>{translations.fight?.MENU_CLASSIC_FIGHT}</p>
              <a href="/fight/classic" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "10px", 
                  backgroundColor: "transparent", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer", 
                  transition: "background-color 0.3s"
                }}>
                  <img 
                    src="/bouton/fight_classic.webp"
                    alt={translations.fight?.MENU_CLASSIC_FIGHT}
                    style={{
                      width: "250px",        
                      height: "250px",       
                      objectFit: "contain"  
                    }} 
                  />
                </button>
              </a>
            </div>
            <div className="center_block" style={{ 
              width: "45%", 
              border: "2px solid gold", 
              padding: "20px", 
              textAlign: "center",
              borderRadius: "10px", 
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease-in-out",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>{translations.fight?.MENU_FAST_FIGHT}</p>
              <a href="/fight/fast" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "10px", 
                  backgroundColor: "transparent", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer", 
                  transition: "background-color 0.3s"
                }}>
                  <img 
                    src="/bouton/fight_fast.webp"
                    alt={translations.fight?.MENU_FAST_FIGHT}
                    style={{
                      width: "250px",        
                      height: "250px",       
                      objectFit: "contain"  
                    }} 
                  />
                </button>
              </a>
            </div>
            <div className="right_block" style={{ 
              width: "45%", 
              border: "2px solid gold", 
              padding: "20px", 
              textAlign: "center",
              borderRadius: "10px", 
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease-in-out",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>{translations.fight?.MENU_ULTRAFAST_FIGHT}</p>
              <a href="/fight/ultrafast" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "10px", 
                  backgroundColor: "transparent", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer", 
                  transition: "background-color 0.3s"
                }}>
                  <img 
                    src="/bouton/fight_ultrafast.webp"
                    alt={translations.fight?.MENU_ULTRAFAST_FIGHT}
                    style={{
                      width: "250px",        
                      height: "250px",       
                      objectFit: "contain"  
                    }} 
                  />
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FightPage;
