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
  const [weight, setWeight] = useState("");
  const [exercise, setExercise] = useState("");
  const [objective, setObjective] = useState("");
  const [isSavedP, setIsSavedP] = useState(false);
  const [isSavedW, setIsSavedW] = useState(false);
  const [isSavedE, setIsSavedE] = useState(false);
  const [isSavedO, setIsSavedO] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [username, setUsername] = useState("");

  // Load the username from local storage
  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
    setWeight(localStorage.getItem("weight") || "");
    setExercise(localStorage.getItem("exercise") || "");
    setObjective(localStorage.getItem("objective") || "");


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

    setIsSavedP(true);
  };

  const handleWeightChange = (event) => {
    setWeight(event.target.value);
  };

  const handleSaveWeight = () => {
    localStorage.setItem("weight", weight);

    // calculate the objective 
    const baseWaterIntake = weight * (2 / 3); // Base intake based on weight
    const additionalWater = (parseInt(exercise) / 30) * 12; // Additional water based on exercise
    const totalWaterIntake = Math.round(baseWaterIntake + additionalWater);

    // save to the database
    const userRef = ref(database, `users/${username}`);
    update(userRef, {
      weight: weight,
      objective: totalWaterIntake,
    });

    setIsSavedW(true);
  };

  const handleExerciseChange = (event) => {
    setExercise(event.target.value);
  };

  const handleSaveExercise = () => {
    localStorage.setItem("exercise", exercise);

    // calculate the objective 
    const baseWaterIntake = weight * (2 / 3); // Base intake based on weight
    const additionalWater = (parseInt(exercise) / 30) * 12; // Additional water based on exercise
    const totalWaterIntake = Math.round(baseWaterIntake + additionalWater);

    // save to the database
    const userRef = ref(database, `users/${username}`);
    update(userRef, {
      exercise: exercise,
      objective: totalWaterIntake,
    });

    setIsSavedE(true);
  };

  const handleObjectiveChange = (event) => {
    setObjective(event.target.value);
  };

  const handleSaveObjective = () => {
    localStorage.setItem("objective", objective);

    // save to the database
    const userRef = ref(database, `users/${username}`);
    update(userRef, {
      objective: objective
    });

    setIsSavedO(true);
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
      <div className="absolute p-0 left-4 top-2 flex flex-row-reverse items-center justify-center">
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
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className=" bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
          <span className="flex flex-col items-center ">Set your password</span>
          <div className="flex flex-row items-center justify-center mt-4">
            <input
              type="text"
              value={password}
              onChange={handlePasswordChange}
              placeholder={"Enter your password"}
              className="p-2 border border-gray-300 rounded-l-lg"
            />
            {isSavedP ? (
              <button className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r-lg">
                Success
              </button>
            ) : (
              <button
                onClick={handleSavePassword}
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
              >
                Save
              </button>
            )}
          </div>
        </div>
        <div className=" bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
          <span className="flex flex-col items-center ">Set your weight (lb)</span>
          <div className="flex flex-row items-center justify-center mt-4">
            <input
              type="text"
              value={weight}
              onChange={handleWeightChange}
              placeholder={"Your weight"}
              className="p-2 border border-gray-300 rounded-l-lg"
            />
            {isSavedW ? (
              <button className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r-lg">
                Success
              </button>
            ) : (
              <button
                onClick={handleSaveWeight}
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
              >
                Save
              </button>
            )}
          </div>
        </div>
        <div className=" bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
          <span className="flex flex-col items-center ">Set your daily average exercise (min)</span>
          <div className="flex flex-row items-center justify-center mt-4">
            <input
              type="text"
              value={exercise}
              onChange={handleExerciseChange}
              placeholder={"Your daily exercise"}
              className="p-2 border border-gray-300 rounded-l-lg"
            />
            {isSavedE ? (
              <button className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r-lg">
                Success
              </button>
            ) : (
              <button
                onClick={handleSaveExercise}
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
              >
                Save
              </button>
            )}
          </div>
        </div>
        <div className=" bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
          <span className="flex flex-col items-center ">Override water consumption objective <span className=" text-red-600">(not suggested)</span></span>
          <div className="flex flex-row items-center justify-center mt-4">
            <input
              type="text"
              value={objective}
              onChange={handleObjectiveChange}
              placeholder={"your objective"}
              className="p-2 border border-gray-300 rounded-l-lg"
            />
            {isSavedO ? (
              <button className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r-lg">
                Success
              </button>
            ) : (
              <button
                onClick={handleSaveObjective}
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-12 mb-8 bg-white/30 p-5 text-center max-w-sm backdrop-blur-sm lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
          <span className="flex flex-col items-center">Do you want to log out ?</span>
          <div className="flex flex-row items-center justify-center mt-4">
          {isLogged ? (
            <button className=" bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
              Successful log out
            </button>
          ) : (
            <button
              onClick={handleLogOut}
              className="scale-125 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Log Out
            </button>
          )}
          </div>
        </div>
    </main>
  );
}
