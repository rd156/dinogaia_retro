"use client"
import styles from './Content.module.css';
import { NextUIProvider } from '@nextui-org/react';

export default function Content({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextUIProvider>
      <div className={styles.content}>
        {children}
      </div>
    </NextUIProvider>
  );
}
