import { motion } from "framer-motion";

const ButtonThreeD = ({ onClick, label = "Push Me!" }) => {
  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ y: 2 }}>
      <button
        onClick={onClick}
        className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg shadow-lg shadow-indigo-400/50"
      >
        {label}
      </button>
    </motion.div>
  );
};

export default ButtonThreeD;
