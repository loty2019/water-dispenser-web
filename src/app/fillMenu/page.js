"use client";
import React from "react";
import { useEffect, useState } from "react";
import { get, ref, push, set } from "firebase/database";
import { database } from "../firebaseConfig";
import Link from "next/link"; // Linking to other pages
import Image from "next/image";
import Reload from "/public/img/reload.png";
import WaterHubLogo from "/public/img/WaterHub.png";
import Coffee from "/public/img/espresso.png";
import Soda from "/public/img/soda_can.png";
import Latte from "/public/img/latte.png";
import Beer from "/public/img/beer.png";
import GlassOfWater from "/public/img/glassOfWater.png";
import WaterBottle from "/public/img/waterBottle.png";
import WineGlass from "/public/img/wine.png";

import "./style.css"; // Importing css file

export default function Page() {
  const [users, setUsers] = useState([]);
  const [objectives, setObjectives] = useState({});
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  const [focusStates, setFocusStates] = useState({});
  const [username, setUsername] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [submitDone, setSubmitDone] = useState(false);
  const [confirmationName, setConfirmationName] = useState({});

  const imgIconSize = 70;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userFromUrl = urlParams.get("username");
    setUsername(userFromUrl);
    // get total accumulated amount of fluid from firebase
    const accumulatedAmountRef = ref(database, "records/forever_consumption");
    get(accumulatedAmountRef).then((snapshot) => {
      if (snapshot.exists()) {
        setAccumulatedAmount(snapshot.val());
      } else {
        console.log("No data available");
      }
    });
  }, []);

  const handleFluidSubmit = (name, value) => {
    // get formatted string for the date
    const todayDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const options = {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const todayDateString = new Date(todayDate)
      .toLocaleString("en-US", options)
      .split(",")[0]
      .replace(/\//g, "-");
    const [month, day, year] = todayDateString.split("-");
    const formattedDateString = `${year}-${month}-${day}`;

    // get formatted time hh:mm:ss in the US east coast
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const time = hours + ":" + minutes + ":" + seconds;
    console.log(time);

    // create path to store the new values
    let path = `records/${formattedDateString}/${name}/${time}`;
    const fluidRef = ref(database, path);

    // set values in the database
    set(fluidRef, parseInt(value)) &&
      set(
        ref(database, "records/forever_consumption"),
        accumulatedAmount + parseInt(value)
      )
        .then(() => {
          console.log("New fluid record added to the database");
        })
        .catch((error) => {
          console.error("Error adding fluid value to the database:", error);
        });
    setInputValues({ ...inputValues, [name]: "" });
    //handleSubmitDone(name);
  };

  const handleFluidChange = (event, name) => {
    setInputValues({ ...inputValues, [name]: event.target.value });
    //setFluidValue(event.target.value);
    //setFocusStates({ ...focusStates, [name]: true });
  };

  return (
    <main className="p-10">
      <div className="absolute p-0 left-4  top-4 flex flex-row-reverse items-center justify-center">
        <Link href="./">
          <button className="bg-slate-600 p-2 font-sans font-bold text-slate-200 rounded-lg hover:scale-110 active:scale-100 duration-200">
            ← Go Back
          </button>
        </Link>
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

      <div className="flex flex-col items-center mt-6 p-2 justify-center">
        <Image
          src={WaterHubLogo}
          alt="WaterHubLogo"
          width={100}
          height={100}
          className="dark:bg-slate-300 rounded-xl"
        />
        <h1 className="text-4xl font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">
          What did you drink,{" "}
          {String(username).charAt(0).toUpperCase() + String(username).slice(1)}
          ?
        </h1>
      </div>
      {submitDone && (
        <div className="flex justify-center items-center">
          <p className="p-3 text-center text-lg pt-5 font-semibold text-blue-950 dark:text-white w-fit  backdrop-blur-md bg-[#e9f391b1] rounded-lg">
            <span className="font-extrabold">{confirmationName}</span> added!
            <br />
            Keep Drinking!
          </p>
        </div>
      )}
      <div className="mt-2">
        <p className="flex justify-center text-sm mt-8 font-semibold text-blue-950 dark:text-white">
          Click on the icon to add fluid
        </p>
        <div className="flex justify-center items-center ">
          <div className="bg-[#ffffff47] rounded-xl w-fit transition-all duration-700">
            <div className="grid overflow-hidden justify-center place-items-center gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4  p-3 mt-2">
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 2); //  2 oz of water in coffee
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Espresso");
                }}
              >
                <Image
                  src={Coffee}
                  alt="Coffee"
                  width={imgIconSize}
                  height={imgIconSize}
                  className="test"
                />
                <span className="text-center text-sm sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Espresso
                  <br />
                  (2 oz)
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 10); // 10 oz of water in latte
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Latte");
                }}
              >
                <Image
                  src={Latte}
                  alt="Latte"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Latte
                  <br />
                  (10 oz)
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 8); // 8 oz of water in soda
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Soda Can");
                }}
              >
                <Image
                  src={Soda}
                  alt="Soda Can"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Soda
                  <br />
                  (8 oz)
                </span>
              </div>

              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 16); // 16 oz of beer in a pint
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Beer Pint");
                }}
              >
                <Image
                  src={Beer}
                  alt="Beer"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Beer Pint
                  <br />
                  (16 oz){" "}
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 5); // 5 oz in a glass of wine
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Glass of Wine");
                }}
              >
                <Image
                  src={WineGlass}
                  alt="Glass of Wine"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight wrap">
                  Glass of Wine
                  <br />
                  (5 oz)
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 8); //  8 oz in a glass of water
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Glass of Water");
                }}
              >
                <Image
                  src={GlassOfWater}
                  alt="Glass of Water"
                  width={60}
                  height={60}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Glass of Water
                  <br />
                  (8 oz)
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 17); //  17 oz in a water bottle
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Water Bottle");
                }}
              >
                <Image
                  src={WaterBottle}
                  alt="Water Bottle"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-wrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Water Bottle
                  <br />
                  (17 oz)
                </span>
              </div>
              <div>
                <label
                  className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Custom (oz)
                </label>
                <input
                  className="w-24 border-2 border-black bg-[#55C0F3] hover:bg-[#47a5d1] focus:bg-[#55c0F3] text-white dark:placeholder-white dark:border-white text-center font-bold py-2 px-2 rounded-xl transition-all duration-200 placeholder-white"
                  placeholder="..."
                  value={inputValues[username] || ""}
                  onChange={(e) => handleFluidChange(e, username)}
                  //onFocus={() => setFocusStates({ ...focusStates, [username]: true })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFluidSubmit(username, inputValues[username]);
                      // handleBlur(username);
                      setSubmitDone(true);
                      setConfirmationName(
                        inputValues[username] + "oz of fluid"
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
