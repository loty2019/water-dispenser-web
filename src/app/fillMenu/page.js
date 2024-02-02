'use client'
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
import BeerBottle from "/public/img/beerbottle.png";
import WhiteHydro from "/public/img/WhiteHydro.png";
import PurpleHydro from "/public/img/PurpleHydro.png";

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
  const [addedItems, setAddedItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      } else {
        setLoading(false);
        console.log("No data available");
      }
    });
  }, []);

  const handleFluidSubmit = (name, value, itemName, imgSrc) => {

    setAddedItems((prevItems) => [
      ...prevItems,
      { name: itemName, src: imgSrc, amount: value },
    ]);


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

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="mb-4">
              <Image src={WaterHubLogo} alt="WaterHubLogo" width={100} height={100} className="dark:bg-slate-300 rounded-xl scale-125" />
            </div>
            <div role="status" className="scale-150">
                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
            </div>
        </div>
    );
  }

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
      
        <div className="flex justify-center mt-5">
          <div className={`flex flex-row backdrop-blur-md bg-[#ffffffc9] w-fit rounded-xl ${addedItems.length === 0 ? 'bg-[#ff5b5b92]' : 'bg-[#ffffffa4]'}`}>
            
            {addedItems.length === 0 && (
             <p className="text-center text-sm mt-1 p-4 font-semibold text-blue-950 dark:text-white">Nothing added so far!!</p>
            )}
            {addedItems.length !== 0 && (
              <>
                <p className="mt-4 mb-4 font-semibold pl-2 pr-2">You added so far:</p>
                <div className="flex flex-wrap justify-center items-center">
                  {addedItems.map((item, index) => (
                    <div key={index} className="flex flex-col p-1 justify-center items-center font-extrabold">
                      <Image src={item.src} alt={item.name} width={40} height={40} />
                      {/* Optionally, you can include the name or quantity below each image */}
                      {/* <p>{`${item.name} (${item.amount} oz)`}</p> */}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
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
                  handleFluidSubmit(username, 2, "Espresso", Coffee); //  2 oz of water in coffee
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
                  <span className="font-extrabold">(2 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 10, "Latte", Latte); // 10 oz of water in latte
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
                  <span className="font-extrabold">(10 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 8, "Soda Can", Soda); // 8 oz of water in soda
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
                  <span className="font-extrabold">(8 oz)</span>
                </span>
              </div>

              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 16, "Beer Pint", Beer); // 16 oz of beer in a pint
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
                  <span className="font-extrabold">(16 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 12, "Beer Bottle", BeerBottle); // 16 oz of beer in a pint
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Beer Bottle");
                }}
              >
                <Image
                  src={BeerBottle}
                  alt="Beer"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Beer Bottle
                  <br />
                  <span className="font-extrabold">(12 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 5, "Wineglass", WineGlass); // 5 oz in a glass of wine
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
                  <span className="font-extrabold">(5 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 8, "Glass of Water", GlassOfWater); //  8 oz in a glass of water
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
                  <span className="font-extrabold">(8 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 17, "Water Bottle", WaterBottle); //  17 oz in a water bottle
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
                  <span className="font-extrabold">(17 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 24, "Hydroflask", WhiteHydro); //  24 oz in a hydroflask
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Hydroflask");
                }}
              >
                <Image
                  src={WhiteHydro}
                  alt="Hydroflask"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Lorenzo
                  <br /> Hydroflask
                  <br />
                  <span className="font-extrabold">(24 oz)</span>
                </span>
              </div>
              <div
                className="textIconWrapper"
                onClick={() => {
                  handleFluidSubmit(username, 32, "Hydroflask", PurpleHydro); //  24 oz in a
                  // handleBlur(username);
                  setSubmitDone(true);
                  setConfirmationName("Hydroflask");
                }}
              >
                <Image
                  src={PurpleHydro}
                  alt="Hydroflask"
                  width={imgIconSize}
                  height={imgIconSize}
                  className=""
                />
                <span className="text-sm text-center text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">
                  Laci
                  <br /> Hydroflask
                  <br />
                  <span className="font-extrabold">(32 oz)</span>
                </span>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
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
      <div className="flex justify-center items-center mt-5">
        <Link href="./">
          <button className="bg-[#55C0F3] hover:bg-[#47a5d1] shadow-lg border-2 border-blue-950 p-2 font-sans font-bold text-slate-200 rounded-lg hover:scale-110 active:scale-100 duration-200">
            Done
          </button>
        </Link>
      </div>
    </main>
  );
}
