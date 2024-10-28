"use client"


import React, { useEffect, useState } from 'react';
import {API_URL} from '../../../config/config';

const Test = () => {
  const [data, setData] = useState('');

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Token non trouvé');
        return;
      }
  
      try {
        const res = await fetch(API_URL+'/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Ajoutez le token dans l'en-tête de la requête
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          throw new Error(`Erreur: ${res.status}`);
        }
        console.log(res);
        const data = await res.text(); // ou .json()
        console.log(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données', error);
      }
    }
  
    fetchData();
  }, []);
  
  return (
    <div>
      <h1>Contenu de Alpha.com/test</h1>
      <div>{data}</div>
    </div>
  );
};
export default Test;