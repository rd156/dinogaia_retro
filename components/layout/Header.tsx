"use client"
import styles from './Header.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { translate, Loadtranslate} from '@/utils/translate';
import React from "react";
import { useState, useEffect } from 'react';
import { NextUIProvider, Navbar, NavbarBrand, NavbarContent, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, Input, NavbarItem, Link, Button, Dropdown, DropdownItem, DropdownMenu } from "@nextui-org/react";
import LoginForm from '@/components/login/LoginForm';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isConnect, setIsConnect] = React.useState(false);
  const { language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ['menu', 'global']);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

    // Génération dynamique des éléments du menu avec traductions
    /*
      [translations.menu['MENU_BANK']]: "#",
      [translations.menu['MENU_OTHER']]: "#",
      [translations.menu['MENU_CRAFT']]: "#",
    */
    const menuConnectItems = translations && translations.menu ? {
      [translations.menu['MENU_MY_DINO']]: "/dino/actual",
      [translations.menu['MENU_MY_HUNT']]: "/hunt",
      [translations.menu['MENU_MY_CAVE']]: "/cave",
      [translations.menu['MENU_SHOP']]: "/shop",
      [translations.menu['MENU_QUEST']]: "/quest",
      [translations.menu['MENU_CASINO']]: "#",
      [translations.menu['MENU_JOB']]: "#",
      [translations.menu['MENU_BUG']]: "/bug",
    } : {};
  
    const menuVisitorItems = translations && translations.global ? {
      [translations.menu['MENU_NEWS']]: "#",
      [translations.menu['MENU_REGLE']]: "#",
      [translations.menu['MENU_WIKI']]: "#",
      [translations.menu['MENU_FORUM']]: "#",
      [translations.menu['MENU_BUG']]: "/bug",
    } : {};
  useEffect(() => {
    const isTokenValid = (token) => {
      if (!token) {
        return false;
      }
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(window.atob(payload));
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          return false;
        }
        return true;
      } catch (error) {
        return false
      }
    };

    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      setIsConnect(true);
    } else {
      setIsConnect(false);
      localStorage.removeItem('token');
    }
    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem('token');
      if (updatedToken && isTokenValid(updatedToken)) {
        setIsConnect(true);
      } else {
        setIsConnect(false);
        localStorage.removeItem('token');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className={styles.header}>
      <Navbar onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit">Dino Terra</p>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {
            isConnect ? (
              Object.entries(menuConnectItems).map(([key, value], index) => (
                <NavbarItem key={index}>
                  <Link color="foreground" href={value}>
                    {key}
                  </Link>
                </NavbarItem>
              ))
            ) : (
              Object.entries(menuVisitorItems).map(([key, value], index) => (
                <NavbarItem key={index}>
                  <Link color="foreground" href={value}>
                    {key}
                  </Link>
                </NavbarItem>
              ))
            )
          }
        </NavbarContent>
        {
            isConnect ? (
              <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                  <Link href="#">
                  <button
                    onClick={() => toggleLanguage('en')}
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      backgroundColor: language === 'en' ? '#0070f3' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                    }}
                  >
                    English
                  </button>
                  <button
                    onClick={() => toggleLanguage('fr')}
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      backgroundColor: language === 'fr' ? '#0070f3' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                    }}
                  >
                    Francais
                  </button>
                  </Link>
                </NavbarItem>
              </NavbarContent>
            ) : (
              <NavbarContent justify="end">
                <LoginForm/>
              </NavbarContent>
            )
          }
        <NavbarMenu>
        {
            isConnect ? (
              Object.entries(menuConnectItems).map(([key, value], index) => (
                <NavbarMenuItem key={`${key}-${index}`}>
                <Link
                  color={
                    index === 2 ? "primary" : index === menuConnectItems.length - 1 ? "danger" : "foreground"
                  }
                  className="w-full"
                  href="#"
                  size="lg"
                >
                  {key}
                </Link>
                </NavbarMenuItem>
              ))
            ) : (
              Object.entries(menuVisitorItems).map(([key, value], index) => (
                <NavbarMenuItem key={`${key}-${index}`}>
                <Link
                  color={
                    index === 2 ? "primary" : index === menuVisitorItems.length - 1 ? "danger" : "foreground"
                  }
                  className="w-full"
                  href="#"
                  size="lg"
                >
                  {key}
                </Link>
                </NavbarMenuItem>
              ))
            )
          }
        </NavbarMenu>
      </Navbar>
    </header>
  );
}
