import Image from 'next/image';
import { useState } from "react";
import styles from './ImageWithText.module.css';
import { useOption } from "@/context/OptionsContext";

const ImageTerrainWithText = ({itemName, translations, width = 100, height = 100 }: {itemName: string, translations: any, width?: number, height?: number}) => {
  const [hovered, setHovered] = useState(false);
  const { option, getImageUrl } = useOption();
  return (
    <div 
    className="flex items-center space-x-3 relative"
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
    <div className="relative">
      <div className={styles.container}>
        <Image src={getImageUrl(`terrain/${itemName}.webp`)} alt={translations?.IMAGE_LAND} width={width} height={height} className={styles.image} />
      </div>

      {hovered && (
        <div 
          className="absolute bg-gray-800 text-white text-sm p-4 rounded shadow-lg z-50"
          style={{
            minWidth: "300px",
            maxWidth: "500px",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            left: "0",
            top: "100%",
            marginTop: "5px",
          }}
        >
          {translations?.["TERRAIN_DESC_" + itemName] ?? translations?.NO_DESC}
        </div>
      )}
    </div>
  </div>
  );
};

export default ImageTerrainWithText;
