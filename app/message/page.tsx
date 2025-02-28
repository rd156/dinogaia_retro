"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from 'react';
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

const MessagesPage: React.FC = () => {
  const params = useParams();
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'date' | 'sender'>('date');
  const [activeCategory, setActiveCategory] = useState("ALL");
  const categories = ["ALL", "PLAYER", "SYSTEM", "READ", "UNREAD"];

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["message", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const dinoId = localStorage.getItem("dinoId");
      
    if (dinoId === null || dinoId === "")
    {
      window.location.href = "/dino"
    }
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const dinoId = localStorage.getItem("dinoId");
        const response = await fetch(`${API_URL}/message/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(translations.message?.ERROR_LOAD_LIST_MSG);
        }

        const result = await response.json();
        setMessagesList(result);
      } catch (error) {
        setErrorMessage(translations.message?.ERROR_LOAD_LIST_MSG);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [params.id]);

  const sortMessages = (field: 'date' | 'sender') => {
    const sortedMessages = [...messagesList];
    const order = sortOrder === 'asc' ? 1 : -1;
  
    sortedMessages.sort((a, b) => {
      if (field === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return (dateA - dateB) * order;
      } else if (field === 'sender') {
        const senderA = a.sender_name && a.sender_pseudo
        ? `${a.sender_name.toLowerCase()} (${a.sender_pseudo.toLowerCase()})`
        : "";
      const senderB = b.sender_name && b.sender_pseudo
        ? `${b.sender_name.toLowerCase()} (${b.sender_pseudo.toLowerCase()})`
        : "";
        if (senderA < senderB) return -1 * order;
        if (senderA > senderB) return 1 * order;
        return 0;
      }
      return 0;
    });
  
    setMessagesList(sortedMessages);
    setSortBy(field);
    setSortOrder(order === 1 ? 'desc' : 'asc');
  };  

  const parseMessageContent = (content: any) => {
    try {
      const tmp = JSON.parse(content);
      if (tmp.content)
      {
        return tmp.content.length > 100 ? tmp.content.substring(0, 100) + "..." : tmp.content;
      }
      else{
        return content;
      }
    } catch (error) {
      return content;
    }
  };
  

  const handleCategoryToggle = (category) => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const dinoId = localStorage.getItem("dinoId");
        const response = await fetch(`${API_URL}/message/${dinoId}/categorie/`+category, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(translations.message?.ERROR_LOAD_CATEGORIE_MSG.replace("[Name]", translations.message?.['DISPLAY_CATEGORIE_'+ category]));
        }

        const result = await response.json();
        setMessagesList(result);
      } catch (error) {
        setErrorMessage(translations.message?.ERROR_LOAD_CATEGORIE_MSG.replace("[Name]", translations.message?.['DISPLAY_CATEGORIE_'+ category]));
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    setActiveCategory((prevCategory) => (prevCategory === category ? "ALL" : category));
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
            href={'/message/create'}
            passHref
          >
            <div style={{padding: '25px', flexDirection: 'column', textAlign: 'center', color: 'black'}}>
              <ButtonFancy label={translations.message?.CREATE_MESSAGE} />
            </div>
          </Link>
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  style={{
                    padding: "10px",
                    backgroundColor: activeCategory === category ? "#007BFF" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {category === "ALL" ? translations.message?.DISPLAY_CATEGORIE_ALL : translations.message?.['DISPLAY_CATEGORIE_'+ category] ?? category}
                </button>
              ))}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => sortMessages('sender')}
                >
                  {translations.message?.SENDER}
                  {sortBy === 'sender' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th style={{ padding: "10px" }}>
                  {translations.message?.TITLE}
                </th>
                <th style={{ padding: "10px" }}>{translations.message?.CONTENT}</th>
                <th
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => sortMessages('date')}
                >
                  {translations.message?.DATE}
                  {sortBy === 'date' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {messagesList.map((entry) => (
                <tr
                  key={entry.id}
                  style={{ fontWeight: entry.is_read === false ? "bold" : "normal", borderBottom: "1px solid #ddd", textAlign: "left" }}
                  onClick={() => (window.location.href = `/message/${entry.id}`)}
                >
                  <td style={{ padding: "10px", width: "20%"}}>
                    {entry?.sender_name && entry?.sender_pseudo
                    ? `${entry.sender_name} (${entry.sender_pseudo})`
                    : translations.message?.MSG_SYSTEM}
                  </td>
                  <td style={{ padding: "10px", width: "20%" }}>{entry.title ? `${entry.title}` : ""}</td>
                  <td style={{ padding: "10px" }}> {parseMessageContent(entry.content)}
                  </td>
                  <td style={{ padding: "10px", width: "10%" }}>{formatDate(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;

