"use client";
import React from "react";
import { useEffect, useState } from "react";
import { database } from "../firebaseConfig";
import { get, ref, push, set } from "firebase/database";
import Link from "next/link"; // Linking to other pages
import Image from "next/image";
import Reload from "/public/img/reload.png";
import WaterHubLogo from "/public/img/WaterHub.png";
import Confetti from 'react-confetti';

export default function Page() {
  const [username, setUsername] = useState("");
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [password, setPassword] = useState("");
  const [signupStatus, setSignupStatus] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Confetti
  const [showSignUp, setShowSignUp] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const newUserHandler = (e) => {
    // Calculate daily water intake
    const baseWaterIntake = weight * (2 / 3); // Base intake based on weight
    const additionalWater = (parseInt(exercise) / 30) * 12; // Additional water based on exercise

    const totalWaterIntake = Math.round(baseWaterIntake + additionalWater);

    // Check if the user already exists
    const userRef = ref(database, `users/${username}`);
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("User already exists");
          setUserExists(true);
          setShowSignUp(false);
        } else {
          // User does not exist, add the new user to the database
          setSignupStatus(true);

          // Show confetti
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 13000);

          const newUserRef = ref(database, `users/${username}`);
          set(newUserRef, { objective: totalWaterIntake, password: password, weight: weight, exercise: exercise })
            .then(() => {
              console.log("New user added to the database");
            })
            .catch((error) => {
              console.error("Error adding new user to the database:", error);
            });

          // Save the username to local storage
          localStorage.setItem("username", username);
          // redirect to the home page
        }
      })
      .catch((error) => {

        console.error("Error checking if user exists:", error);
      });
  };

  return (
    <main className="p-8">
      <div className="absolute p-0 left-4  top-2 flex flex-row-reverse items-center justify-center">
        <button
          className="bg-slate-600 p-2 font-sans font-bold text-slate-200 rounded-lg hover:scale-110 active:scale-100 duration-200"
          onClick={() => window.history.back()}
        >
          ← Go Back
        </button>
      </div>
      <div
        htmlFor="reloadButton"
        className="absolute p-0 right-16 top-3 flex flex-row-reverse items-center justify-center scale-125 hover:scale-150 duration-200"
      >
        <Image
          src={Reload}
          alt="reload"
          width={32}
          height={32}
          className="bg-slate-600 mr- p-1.5 rounded-md hover:ease-in-out duration-300 cursor-wait"
          onClick={() => {
            window.location.reload(true);
          }}
        />
      </div>
      {showConfetti && (
        <Confetti
          style={{
            position: "fixed", // Use fixed instead of absolute
            left: 0,
            top: 0,
            height: "100%", // Cover the entire height
          }}
        />
      )}
      <div className="flex flex-col items-center mt-14 lg:mt-28 p-2 justify-center">
        <Image
          src={WaterHubLogo}
          alt="WaterHubLogo"
          width={100}
          height={100}
          className="mr-2 mb-2 dark:bg-slate-300 rounded-xl"
        />
        <h1 className="text-4xl font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">
          SignUp
        </h1>
      </div>
      <div className="mb-4 p-5 text-center backdrop-blur-sm bg-white/10 lg:max-w-xl lg:w-full lg:mb-0 lg:text-left mx-auto rounded-3xl">
        {!signupStatus && showSignUp && (
          <div className="flex flex-col mt-4 mb-2 items-center p-2 justify-center">
            <label htmlFor="username">
              <label
                htmlFor="first_name"
                className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                First name
              </label>
              <input
                type="text"
                id="username"
                className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="John"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
              />
            </label>
            <label htmlFor="weight">
              <label
                htmlFor="first_name"
                className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Weight (lb)
              </label>
              <input
                type="number"
                id="weight"
                className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="165"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
            <label htmlFor="exercise">
              <label
                htmlFor="first_name"
                className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Daily Average Exercise (min)
              </label>
              <input
                type="number"
                id="exercise"
                className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="60"
                required
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
              />
            </label>
            <label htmlFor="password">
              <label
                htmlFor="first_name"
                className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="•••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="text-white font-extrabold mt-4 bg-[#426eff] hover:bg-[#479fc8] hover:scale-110 duration-200 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                newUserHandler();
                setShowSignUp(false);
                setIsVisible(true); // Confetti
              }}
            >
              Submit
            </button>
          </div>
        )}
        {userExists && (
          <div className="flex flex-col mt-4 mb-2 items-center p-2 justify-center">
            <h1 className="text-2xl font-sans font-bold lg:mt-0 text-red-600">
              Username already exists!
            </h1>
            <button
              type="submit"
              className="text-white font-extrabold mt-4 bg-[#426eff] hover:bg-[#479fc8] hover:scale-110 duration-200 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                setUserExists(false);
                setShowSignUp(true);
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {signupStatus && (
          <div className="flex flex-col mt-4 mb-2 items-center p-2 justify-center">
            <h1 className="text-2xl font-sans font-bold lg:mt-0 text-green-600">
              Account Created!
            </h1>
            <Link href="./">
              <button
                type="submit"
                className="text-white font-extrabold mt-4 bg-[#426eff] hover:bg-[#479fc8] hover:scale-110 duration-200 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                OK
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <p className="text-center text-sm font-bold text-blue-950 dark:text-white">
          Daily water intake is calculated based on your weight and exercise.
          <a
            className=""
            href="https://www.wku.edu/news/articles/index.php?view=article&articleid=2762&return=archive"
            target="_blank"
          >
            <u> Learn more about how</u>
          </a>
        </p>
      </div>
    </main>
  );
}
