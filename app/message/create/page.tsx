"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const MessageCreatePage: React.FC = () => {
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<any>({});
  const [messageAnswer, setMessageAnswer] = useState("");
  const [errorMessageAnswer, setErrorMessageAnswer] = useState("");
  const [dinoRecept, setDinoRecept] = useState("");   // Champ dino
  const [title, setTitle] = useState("");  // Champ titre
  const [content, setContent] = useState(""); // Champ contenu

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["message", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const handleSubmitCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs
    if (!dinoRecept.trim() || !title.trim() || !content.trim()) {
      setErrorMessage("Tous les champs sont requis.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const responseData = await fetch(`${API_URL}/message/${dinoId}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dinoId: dinoId,
          title: title,
          content: content,
        }),
      });

      if (!responseData.ok) {
        setErrorMessage("Une erreur est survenue lors de la création du message.");
      } else {
        const result = await responseData.json();
        console.log(result);
        setMessageAnswer("Message créé avec succès !");
      }
    } catch (error) {
      setErrorMessageAnswer("Une erreur est survenue. Essayez à nouveau.");
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          <div className="mt-6 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">{translations.message?.CREATE_MESSAGE}</h3>
            <br />
            {errorMessageAnswer && <p className="text-red-500">{errorMessageAnswer}</p>}
            {messageAnswer && <p className="text-green-500">{messageAnswer}</p>}
            <br />
            <form onSubmit={handleSubmitCreateMessage}>
              <div>
                <label htmlFor="dino" className="block">Dino ID</label>
                <input
                  type="text"
                  id="dino"
                  value={dinoRecept}
                  onChange={(e) => setDinoRecept(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="title" className="block">Titre</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="content" className="block">Contenu</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  required
                />
              </div>
              <div className="mt-6">
                <ButtonFancy type="submit" label={translations.message?.FORM_BUTTON_CREATE_MESSAGE} />
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
};

export default MessageCreatePage;
