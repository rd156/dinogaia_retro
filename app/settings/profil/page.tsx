"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import React from 'react';
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";

interface Translations {
  [key: string]: any;
}

interface Advantages {
  [key: string]: any;
}

const ProfilePage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageEmail, setMessageEmail] = useState("");
  const [messagePseudo, setMessagePseudo] = useState("");
  const [messagePassword, setMessagePassword] = useState("");
  const [messageErrorPassword, setErrorMessagePassword] = useState("");
  const { option } = useOption();
  const [translations, setTranslations] = useState<Translations>({});
  const [advantages, setAdvantages] = useState<Advantages>({});
  const [username, setUsername] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

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
      const token = localStorage.getItem("token");
      try {
        const profilResponse = await fetch(`${API_URL}/account/get_profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const profile_info = await profilResponse.json()
        if (typeof profile_info === "object"){
          setUsername(profile_info.username);
          setAdvantages(profile_info.advantages);
          setPseudo(profile_info.pseudo);
          setEmail(profile_info.email);
        }
        console.log(profile_info)

      } catch (error) {
      } finally {
      }
    };

    fetchData();
  }, []);

  const handleChangePseudo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPseudo(e.target.value);
  };

  const handleSavePseudo = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/account/change-pseudo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pseudo }),
      });

      const change_pseudo = await response.json()
      if (typeof change_pseudo === "object"){
        setMessagePseudo(translations.settings?.PSEUDO_MODIFY)
      }
      
      console.log(change_pseudo)
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSaveEmail = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/account/request-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "new_email": email
        }),
      });

      const change_pseudo = await response.json()
      setMessageEmail(translations.settings?.EMAIL_MODIFY)
      console.log(change_pseudo)
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };
  const handleChangeNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };
  const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };
  const handleChangeOldPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };
  const handleSavePassword = async () => {
    if (newPassword != confirmPassword)
    {
      setErrorMessagePassword("different_password")
      setMessagePassword("")
    }
    else if (newPassword == oldPassword)
    {
      setErrorMessagePassword("same_password")
      setMessagePassword("")
    }
    else{
      try {
        const token = localStorage.getItem("token");
  
        const response = await fetch(`${API_URL}/account/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "old_password": oldPassword,
            "new_password": newPassword,
          }),
        });
  
        const change_password = await response.json()
        if (change_password == "success")
        {
          setMessagePassword(change_password)
          setErrorMessagePassword("")
        }
        else
        {
          setErrorMessagePassword(change_password)
          setMessagePassword("")
        }
      } catch (error) {
      }
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {message && <p className="alert-green">{message}</p>}
        <div className="block_white">
          <h2>{translations.settings?.MY_PROFILE.replace("[Name]", username)}</h2>
        </div>
        <br/>
        <br/>
        <div className="block_white">
          {messagePseudo && <p className="alert-green">{messagePseudo}</p>}
          <h2>{translations.settings?.MY_PSEUDO.replace("[Number]", advantages?.change_pseudo)}</h2>
          <div className="profile_form">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="text" name="pseudo" value={pseudo} onChange={handleChangePseudo}/>
              <ButtonFancy label={translations.settings?.SAVE} onClick={handleSavePseudo} />
            </div>
          </div>
        </div>
        <br/>
        <br/>
        <div className="block_white">
          {messageEmail && <p className="alert-green">{messageEmail}</p>}
          <h2>{translations.settings?.MY_EMAIL}</h2>
          <div className="profile_form">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="text" name="email" value={email} onChange={handleChangeEmail}/>
              <ButtonFancy label={translations.settings?.SAVE} onClick={handleSaveEmail}/>
            </div>
          </div>
        </div>
        <br/>
        <br/>
        <div className="block_white">
          {messagePassword && <p className="alert-green">{translations.settings?.["CONFIRMATION_PASSWORD_" + messagePassword]}</p>}
          {messageErrorPassword && <p className="alert-red">{translations.settings?.["CONFIRMATION_PASSWORD_" + messageErrorPassword]}</p>}
          <h2>{translations.settings?.MY_PASSWORD}</h2>
          <div className="profile_form">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input 
                type="password" 
                name="oldPassword" 
                value={oldPassword} 
                onChange={handleChangeOldPassword} 
                placeholder={translations.settings?.OLD_PASSWORD}
              />
              <input 
                type="password" 
                name="newPassword" 
                value={newPassword} 
                onChange={handleChangeNewPassword} 
                placeholder={translations.settings?.NEW_PASSWORD}
              />
              <input 
                type="password" 
                name="confirmPassword" 
                value={confirmPassword} 
                onChange={handleChangeConfirmPassword} 
                placeholder={translations.settings?.CONFIRM_NEW_PASSWORD}
              />
              <ButtonFancy label={translations.settings?.SAVE} onClick={handleSavePassword}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );  
};

export default ProfilePage;
