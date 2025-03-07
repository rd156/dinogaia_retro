"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { useParams, useRouter } from "next/navigation";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import Link from "next/link";
import "./page.css";

interface Translations {
  [key: string]: any;
}

const RencontrePage: React.FC = () => {
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["settings", "global"]);
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
      try {
        const caveResponse = await fetch(`${API_URL}/account/verify-email/${params.security}/${params.token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await caveResponse.json();
        setMessage(result);
        console.log(result)
      } catch (error) {
        
      }
    };

    fetchData();
  }, []);

  return (
    <main className="content">
      <div className="content_top">
        <div className="block_white">
          {translations.settings?.["CONFIRMATION_MAIL_" + message]}
          <br />
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
              {translations.settings?.GAME_RETURN}
              </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default RencontrePage;

