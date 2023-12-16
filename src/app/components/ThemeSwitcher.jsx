"use client";
import { Gradient } from "@/app/components/Gradient";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";


export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const gradient = new Gradient();
    gradient.initGradient("#gradient-canvas");
  }, []);

  useEffect(() => {
    // get #gradient-canvas
    const gradient = new Gradient();
    gradient.initGradient("#gradient-canvas");
    gradient.toggleColor(theme === "dark" ? 0 : 1);
  }, [theme]);



  if (!mounted) {
    return null;
  }


  return (
    <button
      className={`w-fit absolute right-2 top-2 p-2 rounded-md hover:scale-110 active:scale-100 duration-200 bg-slate-600 dark:bg-[#cfd3da]`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "light" ?
        <svg className="dark:hidden" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-slate-300" d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z" />
          <path className="fill-slate-400" d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z" />
        </svg> :
        <svg className="hidden dark:block" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-slate-400" d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z" />
          <path className="fill-slate-500" d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z" />
        </svg>}
    </button>
  );
};