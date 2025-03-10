import { Input, Button } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {NextUIProvider} from "@nextui-org/react";
import {API_URL} from '../../config/config';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await fetch(API_URL + '/account-auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
  
        if (!response.ok) {
          throw new Error('Échec de la connexion');
        } 
  
        const data = await response.json();
        if (data.access)
        {
          localStorage.setItem('token', data.access);
          localStorage.removeItem('dinoId');
          window.location.href = "/dino"
        }
      } catch (error) {
        setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex'}}>
      <Input type="text" autoComplete="off" placeholder="Pseudo" onChange={(e) => setUsername(e.target.value)}
      style={{border: '1px solid #999', backgroundColor: '#4b5320', borderColor: '#4b5320', color: '#393f19'}}/>
      <Input type="password" autoComplete="off" placeholder="Password" onChange={(e) => setPassword(e.target.value)}
      style={{border: '1px solid #999', backgroundColor: '#4b5320', borderColor: '#4b5320', color: '#393f19'}}/>
      <Button type="submit" style={{ width: '250px', backgroundColor: '#393f19', borderColor: '#393f19'}}> Connexion </Button>
    </form>
  );
}