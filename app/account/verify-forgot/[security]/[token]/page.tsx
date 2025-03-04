"use client";

import { useEffect, useState } from "react";
import { useOption } from "@/context/OptionsContext";
import { useParams, useRouter } from "next/navigation";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";

const RencontrePage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const [rencontreInfo, setRencontreInfo] = useState<any>(null);  // Pour stocker la rencontre
  const [change, setChange] = useState<boolean>(true);
  const [endRencontre, setEndrencontre] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [messageEmail, setMessageEmail] = useState("");
  const [messagePseudo, setMessagePseudo] = useState("");
  const [messagePassword, setMessagePassword] = useState("");
  const [messageErrorPassword, setErrorMessagePassword] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["account", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  const handleChangeNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };
  const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };
  const handleSavePassword = async () => {
    if (newPassword != confirmPassword)
    {
      setErrorMessagePassword("different_password")
      setMessagePassword("")
    }
    else{
      try {
        const token = localStorage.getItem("token");
  
        const response = await fetch(`${API_URL}/account/verify-forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            "security": params.security,
            "token": params.token,
            "password": newPassword,
          }),
        });
  
        const change_password = await response.json()
        console.log(change_password)
        if (change_password == "success")
        {
          setMessagePassword(change_password)
          setErrorMessagePassword("")
          setChange(false)
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
        <div className="block_white">
          {messagePassword && <p className="alert-green">{translations.account?.["CONFIRMATION_PASSWORD_" + messagePassword]}</p>}
          {messageErrorPassword && <p className="alert-red">{translations.account?.["CONFIRMATION_PASSWORD_" + messageErrorPassword]}</p>}
          <br />
          <div className="profile_form">
            {change ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={newPassword} 
                  onChange={handleChangeNewPassword} 
                  placeholder={translations.account?.NEW_PASSWORD}
                />
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={confirmPassword} 
                  onChange={handleChangeConfirmPassword} 
                  placeholder={translations.account?.CONFIRM_NEW_PASSWORD}
                />
                <ButtonFancy label={translations.account?.SAVE} onClick={handleSavePassword}/>
              </div>
            ):(
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/">
                <ButtonFancy label={translations.account?.GO_HOME}/>
              </Link>
            </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RencontrePage;

