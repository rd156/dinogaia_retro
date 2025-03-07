import { motion } from "framer-motion";

interface ButtonGlowProps {
  onClick?: () => void;
  label?: string;
}

const ButtonGlow = ({ onClick, label = ""}: ButtonGlowProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px 5px rgba(72, 167, 255, 0.7)" }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      {label}
    </motion.button>
  );
};

export default ButtonGlow;
