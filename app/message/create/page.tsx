"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import Link from "next/link";
import "./page.css";
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

interface Translations {
  [key: string]: any;
}

interface User {
  [key: string]: any;
}

interface Dino {
  [key: string]: any;
}

const MessageCreatePage: React.FC = () => {
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [messageAnswer, setMessageAnswer] = useState("");
  const [errorMessageAnswer, setErrorMessageAnswer] = useState("");
  const [dinoRecept, setDinoRecept] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [dinoList, setDinoList] = useState<Dino[]>([]);
  

  useEffect(() => {
    const dinoId = localStorage.getItem("dinoId");
      
    if (dinoId === null || dinoId === "")
    {
      window.location.href = "/dino"
    }
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["message", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [option?.language]);

  const handleSubmitCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dinoRecept.trim() || !title.trim() || !content.trim()) {
      setErrorMessageAnswer(translations.message?.ERROR_MANDATORY_INPUT);
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
          dinoId: dinoRecept,
          title: title,
          content: content,
        }),
      });

      if (!responseData.ok) {
        setErrorMessageAnswer(translations.message?.ERROR_CREATE_MSG);
      } else {
        const result = await responseData.json();
        console.log(result);
        setMessageAnswer(translations.message?.MSG_CREATED);
      }
    } catch (error) {
      setErrorMessageAnswer(translations.message?.ERROR_CREATE_MSG);
    }
  };

  const fetchUsers = async () => {
    if (!searchUser.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/account/get_user/${searchUser}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data.error) {
        setUserList([]);
      } else {
        setUserList(data.accounts);
      }
    } catch (error) {
      setUserList([]);
    }
  };

  const fetchDinosForUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/dino/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setDinoList(data);
    } catch (error) {
      setDinoList([]);
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
                <label htmlFor="userSearch" className="block">{translations.message?.SEARCH_USER}</label>
                <input
                  type="text"
                  id="userSearch"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  onBlur={fetchUsers}
                  className="w-full p-2 border rounded-md"
                  placeholder={translations.message?.ENTER_PSEUDO}
                />
              </div>
              <div className="mt-2">
                <label htmlFor="userSelect" className="block">{translations.message?.SELECT_USER}</label>
                <select
                  id="userSelect"
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    fetchDinosForUser(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">{translations.message?.SELECT_USER}</option>
                  {userList.length > 0 && userList.map((user) => (
                    <option key={"user_" + user.user} value={user.user}>
                      {user.pseudo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label htmlFor="dinoSelect" className="block">{translations.message?.CHOSE_DINO}</label>
                <select
                  id="dinoSelect"
                  value={dinoRecept}
                  onChange={(e) => setDinoRecept(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">{translations.message?.SELECT_DINO}</option>
                  {selectedUser && dinoList.length > 0 && dinoList.map((dino) => (
                    <option key={"dino_" + dino.id} value={dino.id}>
                      {dino.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label htmlFor="title" className="block">{translations.message?.TITLE}</label>
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
                <label htmlFor="content" className="block">{translations.message?.CONTENT}</label>
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
                <ButtonFancy label={translations.message?.FORM_BUTTON_CREATE_MESSAGE} />
              </div>
              <br />
              <div className="buttons">
                <Link href="/message" passHref>
                  <ButtonNeon label={translations.message?.BACK_MSG_LIST} />
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
};

export default MessageCreatePage;
