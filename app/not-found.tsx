"use client";

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import Image from 'next/image';
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

interface Translations {
  [key: string]: any;
}

const Custom404: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["error", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  return (
    <main className="content">
      <div className="content_top">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
          }}>
            <Image src={`/not-found.png`} alt="Error 404" 
              style={{
                maxWidth: '90%',
                height: 'auto',
                marginBottom: '20px',
              }}
            />
        </div>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
          <a href="/">
            <ButtonFancy label={translations.error?.ERROR_REDIRECT_HOME_BUTTON} />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Custom404;
