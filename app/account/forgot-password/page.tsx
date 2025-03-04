"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import React from 'react';
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageEmail, setMessageEmail] = useState("");
  const [messagePseudo, setMessagePseudo] = useState("");
  const [messagePassword, setMessagePassword] = useState("");
  const [messageErrorPassword, setErrorMessagePassword] = useState("");
  const { option } = useOption();
  const [translations, setTranslations] = useState({});
  const [advantages, setAdvantages] = useState({});
  const [username, setUsername] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["account", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const handleChangeForgotPassword = (e) => {
    setForgotPassword(e.target.value);
  };

  const handleSaveForgotPassword = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/account/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "account": forgotPassword
        }),
      });

      const change_pseudo = await response.json()
      if (typeof change_pseudo === "object"){
        setMessagePseudo(translations.settings?.PSEUDO_MODIFY)
      }
      
      console.log(change_pseudo)
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white">
          {messagePseudo && <p className="alert-green">{messagePseudo}</p>}
          <h2>{translations.account?.FORGOT_NAME_VALUE}</h2>
          <br />
          <input type="text" name="username_email" value={forgotPassword} onChange={handleChangeForgotPassword}/>
          <br />
          <br />
          <ButtonFancy label={translations.account?.SEND_EMAIL_RECOVERY} onClick={handleSaveForgotPassword} />
        </div>
      </div>
    </main>
  );  
};

export default ProfilePage;
