"use client";

import { useOption } from "@/context/OptionsContext";
import { Loadtranslate } from "@/utils/translate";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import "./page.css";

interface Translations {
  [key: string]: any;
}

interface BankAccount {
  amount: number;
  rate: number;
  last_update: string;
}

interface InvestmentType {
  id: number;
  name: string;
  type: string;
  min_amount: number;
  max_amount: number;
  total_cost: number;
}

interface Investment {
  id: number;
  investment_type: number;
  amount: number;
  created_at: string;
  last_update: string;
}

const BankPage: React.FC = () => {
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [selectedInvestment, setSelectedInvestment] = useState<number>(0);
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const {option} = useOption();
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["bank", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const dinoId = localStorage.getItem("dinoId");

        if (!dinoId) {
          throw new Error("Dino ID not found");
        }

        // Fetch account
        const accountResponse = await fetch(`${API_URL}/bank/account/${dinoId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!accountResponse.ok) throw new Error("Failed to fetch account");
        const accountData = await accountResponse.json();
        setAccount(accountData);

        // Fetch investment types
        const typesResponse = await fetch(`${API_URL}/bank/investment-types/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!typesResponse.ok) throw new Error("Failed to fetch investment types");
        const typesData = await typesResponse.json();
        setInvestmentTypes(typesData);

        // Fetch investments
        const investmentsResponse = await fetch(`${API_URL}/bank/investments/${dinoId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!investmentsResponse.ok) throw new Error("Failed to fetch investments");
        const investmentsData = await investmentsResponse.json();
        setInvestments(investmentsData);

      } catch (error) {
        setErrorMessage(translations.bank?.ERROR_LOAD_DATA || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translations.bank]);

  const handleDeposit = async () => {
    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const amount = parseInt(depositAmount);

      if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const response = await fetch(`${API_URL}/bank/deposit/${dinoId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Failed to deposit");
      
      const updatedAccount = await response.json();
      setAccount(updatedAccount);
      setDepositAmount("");
    } catch (error) {
      setErrorMessage(translations.bank?.ERROR_DEPOSIT || "Error depositing");
    }
  };

  const handleWithdraw = async () => {
    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const amount = parseInt(withdrawAmount);

      if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const response = await fetch(`${API_URL}/bank/withdraw/${dinoId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Failed to withdraw");
      
      const updatedAccount = await response.json();
      setAccount(updatedAccount);
      console.log(updatedAccount);
      setWithdrawAmount("");
    } catch (error) {
      setErrorMessage(translations.bank?.ERROR_WITHDRAW || "Error withdrawing");
    }
  };

  const handleInvest = async () => {
    try {
      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");
      const amount = parseInt(investmentAmount);

      if (!amount || amount <= 0 || !selectedInvestment) {
        throw new Error("Invalid amount or investment type");
      }

      const response = await fetch(`${API_URL}/bank/invest/${dinoId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          investment_type: selectedInvestment,
          amount 
        }),
      });

      if (!response.ok) throw new Error("Failed to invest");
      
      const updatedAccount = await response.json();
      setInvestmentAmount("");
      setSelectedInvestment(0);
    } catch (error) {
      setErrorMessage(translations.bank?.ERROR_INVEST || "Error investing");
    }
  };

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && <p className="alert-red">{errorMessage}</p>}
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="block_white">
            <h1 className="title">{translations.bank?.TITLE || "Banque"}</h1>

            {/* Account Section */}
            <div className="bank-section">
              <h2 className="section-title">{translations.bank?.ACCOUNT || "Compte"}</h2>
              <div className="account-info">
                <div className="balance">
                  <h3>{translations.bank?.BALANCE || "Solde"}</h3>
                  <p className="amount">{account?.amount || 0} émeraudes</p>
                </div>
                <div className="rate">
                  <h3>{translations.bank?.INTEREST_RATE || "Taux d'intérêt"}</h3>
                  <p className="rate-value">{account?.rate || 0}%</p>
                </div>
              </div>
            </div>

            {/* Deposit Section */}
            <div className="bank-section">
              <h2 className="section-title">{translations.bank?.DEPOSIT || "Dépôt"}</h2>
              <div className="transaction-form">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={translations.bank?.DEPOSIT_AMOUNT || "Montant à déposer"}
                  min="1"
                />
                <button onClick={handleDeposit}>
                  {translations.bank?.DEPOSIT_BUTTON || "Déposer"}
                </button>
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="bank-section">
              <h2 className="section-title">{translations.bank?.WITHDRAW || "Retrait"}</h2>
              <div className="transaction-form">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={translations.bank?.WITHDRAW_AMOUNT || "Montant à retirer"}
                  min="1"
                />
                <button onClick={handleWithdraw}>
                  {translations.bank?.WITHDRAW_BUTTON || "Retirer"}
                </button>
              </div>
            </div>

            {/* Investment Section */}
            <div className="bank-section">
              <h2 className="section-title">{translations.bank?.INVESTMENTS || "Investissements"}</h2>
              <div className="investment-form">
                <select
                  value={selectedInvestment}
                  onChange={(e) => setSelectedInvestment(Number(e.target.value))}
                >
                  <option value={0}>{translations.bank?.SELECT_INVESTMENT || "Sélectionner un investissement"}</option>
                  {investmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.type})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={translations.bank?.INVESTMENT_AMOUNT || "Montant à investir"}
                  min="1"
                />
                <button onClick={handleInvest}>
                  {translations.bank?.INVEST_BUTTON || "Investir"}
                </button>
              </div>

              {/* Current Investments */}
              <div className="current-investments">
                <div className="investments-header">
                  <h3>{translations.bank?.CURRENT_INVESTMENTS || "Investissements actuels"}</h3>
                  <div className="total-investments">
                    <span className="total-label">{translations.bank?.TOTAL_INVESTMENTS || "Total investi"}:</span>
                    <span className="total-amount">
                      {investments.reduce((sum, investment) => sum + investment.amount, 0)} émeraudes
                    </span>
                  </div>
                </div>
                {investments.map((investment) => {
                  const type = investmentTypes.find(t => t.id === investment.investment_type);
                  return (
                    <div key={investment.id} className="investment-item">
                      <div className="investment-info">
                        <h4>{type?.name || "Unknown"}</h4>
                        <p>{investment.amount} émeraudes</p>
                      </div>
                      <div className="investment-date">
                        {new Date(investment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default BankPage; 