import { useState } from "react";
import { useOption } from "@/context/OptionsContext";
import Image from 'next/image';

interface Translations {
  [key: string]: any;
}

const ItemWithTooltip = ({ itemName, translations, width = 100, height = 100 }: { itemName: string, translations: Translations, width?: number, height?: number }) => {
    const [hovered, setHovered] = useState(false);
    const { option, getImageUrl } = useOption();
  
  return (
    <div 
      className="flex items-center space-x-3 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <Image
          src={getImageUrl(`item/${itemName}.webp`)}
          alt={translations?.IMAGE_ITEM?.replace("[Item]", itemName)}
          width = {300}
          height = {300}
          className="w-12 h-12"
        />

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
            {translations?.["ITEM_DESC_" + itemName] ?? 
              translations.NO_DESC?.replace("[Item]", translations["ITEM_" + itemName])}
          </div>
        )}
      </div>
      <span>{translations?.["ITEM_" + itemName] ?? itemName}</span>
    </div>
  );
};

export default ItemWithTooltip;
