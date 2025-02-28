"use client"

import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate} from '@/utils/translate';
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import {API_URL} from '@/config/config';
import Link from "next/link";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import "./page.css";

const DinoPage: React.FC = () => {
  const params = useParams();
  const dinoId = params?.id;
  const [data, setData] = useState<any[]>([]);
  const [isLevelUp, setIsLevelUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [waitingSalary, setWaitingSalary] = useState(null)
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["dino", "global"]);
      setTranslations(loadedTranslations);
    };

    if (option?.language) {
      fetchTranslations();
    }
  }, [option?.language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/job/${dinoId}/waiting_salary`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des bid');
        }

        const fetchedData = await response.json();
        setWaitingSalary(fetchedData);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFavoriteToggle = async (dinoId: number) => {
    try {
      const token = localStorage.getItem('token');

      // Appel API pour basculer l'état de favori
      const response = await fetch(`${API_URL}/dino/favory/${dinoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setErrorMessage(translations.dino?.ERR_FAVORY_FAILED);
      }
      // Mise à jour locale de l'état favori du dino
      setData((prevDino) => ({
        ...prevDino,
        favory: !prevDino.favory,
      }));
    } catch (error) {
      setErrorMessage(translations.dino?.ERR_FAVORY_FAILED);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {

        const response = await fetch(`${API_URL}/dino/${dinoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
        }

        const fetchedData = await response.json();
        console.log(fetchedData)
        setData(fetchedData);
      } catch (error) {
        setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {

        const response = await fetch(`${API_URL}/dino/level/${dinoId}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
        }

        const LevelUpData = await response.json();
        console.log(LevelUpData)
        if (LevelUpData.is_possible && LevelUpData.is_possible == true)
        {
          setIsLevelUp(true);
        }
        
      } catch (error) {
        setErrorMessage(translations.dino?.ERR_LOAD_FAILED);
      }
    };

    fetchData();
  }, []);

  const handleLevelUpClick = async (dino_id) => {
    const token = localStorage.getItem("token");
    console.log(dino_id)
    try {  
      const response = await fetch(`${API_URL}/dino/level/${dino_id}/update`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({}),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.dino?.ERR_LEVEL_UP);
      }
      const result = await response.json();
      setIsLevelUp(false);
    } catch (error) {
      setErrorMessage(translations.dino?.ERR_LEVEL_UP);
      setIsLevelUp(false);
    }
  };

  const salaryButtonClick = async () => {
    const token = localStorage.getItem("token");
    try {  
      const response = await fetch(`${API_URL}/job/${dinoId}/salary`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        }
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_SALARY_JOB);
      }
      const result = await response.json();
      if (result)
      {
        setWaitingSalary(null)
      }
    } catch (error) {
      setErrorMessage(translations.job?.ERR_SALARY_JOB);
    }
  };

  const drinkWellButtonClick = async () => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {  
      const response = await fetch(`${API_URL}/dino/water_well/${dinoId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        }
      });
      const result = await response.json();
      if (result){
        setData(result);
      }
    } catch (error) {
    }
  };
 
  const getDaysDifference = (dateString: string): number => {
    const givenDate = new Date(dateString);
    const today = new Date();
  
    const differenceInTime = today.getTime() - givenDate.getTime();
    return Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="content">
      <div className='content_top'>
        <div className='dino-container'>
          <div className="block_white dino-card">
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span 
                onClick={(e) => {
                  handleFavoriteToggle(data.id);
                  e.preventDefault();
                }}
                style={{ cursor: 'pointer', color: data.favory ? 'gold' : 'gray', fontSize: '36px', marginRight: '20px' }}
                title={translations.dino?.ADD_FAVORY}
              >
                {data.favory ? '★' : '☆'}
              </span>
              <h1 className="dino-name" style={{ margin: 0 }}>{data.name}</h1>
              {waitingSalary && waitingSalary.jours > 0 && (
                <div style={{ marginLeft: 'auto' }}>
                  <ButtonFancy onClick={() => salaryButtonClick()} label={translations.dino?.COLLECT_SALARY} />
                </div>
              )}
            </div>
          {isLevelUp && <ButtonFancy onClick={() => handleLevelUpClick(data.id)} label={translations.dino?.LEVEL_UP} />}
            {data && (
              <div className="dino-header">
                <div className="dino-info-right">
                  <img src={`/avatar/${data.avatar}.webp`} alt={translations.quest?.IMAGE_PROFILE_ALT.replace("[Name]", data.name)} className="dino-profile-image" />
                </div>
                <div className="dino-info-right">
                  <div className="stat-right-block">
                    <div className="stat-item">
                      <p>{translations.dino?.LEVEL}: <strong>{data.level?.lvl || "N/A"}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.XP}: <strong>{data.xp} / {data.next_level?.xp}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.EMERALD}: <strong>{data.emeraude}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.LUCK}: <strong>{data.luck}</strong></p>
                    </div>
                  </div>
                </div>
                <div className="dino-info-right">
                  <div className="stat-right-block">
                    <div className="stat-item">
                      <p>{translations.dino?.AGILITE}: <strong>{data.agilite} / {data.next_level?.agilite}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.INTELLIGENCE}: <strong>{data.intelligence} / {data.next_level?.intelligence}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.STRENGH}: <strong>{data.force} / {data.next_level?.force}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.ENDURANCE}: <strong>{data.endurance} / {data.next_level?.endurance}</strong></p>
                    </div>
                  </div>
                </div>
                <div className="dino-info-right">
                  <div className="stat-right-block">
                    <div className="stat-item">
                      <p>{translations.dino?.SIZE}: <strong>{(Math.round(data.taille * 100) / 100).toFixed(2)}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.WEIGHT}: <strong>{(Math.round(data.poids * 100) / 100).toFixed(2)} kg</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>{translations.dino?.AGE}: <strong>{translations.dino?.AGE_DAY.replace("[Number]" ,getDaysDifference(data.date_naissance))}</strong></p>
                    </div>
                    <div className="stat-item">
                      <p>
                        {translations.dino?.INJURY}: <strong style={{ color: data.injury !== "SAIN" ? "red" : "inherit" }}>{translations.dino?.["INJURY_" + data.injury]}</strong>
                      </p>
                    </div>
                    <div className="stat-item">
                      <p>
                        {translations.dino?.DISEASE}: <strong style={{ color: data.disease !== "SAIN" ? "red" : "inherit" }}>{translations.dino?.["DISEASE_" + data.disease]}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {data.is_dead && (
              <div 
                style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    border: "2px solid #92303d",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    position: "relative",
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span style={{ fontSize: "25px", fontWeight: "bold", color: "#92303d"}}>
                  {translations.dino?.DINO_DEAD}
                </span>
              </div>
            )}
            {isHovered && (
              <div 
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#333",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  marginTop: "5px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  zIndex: 50,
                }}
              >
                {translations.dino?.DINO_DESC_DEAD}
              </div>
            )}
            { data.is_dead == false && (data.faim < 100 || data.soif < 100) && (
              <div className="dino-action" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: "bold", color: "#164617" }}>
                  {translations.dino?.ACTION_POSSIBILITY}
                </span>
                <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                  {data.faim < 100 && (
                    <a href="/cave" style={{ textDecoration: "none" }}>
                      <button
                        style={{
                          backgroundColor: "#FF9800",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px 20px",
                          cursor: "pointer",
                          fontSize: "16px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          transition: "background-color 0.3s, transform 0.3s",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#FF5722"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FF9800"}
                      >
                        {translations.dino?.ACTION_HUNGER}
                      </button>
                    </a>
                  )}
                  {data.soif < 100 && (
                    <button
                      onClick={() => drinkWellButtonClick()}
                      style={{
                        backgroundColor: "#2196F3",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontSize: "16px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        transition: "background-color 0.3s, transform 0.3s",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1976D2"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2196F3"}
                    >
                      {translations.dino?.ACTION_THIRST}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="dino-stats">
              <div className="stat-block">
                <h2>{translations.dino?.LIFE}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill life-bar"
                    style={{ width: `${(data.pv / data.pv_max) * 100}%` }}
                  ></div>
                </div>
                <p>
                  {data.pv}/{data.pv_max}
                </p>
              </div>
              <div className="stat-block">
                <h2>{translations.dino?.PM}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill pm-bar"
                    style={{ width: `${(data.pm / data.pm_max) * 100}%` }}
                  ></div>
                </div>
                <p>
                  {data.pm}/{data.pm_max}
                </p>
              </div>
              <div className="stat-block">
                <h2>{translations.dino?.HUNGER}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill faim-bar"
                    style={{ width: `${data.faim}%` }}
                  ></div>
                </div>
                <p>
                  {data.faim}/100
                </p>
              </div>
              <div className="stat-block">
                <h2>{translations.dino?.THIRST}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill soif-bar"
                    style={{ width: `${data.soif}%` }}
                  ></div>
                </div>
                <p>
                  {data.soif}/100
                </p>
              </div>
              <div className="stat-block">
                <h2>{translations.dino?.FATIGUE}</h2>
                <div className="progress-bar">
                  <div
                    className="progress-fill fatigue-bar"
                    style={{ width: `${data.fatigue}%` }}
                  ></div>
                </div>
                <p>
                  {data.fatigue}/100
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <Link href="/dino">
                <button className="btn btn-back">{translations.dino?.RETURN_LIST}</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default DinoPage;
