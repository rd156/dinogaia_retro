import { motion } from "framer-motion";

const ButtonRipple = ({ onClick, label = "Wave!" }) => {
  return (
    <motion.button
      whileHover={{
        scale: 1.1,
        background: "linear-gradient(90deg, #00d2ff, #3a47d5)",
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg overflow-hidden group"
    >
      <span className="absolute inset-0 w-full h-full transition-transform transform scale-0 bg-white opacity-20 group-hover:scale-150"></span>
      {label}
    </motion.button>
  );
};

export default ButtonRipple;
