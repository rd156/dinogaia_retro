import { motion } from "framer-motion";

const ButtonNeon = ({ onClick, label = "Button" }) => {
  return (
    <motion.button
      whileHover={{
        background: "linear-gradient(90deg, #ff8a00, #e52e71)",
        boxShadow: "0 4px 15px rgba(229, 46, 113, 0.5)",
        scale: 1.05,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-3 text-white font-semibold bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"
    >
      {label}
    </motion.button>
  );
};

export default ButtonNeon;
