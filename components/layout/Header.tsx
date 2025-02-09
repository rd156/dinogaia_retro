"use client"
import styles from './Header.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { translate, Loadtranslate} from '@/utils/translate';
import React from "react";
import { useState, useEffect } from 'react';
import { NextUIProvider, Navbar, NavbarBrand, NavbarContent, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, Input, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownItem, DropdownMenu } from "@nextui-org/react";
import LoginForm from '@/components/login/LoginForm';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isConnect, setIsConnect] = React.useState(false);
  const {language, toggleLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await Loadtranslate(language, ['menu', 'global']);
      setTranslations(loadedTranslations);
    };
    fetchTranslations();
  }, [language]);

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = "/";
  };

    // Génération dynamique des éléments du menu avec traductions
    /*
      [translations.menu['MENU_CASINO']]: "#",
      [translations.menu['MENU_BANK']]: "#",
      [translations.menu['MENU_OTHER']]: "#",
      [translations.menu['MENU_CRAFT']]: "#",
    */
      const menuConnectItems = translations && translations.menu ? {
        [translations.menu['MENU_MY_DINO']]: "/dino/actual",
        [translations.menu['MENU_MY_CAVE']]: "/cave",
        [translations.menu['MENU_MY_HUNT']]: "/hunt",
        [translations.menu['MENU_FIGHT']]: [
          { name: "CLASSIC", link: "/fight/classic" },
          { name: "FAST", link: "/fight/fast" },
          { name: "ULTRAFAST", link: "/fight/ultrafast" }
        ],
        [translations.menu['MENU_SHOP']]: "/shop",
        [translations.menu['MENU_QUEST']]: "/quest",
        [translations.menu['MENU_JOB']]: "/job",
        [translations.menu['MENU_MESSAGE']]: "/message",
        [translations.menu['MENU_HISTORY']]: "/story",
        [translations.menu['MENU_ACCOUNT']]: [
          { name: translations.menu?.MENU_BUG, link: "/bug"},
          { name: translations.menu?.MENU_PARAMETER, link: "/settings"},
          { name: translations.menu?.MENU_DECONNECT, onClick: handleLogout }
        ]
      } : {};
      
  
    const menuVisitorItems = translations && translations.global ? {
      [translations.menu['MENU_HISTORY']]: "/story",
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

  const displayMenuElement = (key, value, index) => {
    if (Array.isArray(value)) {
      return (
        <Dropdown key={index}>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="dropdown_color p-0 bg-transparent data-[hover=true]:bg-transparent"
                endContent="e"
                radius="sm"
                variant="light"
              >
                {key}
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label={key}
            className="w-[340px]"
            itemClasses={{
              base: "gap-4",
            }}
          >
            {value.map((subItem, subIndex) => (
              <DropdownItem
                key={subIndex}
                startContent=""
                textValue={subItem.name}
                className={styles.dropdown_color}
              >
                {subItem.onClick ? (
                  <Link onClick={subItem.onClick} className={styles.link}>
                    {subItem.name}
                  </Link>
                ) : (
                  <Link href={subItem.link} className={styles.link}>
                    {subItem.name}
                  </Link>
                )}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      );
    }
    return (
      <NavbarItem key={index}>
        <Link color="foreground" href={value}>
          {key}
        </Link>
      </NavbarItem>
    );
  };

  return (
    <header className={styles.header}>
      <Navbar onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit">DinoGaia Reborn</p>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {
            isConnect ? (
              Object.entries(menuConnectItems).map(([key, value], index) => displayMenuElement(key, value, index))
            ) : (
              Object.entries(menuVisitorItems).map(([key, value], index) => displayMenuElement(key, value, index))
            )
          }
        </NavbarContent>
        {
          !isConnect && (
            <NavbarContent justify="end">
              <LoginForm />
            </NavbarContent>
          )
        }
      </Navbar>
    </header>
  );
}
