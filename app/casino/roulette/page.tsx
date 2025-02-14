"use client";

import { useState } from "react";
import { Wheel } from "react-custom-roulette";

const data = [
  { option: "10" },
  { option: "20" },
  { option: "30" },
  { option: "40" },
  { option: "50" },
  { option: "60" },
  { option: "70" },
  { option: "80" },
  { option: "90" },
  { option: "coucou" },
];

export default function Roulette() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const handleSpinClick = async () => {
    setMustSpin(true);

    setTimeout(async () => {
      const response = await fetch("/regen/start");
      const result = await response.json();
      
      const newPrizeIndex = data.findIndex(d => d.option === result.value.toString());
      setPrizeNumber(newPrizeIndex !== -1 ? newPrizeIndex : 0);
      setMustSpin(false);
    }, 8000);
  };

  return (
    <main className="content">
        <div className="content_top"> 
            <div className="block_white">
                <div className="flex flex-col items-center">
                    <Wheel
                        mustStartSpinning={mustSpin}
                        prizeNumber={5}
                        data={data}
                        backgroundColors={["#FF0000", "#000000", "#00FF00"]}
                        textColors={["#FFFFFF"]}
                        outerBorderColor="#FFFFFF"
                        outerBorderWidth={5}
                        spinDuration={0.5}
                        onStopSpinning={() => setMustSpin(false)}
                    />
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                        onClick={handleSpinClick}
                        disabled={mustSpin}
                    >
                        {mustSpin ? "Spinning..." : "Spin the wheel"}
                    </button>
                </div>
            </div>
        </div>
      </main>
  );
}
