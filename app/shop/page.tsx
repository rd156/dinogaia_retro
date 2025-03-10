"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import "./page.css";
import ImageGeneriqueWithText from "@/components/pattern/ImageGeneriqueWithText";

interface Translations {
  [key: string]: any;
}

const CavePage: React.FC = () => {
  const [translations, setTranslations] = useState<Translations>({});
  const {option} = useOption();
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["shop", "item", "global"]);
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
              {translations.shop?.SHOP_CHOICE}
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
              <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>{translations.shop?.DAILY_BID}</p>
              <a href="/shop/bid" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "10px", 
                  backgroundColor: "transparent", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer", 
                  transition: "background-color 0.3s"
                }}>
                  <ImageGeneriqueWithText 
                    imageType="bouton"
                    imageName="bid"
                    defaultType="bouton"
                    defaultName="default"
                    width={250}
                    height={250}
                    alt="Bid"
                  />
                </button>
              </a>
            </div>
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
              <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>{translations.shop?.SHOP_HDV}</p>
              <a href="/shop/hdv" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "10px", 
                  backgroundColor: "transparent", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer", 
                  transition: "background-color 0.3s"
                }}>
                  <ImageGeneriqueWithText 
                    imageType="bouton"
                    imageName="hdv"
                    defaultType="bouton"
                    defaultName="default"
                    width={250}
                    height={250}
                    alt="HDV"
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

export default CavePage;
