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
        className={`relative inline-flex h-8 w-16 items-center rounded-full transition bg-gray-300 dark:bg-gray-700 p-1 duration-300 ease-in-out ${
          enabled ? "bg-blue-400" : "bg-gray-400"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </Switch>
    </div>
  );
};

export default Toggle;
