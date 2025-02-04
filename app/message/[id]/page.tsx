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

const MessageDetailPage: React.FC = () => {
  const params = useParams();
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<any>({});
  const [messageAnswer, setMessageAnswer] = useState("");
  const [errorMessageAnswer, setErrorMessageAnswer] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["message", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const fetchMessageDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const dinoId = localStorage.getItem("dinoId");
        const response = await fetch(`${API_URL}/message/${dinoId}/read_one`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "id": params.id
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement du message");
        }

        const result = await response.json();
        console.log(result)
        setMessage(result);
      } catch (error) {
        setErrorMessage(translations.message?.ERROR_LOAD_MSG);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMessageDetail();
    }
  }, [params.id]);

  if (errorMessage) {
    return <p className="alert-red">{errorMessage}</p>;
  }

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(response)
    if (!response.trim()) {
      setErrorMessageAnswer(translations.message?.ERROR_MANDATORY_ANSWER);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const responseData = await fetch(`${API_URL}/message/${dinoId}/add_answer/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "answer": response
        }),
      });

      if (!responseData.ok) {
        setErrorMessageAnswer(translations.message?.ERROR_CREATE_ANSWER);
      } else {
        const result = await responseData.json();
        console.log(result)
        setMessageAnswer(translations.message?.CREATE_ANSWER_DONE);
      }
    } catch (error) {
      setErrorMessageAnswer(translations.message?.ERROR_CREATE_ANSWER);
    }
  };
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
  };

  const parseMessageContent = (content: any): string => {
    try {
      const tmp = JSON.parse(content);
      return tmp?.content || content;
    } catch (error) {
    }
  };
  
  return (
    <main className="content">
      <div className="content_top">
        <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-md block_white">
          <h2><strong>{translations.message?.TITLE}: </strong> {message?.title || translations.message?.NO_TITLE}</h2>
          <br />
          <p>
            <strong>{translations.message?.SENDER}: </strong>
            {message?.sender_name && message?.sender_pseudo
              ? `${message.sender_name} (${message.sender_pseudo})`
              : translations.message?.MSG_SYSTEM}
          </p>
          <br />
          <p><strong>{translations.message?.DATE}:</strong> {formatDate(message?.created_at)}</p>
          <br />
          <hr />
          <br />
          <p>{parseMessageContent(message?.content)}</p>
          <br />
          <div className="buttons">
            <Link href="/message" passHref>
              <ButtonNeon label={translations.message?.BACK_MSG_LIST} />
            </Link>
          </div>
          { message?.sender_name && message?.sender_pseudo && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-100">
              <h3 className="text-lg font-semibold">{translations.message?.ADD_ANSWER}</h3>
              {errorMessageAnswer && <p className="text-red-500">{errorMessageAnswer}</p>}
              {messageAnswer && <p className="text-green-500">{messageAnswer}</p>}
              <form onSubmit={handleSubmitResponse}>
                <textarea
                  value={response}
                  onChange={handleResponseChange}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder={"Écrivez votre réponse ici..."}
                />
                <div className="mt-2">
                  <ButtonFancy type="submit" label={translations.message?.FORM_BUTTON_ANSWER} />
                </div>
              </form>
            </div>
            )}
        </div>
      </div>
    </main>
  );
};

export default MessageDetailPage;
