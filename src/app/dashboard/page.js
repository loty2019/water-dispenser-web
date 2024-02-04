"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Linking to other pages
import Image from "next/image";
import Reload from "/public/img/reload.png";
import WaterHubLogo from "/public/img/WaterHub.png";
import { get, ref, push, set, update } from "firebase/database";
import { database } from "../firebaseConfig";

export default function Page() {
  const [password, setPassword] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [username, setUsername] = useState("");

  // Load the username from local storage
  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");

    const savedPassword = localStorage.getItem("password");
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // Handle the username change
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  //Handle the save username button
  const handleSavePassword = () => {
    localStorage.setItem("password", password);

    // save to the database
    const userRef = ref(database, `users/${username}`);
    update(userRef, {
      password: password,
    });

    setIsSaved(true);
  };

  // Handle the log out button
  const handleLogOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("autoLogin");
    window.location.href = "./";
    setIsLogged(true);
  };

  return (
    <main className="pt-8">
      <div className="absolute p-0 left-4  top-2 flex flex-row-reverse items-center justify-center">
        <button
          className="bg-slate-600 p-2 font-sans font-bold text-slate-200 rounded-lg hover:scale-110 active:scale-100 duration-200"
          onClick={() => window.history.back()}
        >
          ← Go Back
        </button>
      </div>
      <div className="absolute p-0 right-16 top-3 flex flex-row-reverse items-center justify-center scale-125 hover:scale-150 duration-200">
        <Image
          src={Reload}
          alt="settings"
          width={32}
          height={32}
          className="bg-slate-600 mr- p-1.5 rounded-md hover:ease-in-out duration-300"
          onClick={() => {
            window.location.reload(true);
          }}
        />
      </div>
      <div className="flex flex-col mb-6 items-center mt-10 p-2 justify-center">
        <Image
          src={WaterHubLogo}
          alt="WaterHubLogo"
          width={100}
          height={100}
          className="dark:bg-slate-300 rounded-xl"
        />
        <h1 className="text-4xl font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">
          Settings
        </h1>
      </div>
      <div className="bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
        <span className="flex flex-col items-center ">Set your password</span>
        <div className="flex flex-row items-center justify-center mt-4">
          <input
            type="text"
            value={password}
            onChange={handlePasswordChange}
            placeholder={"Enter your password"}
            className="p-2 border border-gray-300 rounded-lg"
          />
          {isSaved ? (
            <button className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
              Successful
            </button>
          ) : (
            <button
              onClick={handleSavePassword}
              className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Save
            </button>
          )}
        </div>
      </div>
      <div className="mt-6 bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
        <span className="flex flex-col items-center ">Do you want to log out ?</span>
        {isLogged ? (
          <button className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
            Successful log out
          </button>
        ) : (
          <button
            onClick={handleLogOut}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Log Out
          </button>
        )}
      </div>
    </main>
  );
}
