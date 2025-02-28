"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loadtranslate } from "@/utils/translate";
import Link from "next/link";
import "./page.css";
import { API_URL } from "@/config/config";
import ButtonFancy from "@/components/pattern/ButtonFancy";

const CombatListPage: React.FC = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [combatsTermines, setCombatsTermines] = useState<any[]>([]);
  const [combatsStart, setCombatsStart] = useState<any[]>([]);
  const [combatsWaiting, setCombatsWaiting] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");

  const [searchAccount, setSearchAccount] = useState<string>("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [dinos, setDinos] = useState<any[]>([]);
  const [selectedDino, setSelectedDino] = useState<number | null>(null);
  const [dinoOnline, setDinoOnline] = useState<any[]>([]);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ["fight", "global"]);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchCombats = async () => {
      try {
        const response = await fetch(`${API_URL}/dino/online`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        setDinoOnline(data);
        console.log(data)
      } catch (error) {
      }
    };

    fetchCombats();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    const fetchCombats = async () => {
      try {
        const response = await fetch(`${API_URL}/fight/fast/list/${dinoId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(translations.fight?.ERROR_LOAD_FIGHT);
        
        const data = await response.json();
        setCombatsWaiting(data.waiting || []);
        setCombatsStart(data.combats_start || []);
        setCombatsTermines(data.combats_termines || []);
        console.log(data)
      } catch (error) {
        setMessage(translations.fight?.ERROR_LOAD_FIGHT);
      }
    };

    fetchCombats();
  }, []);

  const handleAccountSearch = async () => {
    if (!searchAccount.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/account/get_user/${searchAccount}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
    }
  };
  
  const handleAccountSelect = async (accountId: string) => {
    setSelectedAccount(parseInt(accountId));
    const token = localStorage.getItem("token");    
    try {
      const response = await fetch(`${API_URL}/dino/user/${accountId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error(translations.fight?.ERROR_LOAD_DINO);
      
      const data = await response.json();
      setDinos(data);
    } catch (error) {
    }
  };
  
  const handleDinoSelect = (dinoId: string) => {
    setSelectedDino(parseInt(dinoId));
  };
  const getDinoId = () => {
    return (localStorage.getItem("dinoId"))
  };
  return (
    <main className="content">
      <div className="content_top">
        <div className="combat-container">
            <div className="select-dino-container block_white">
            <h2>{translations.fight?.SELECT_DINO}</h2>
            <div className="select-row">
              <input
                type="text"
                placeholder={translations.fight?.SEARCH_ACCOUNT_FORM}
                value={searchAccount}
                onChange={(e) => setSearchAccount(e.target.value)}
                className="search-input"
              />
              <button className="btn btn-search" onClick={handleAccountSearch}>🔍</button>

              {accounts.length > 0 && (
                <select className="dropdown" onChange={(e) => handleAccountSelect(e.target.value)}>
                  <option value="">{translations.fight?.SELECT_ACCOUNT_FORM}</option>
                  {accounts.map((account) => (
                    <option key={"account" + account.user} value={account.user}>
                      {account.pseudo}
                    </option>
                  ))}
                </select>
              )}

              {dinos.length > 0 && (
                <select className="dropdown" onChange={(e) => handleDinoSelect(e.target.value)}>
                  <option value="">{translations.fight?.SELECT_DINO_FORM}</option>
                  {dinos.map((dino) => (
                    <option key={dino.id} value={dino.id}>
                      {translations.fight?.DISPLAY_DINO_FORM.replace("[Name]", dino.name).replace("[Number]", dino.level?.lvl ?? 1)}
                    </option>
                  ))}
                </select>
              )}
              {selectedDino > 0 && (
                <Link
                  href={'/fight/fast/create/'+selectedDino}
                  passHref
                >
                  <div style={{padding: '25px', flexDirection: 'column', textAlign: 'center', color: 'black'}}>
                    <ButtonFancy label={translations.fight?.CREATE_FIGHT} />
                  </div>
                </Link>
              )}
            </div>
            <h2>{translations.fight?.RECENTLY_ONLINE}</h2>
            <div className="grid grid-cols-5 gap-4 p-4 justify-center">
              {dinoOnline && dinoOnline.map((dino, index) => (
                <Link key={index} href={`/fight/classic/create/${dino.id}`} passHref>
                  <div className="text-black">
                    <ButtonFancy label={translations.fight?.DISPLAY_DINO_FORM.replace("[Name]", dino.name).replace("[Number]", dino.level.lvl)} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h1 className="title block_white">{translations.fight?.FIGHT_FAST_LIST_TITLE}</h1>
          </div>
          <div className="combat-grid">
            <div className="combat-card waiting block_white">
              <h2>{translations.fight?.FIGHT_WAITING_TITLE}</h2>
              {combatsWaiting.length > 0 ? (
                <table className="combat-table">
                  <thead>
                    <tr>
                      <th>{translations.fight?.TABLE_AGAIN}</th>
                      <th>{translations.fight?.TABLE_ACTION}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combatsWaiting.map((combat) => (
                      <tr key={combat.id}>
                        <td>{combat.dino1_account_name}</td>
                        <td>
                          <Link href={`/fight/fast/update/${combat.id}`}>
                            <button className="btn btn-view">{translations.fight?.TABLE_FIGHT}</button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">{translations.fight?.NO_FIGHT_WAITING_TITLE}</p>
              )}
            </div>
            <div className="combat-card ongoing block_white">
              <h2>{translations.fight?.FIGHT_START_TITLE}</h2>
              {combatsStart.length > 0 ? (
                <table className="combat-table">
                  <thead>
                    <tr>
                      <th>{translations.fight?.TABLE_AGAIN}</th>
                      <th>{translations.fight?.TABLE_ACTION}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combatsStart.map((combat) => (
                      <tr key={combat.id}>
                        <td>{combat.dino2_account_name}</td>
                        <td>
                          {translations.fight?.["STATUS_"+combat.status]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">{translations.fight?.NO_FIGHT_START_TITLE}</p>
              )}
            </div>
            <div className="combat-card completed block_white">
              <h2>{translations.fight?.FIGHT_END_TITLE}</h2>
              {combatsTermines.length > 0 ? (
                <table className="combat-table">
                  <thead>
                    <tr>
                      <th>{translations.fight?.TABLE_AGAIN}</th>
                      <th>{translations.fight?.TABLE_ACTION}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combatsTermines.map((combat) => (
                      <tr key={combat.id}>
                        {
                          combat.dino1 == getDinoId() ? (
                            <td>{combat.dino2_account_name}</td>
                          ):(
                            <td>{combat.dino1_account_name}</td>
                          )
                        }
                        <td>
                          <Link href={`/fight/fast/preview/${combat.id}`}>
                            {
                              combat.gagnant == getDinoId()?(
                                <button className="btn btn-result-win">{translations.fight?.SEE_RESULT}</button>
                              ):(
                                <button className="btn btn-result-lose">{translations.fight?.SEE_RESULT}</button>
                              )
                            }
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">{translations.fight?.NO_FIGHT_END_TITLE}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CombatListPage;
