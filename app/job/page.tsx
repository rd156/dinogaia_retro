"use client";

import { useEffect, useState, Fragment } from "react";
import { useOption } from "@/context/OptionsContext";
import { translate, Loadtranslate } from "@/utils/translate";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";
import ButtonFancy from "@/components/pattern/ButtonFancy";
import ButtonNeon from "@/components/pattern/ButtonNeon";

const JobPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [jobList, setJobList] = useState<any[]>([]);
  const [actualJob, setActualJob] = useState({})
  const [waitingSalary, setWaitingSalary] = useState(null)
  const {option} = useOption();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(option?.language, ["job", "global"]);
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
        const response = await fetch(`${API_URL}/job/list`, {
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
        setJobList(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
      try {
        const response = await fetch(`${API_URL}/job/${dinoId}`, {
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
        setActualJob(fetchedData);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      const token = localStorage.getItem('token');
      const dinoId = localStorage.getItem("dinoId");
      if (dinoId === null || dinoId === "")
      {
        window.location.href = "/dino"
      }
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

  const exitButtonClick = async () => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {  
      const response = await fetch(`${API_URL}/job/${dinoId}/exit`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_EXIT_JOB);
      }
  
      const result = await response.json();
      if (result.exit == true)
      {
        setActualJob({})
      }
    } catch (error) {
      setErrorMessage(translations.job?.ERR_EXIT_JOB);
    }
  };

  const joinButtonClick = async (action) => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
    try {  
      const response = await fetch(`${API_URL}/job/${dinoId}/join`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          "name": action
        }),
      });
  
      if (!response.ok) {
        setErrorMessage(translations.job?.ERR_JOIN_JOB);
      }
      const result = await response.json();
      if (result.job_info)
      {
        setActualJob(result)
      }
    } catch (error) {
      setErrorMessage(translations.job?.ERR_JOIN_JOB);
    }
  };
  
  const salaryButtonClick = async () => {
    const token = localStorage.getItem("token");
    const dinoId = localStorage.getItem("dinoId");
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

  return (
    <main className="content">
      <div className="content_top">
        {errorMessage && (
          <p className="alert-red">{errorMessage}</p>
        )}
        {message && (
          <p className="alert-green">{message}</p>
        )}
        {actualJob.job_info && (
          <div className="job-container">
            <div className="job-card block_white">
              <h1 className="job-name">
                {translations.job?.['JOB_'+ actualJob.job_info.name] ?? actualJob.job_info.name}
              </h1>
              <div>
                <p style={{textAlign: "center"}}>
                  {translations.job?.['JOB_DESCRIPTION_'+ actualJob.job_info.name] ?? "desc: " + actualJob.job_info.name}
                </p>
                <div className="text-sm text-gray-700 mt-2 flex gap-4 items-center justify-center">
                  <p><strong>{translations.job?.LVL}</strong> {actualJob.lvl}</p>
                  <p><strong>{translations.job?.XP}</strong> {actualJob.xp}</p>
                  <p><strong>{translations.job?.FORMATION}</strong> {JSON.parse(actualJob.job_info.formation).emeraud + " E"}</p>
                  <p><strong>{translations.job?.SALARY}</strong> {JSON.parse(actualJob.job_info.salary).emeraud + " E"}</p>
                  {waitingSalary && waitingSalary.jours > 0 && (
                    <ButtonFancy onClick={() => salaryButtonClick()} label={translations.job?.COLLECT_SALARY} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <br />
        <div className="block_white">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>{translations.job?.TABLE_NAME}</th>
              <th style={{ padding: "10px" }}>{translations.job?.TABLE_DESCRIPTION}</th>
                <th style={{ padding: "10px" }}>{translations.job?.TABLE_FORMATION}</th>
                <th style={{ padding: "10px" }}>{translations.job?.TABLE_SALARY}</th>
                <th style={{ padding: "10px" }}>{translations.job?.TABLE_ACTION}</th>
              </tr>
            </thead>
            <tbody>
              {jobList.map((possibility) => (
                <Fragment key={possibility.name}>
                  <tr>
                    <td style={{ padding: "10px" }}>{translations.job?.['JOB_'+ possibility.name] ?? possibility.name}</td>
                    <td style={{ padding: "10px" }}>{translations.job?.['JOB_DESCRIPTION_'+ possibility.name] ?? possibility.name}</td>
                    <td style={{ padding: "10px" }}>{JSON.parse(possibility.formation).emeraud + " E"}</td>
                    <td style={{ padding: "10px" }}>{JSON.parse(possibility.salary).emeraud + " E"}</td>
                    <td style={{ padding: "10px" }}>
                      {actualJob.job_info && possibility.name === actualJob.job_info.name ? (
                          <ButtonNeon onClick={() => exitButtonClick()} label={translations.job?.EXIT_JOB} />
                        ) : (
                          <ButtonFancy onClick={() => joinButtonClick(possibility.name)} label={translations.job?.JOIN_JOB} />
                      
                      )}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default JobPage;
