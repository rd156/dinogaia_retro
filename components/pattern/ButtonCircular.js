import { motion } from "framer-motion";

const ButtonCircular = ({ onClick, icon }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600"
    >
      {icon}
    </motion.button>
  );
};

export default ButtonCircular;
