"use client"

import { useState } from "react";

const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`
        relative w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none
        ${isOn ? "bg-indigo-500" : "bg-gray-300"}
      `}
      aria-label={`Toggle ${isOn ? "On" : "Off"}`}
    >
      {/* Thumb */}
      <div
        className={`
          absolute bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300
          ${isOn ? "translate-x-8" : "translate-x-0"}
        `}
      />
    </button>
  );
};

export default ToggleButton;
