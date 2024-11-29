"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/config";
import "./page.css";

const HuntResultPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les paramètres terrain et weapon
  const terrain = searchParams.get("terrain");
  const weapon = searchParams.get("weapon");

  useEffect(() => {
    const fetchHuntResult = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const dinoId = localStorage.getItem("dinoId");

      if (!terrain || !weapon || !dinoId) {
        setError("Paramètres manquants pour effectuer la chasse.");
        setLoading(false);
        return;
      }

      try {
        // Appeler l'API pour effectuer la chasse
        const response = await fetch(`${API_URL}/hunt/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: dinoId,
            terrain,
            weapon,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi des données de chasse.");
        }

        const result = await response.json();
        console.log(result);
        setResultData(result);
      } catch (error) {
        setError("Impossible de récupérer les résultats. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchHuntResult();
  }, [terrain, weapon]);

  return (
    <main className="content">
      <div className="content_top">
        {resultData && (
          <div className="block">
            <h2>Résultats de la chasse :</h2>
            <br/>
            <ul>
              <li><strong>Terrain :</strong> {resultData.terrain}</li>
              {weapon !== "None" && (
                <li><strong>Arme utilisée :</strong> {weapon}</li>
              )}
              <li><strong>Chasse réussie :</strong> {resultData.type ? "Oui" : "Non"}</li>
            </ul>
            <br/>
            <h3><strong>Détails :</strong></h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
            {resultData.items && 
              Object.entries(resultData.items).map(([name, count]) => (
                <div className="block">
                  <img
                    src={`items/${name}.webp`}
                    alt={`Image de ${name}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      marginBottom: "10px",
                    }}
                  />
                  <p>Quantité : {count}</p>
                </div>
              ))
            }
            </div>
            <br/>
            {resultData.pv && (
              <div className={resultData.pv < 0 ? "block-red" : "block-green"}>
                <p>
                  {resultData.pv < 0 
                    ? `Tu as perdu ${resultData.pv} PV` 
                    : `Tu as gagné ${resultData.pv} PV`}
                </p>
              </div>
            )}
            {resultData.pm && (
              <div className={resultData.pm < 0 ? "block-red" : "block-green"}>
                <p>
                  {resultData.pm < 0 
                    ? `Tu as perdu ${resultData.pm} PM` 
                    : `Tu as gagné ${resultData.pm} PM`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default HuntResultPage;
