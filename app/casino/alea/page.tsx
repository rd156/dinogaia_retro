"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const symbols = ["🍒", "🍋", "🍊", "🔔", "🍉", "⭐"]; // Symboles possibles

const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const SlotMachine = () => {
  const [result, setResult] = useState(["❓", "❓", "❓"]);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    let newResult = ["❓", "❓", "❓"];
    let delays = [0, 0.3, 0.6]; // Délais pour chaque rouleau

    delays.forEach((delay, index) => {
      setTimeout(() => {
        newResult[index] = getRandomSymbol();
        setResult([...newResult]); // Met à jour le state
      }, delay * 1000);
    });

    setTimeout(() => setSpinning(false), 1500);
  };

  return (
    <main className="content">
      <div className="content_top"> 
        <div className="block_white">
          <div className="flex flex-col items-center p-6">
            {/* Slot Machine Container */}
            <div className="flex space-x-4 bg-gray-800 p-4 rounded-lg shadow-lg">
              {result.map((symbol, index) => (
                <motion.div
                  key={index}
                  className="text-5xl bg-white p-4 rounded-lg shadow-md"
                  animate={{ y: spinning ? [0, -20, 0] : 0 }}
                  transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>

            {/* Play Button */}
            <button
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
              onClick={spin}
              disabled={spinning}
            >
              {spinning ? "Spinning..." : "Play"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SlotMachine;
