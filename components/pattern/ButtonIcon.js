import { Button } from "@nextui-org/react";
import { FaRocket } from "react-icons/fa";

const ButtonIcon = ({ onClick, label = "" }) => {
  return (
    <Button
      onClick={onClick}
      className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold flex items-center gap-2 shadow-lg"
      size="lg"
    >
      <FaRocket />
      {label}
    </Button>
  );
};

export default ButtonIcon;
