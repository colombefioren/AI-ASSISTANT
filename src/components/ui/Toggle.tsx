"use client";

import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { Info } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const Toggle = ({
  setIsMale,
}: {
  setIsMale: Dispatch<SetStateAction<boolean>>;
}) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setIsMale(enabled);
  }, [enabled]);

  return (
    <div className="absolute flex items-center gap-4 z-[100] top-10 right-10 bg-slate-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700/50 shadow-lg">
      <span className="text-sm font-medium text-slate-300">
        {enabled ? "Female" : "Male"}
      </span>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
          enabled ? "bg-gradient-to-r from-sky-500 to-blue-500" : "bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </Switch>
    </div>
  );
};

export default Toggle;
