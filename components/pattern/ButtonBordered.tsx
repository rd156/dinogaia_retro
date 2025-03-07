import { motion } from "framer-motion";

interface ButtonBorderedProps {
  onClick?: () => void;
  label?: string;
}

const ButtonBordered = ({onClick, label = ""}: ButtonBorderedProps) => {
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <button
        onClick={onClick}
        className="relative px-6 py-3 text-white font-bold bg-transparent border-2 border-blue-500 rounded-lg overflow-hidden"
      >
        <span className="absolute inset-0 w-full h-full transition-transform transform -translate-x-full bg-blue-500 group-hover:translate-x-0"></span>
        <span className="relative z-10">{label}</span>
      </button>
    </motion.div>
  );
};

export default ButtonBordered;
