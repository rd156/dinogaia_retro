"use client";

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_URL } from "@/config/config";
import "./page.css";
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const HomePage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [isConnect, setIsConnect] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsConnect(true);
      window.location.href = "/dino"
    } else {
      setIsConnect(false);
      localStorage.removeItem('token');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setErrorMessage(translations.account?.ERR_SAME_PASSWORD);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/account/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "username": username,
          "email": email,
          "password": password
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || translations.account?.ERR_UNKNOWN);
      }
      const created = await response.json()
      if (typeof created === "object" && created !== null)
      {
        setMessage(translations.account?.REGISTER_DONE);
        setErrorMessage("");
      }
      else if (created == "already_register") {
        setMessage("");
        setErrorMessage(translations.account?.ERR_ALREADY_ISSET);
      }
      else{
        setErrorMessage(created);
      }
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setErrorMessage(err.message);
    }
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
        <div className="block_white center">
        <h1 style={{border: "2px solid red", padding: "10px", display: "inline-block" }}>{translations.account?.REGISTER}</h1>
          <div style={{ maxWidth: "50vh", margin: "0 auto", padding: "20px" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="username">{translations.account?.USERNAME}</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="email">{translations.account?.EMAIL}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="password">{translations.account?.PASSWORD}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label htmlFor="confirmPassword">{translations.account?.PASSWORD_CONFIRM}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px" }}
                />
              </div>
              <ButtonFancy label={translations.account?.REGISTER_BUTTON}/>
            </form>
            <br />
            <Link
              href={'/account/forgot-password'}
              passHref
            >
              {translations.account?.FORGOT_PASSWORD}
            </Link>          
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
