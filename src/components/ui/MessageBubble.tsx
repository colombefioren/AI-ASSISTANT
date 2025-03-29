import { motion, AnimatePresence } from "framer-motion";

const MessageBubble = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            duration: 0.5,
          }}
          className="absolute flex items-center gap-3 z-[100] top-[5rem] right-[650px] bg-[#ececec] py-8 px-10 rounded-full rounded-br-none text-slate-700 shadow-lg"
        >
          Hi there! Let's start your interview.
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default MessageBubble;
