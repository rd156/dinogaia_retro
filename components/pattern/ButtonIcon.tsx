import { motion } from "framer-motion";
import { FaRocket } from "react-icons/fa";

interface ButtonIconProps {
  onClick?: () => void;
  label?: string;
}

const ButtonIcon = ({ onClick, label = "" }: ButtonIconProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold flex items-center gap-2 shadow-lg"
    >
      <FaRocket />
      {label}
    </motion.button>
  );
};

export default ButtonIcon;
