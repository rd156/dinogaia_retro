"use client"

import { useParams } from 'next/navigation';
import React from 'react';
import {API_URL} from '@/config/config';
import "./page.css";

const DinoPage: React.FC = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <main className="content">
      <p>blabla - Dino ID: {id}</p>
    </main>
  );
};

export default DinoPage;
