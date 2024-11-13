"use client"

import { useParams } from 'next/navigation';
import React from 'react';

const DinoPage: React.FC = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <div>
      <p>blabla - Dino ID: {id}</p>
    </div>
  );
};

export default DinoPage;
