import { motion } from "framer-motion";

interface ButtonFancyGreenProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

const ButtonFancyGreen = ({onClick, label = "", className = ""}: ButtonFancyGreenProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`px-6 py-3 bg-gradient-to-r from-green-600 to-green-900 text-white font-bold rounded-lg shadow-md hover:from-green-700 hover:to-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all ${className}`}
    >
      {label}
    </motion.button>
  );
};

export default ButtonFancyGreen;
