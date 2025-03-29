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
    <div className="absolute flex items-center gap-3 z-[100] top-10 right-10">
     
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`relative inline-flex h-8 w-16 items-center rounded-full transition bg-gray-300 dark:bg-gray-700 p-1 duration-300 ease-in-out ${
          enabled ? "bg-blue-500" : "bg-gray-400"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
            enabled ? "translate-x-8" : "translate-x-0"
          }`}
        />
      </Switch>
      <span className="text-lg text-white font-semibold">
        {enabled ? "Female" : "Male"}
      </span>
    </div>
  );
};

export default Toggle;
