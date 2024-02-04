'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Linking to other pages
import Image from 'next/image';
import Reload from '/public/img/reload.png';
import WaterHubLogo from '/public/img/WaterHub.png';
import { get, ref, push, set } from "firebase/database";
import { database } from "../firebaseConfig";


export default function Page() {
    const [username, setUsername] = useState('');
    const [isSaved, setIsSaved] = useState(false); // New state for saving status

    // Load the username from local storage
    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
        }
    }, []);

    // Handle the username change
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    // Handle the save username button
    // const handleSaveUsername = () => {
    //     localStorage.setItem('username', username);
    //     setIsSaved(true);
    // };

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
        <div className="flex flex-col items-center mt-10 p-2 justify-center">
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
        {/* <div className="flex flex-col items-center mt-4">
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder={"Enter your username"}
            className="p-2 border border-gray-300 rounded-lg"
          />
          {isSaved ? (
            <button
            className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Successful
            </button>
          ) : (
            <button
              onClick={handleSaveUsername}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Save Username
            </button>
          )}
        </div> */}
      </main>
    );
}