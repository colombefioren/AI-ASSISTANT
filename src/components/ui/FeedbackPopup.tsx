"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const FeedbackPopup = ({
  isOpen,
  onClose,
  feedbackItems,
}: {
  isOpen: boolean;
  onClose: () => void;
  feedbackItems: string[];
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-semibold text-white mb-4">
              Your Interview Feedback
            </h3>

            <ul className="space-y-3 mb-6">
              {feedbackItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-sky-400 mr-2">•</span>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            >
              Close Feedback
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
