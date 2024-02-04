"use client";
import { get, ref, push, set } from "firebase/database";
import { useEffect, useState } from "react";
import FluidMeter from "../components/FluidMeter";
import { database } from "../firebaseConfig";
import Link from "next/link"; // Linking to other pages
import Image from "next/image";
// import of images
import WaterHubLogo from "/public/img/WaterHub.png";
import Settings from "/public/img/settingImg.png";
import Reload from "/public/img/reload.png";
import NewUser from "/public/img/newUser.png";
import History from "/public/img/history.png";
import { user } from "@nextui-org/react";
import Global from "/public/img/global.png";

// Function to extract users for today
const extractUsersForToday = (records) => {
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
  console.log(formattedDateString);

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const time = hours + ":" + minutes + ":" + seconds;
  console.log(time);

  let usersToday = {};
  if(records[formattedDateString]) {
    Object.keys(records[formattedDateString]).forEach((userName) => {
      const userRecords = Object.entries(records[formattedDateString][userName]).map(([time, value]) => ({ time, value }));
      usersToday[userName] = userRecords;
    });
  }

  return usersToday;
};


/**
 * Represents the Home component.
 * @returns {JSX.Element} The rendered Home component.
 */
export default function Home() {
  // Define the state variable 'users' and the function to update it 'setUsers'
  const [users, setUsers] = useState([]);
  const [objectives, setObjectives] = useState({});
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  const [desiredValue, setDesiredValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userConsumption, setUserConsumption] = useState(0);


  // Fetch the username from local storage
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Fetch the data from the database when the component mounts
  useEffect(() => {
    const recordsRef = ref(database, "records");
    const usersRef = ref(database, "users");

    // Get the data of the user from local storage 
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
    
    // Fetch the records data
    get(recordsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const recordsSnapshot = snapshot.val();
          // from the recordsSnapshot, calculate the total amount of water drank by the specific user
          const totalAmount = Object.keys(recordsSnapshot).reduce((acc, date) => {
            if (recordsSnapshot[date][savedUsername]) {
              return acc + Object.values(recordsSnapshot[date][savedUsername]).reduce((acc, value) => acc + value, 0);
            }
            return acc;
          } , 0);

          setAccumulatedAmount(totalAmount);
          setDesiredValue((totalAmount * 0.0078125).toFixed(1));

          const usersToday = extractUsersForToday(recordsSnapshot);
          console.log(usersToday);
          usersToday[savedUsername] && setUserConsumption(usersToday[savedUsername].reduce((acc, { value }) => acc + value, 0));
        
          setLoading(false);
        } else {
          console.log("No snapshot data exists.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

  }, []);

  useEffect(() => {
    // Fetch users data
    const usersRef = ref(database, "users");
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const usersSnapshot = snapshot.val();
          const updatedObjectives = {};
          Object.keys(usersSnapshot).forEach((userName) => {
            // Assuming that each user object has an 'objective' field
            const userObjective = usersSnapshot[userName].objective;
            updatedObjectives[userName] = userObjective || "??";
          });
          setObjectives(updatedObjectives);
        } else {
          console.log("No snapshot data exists.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [users]);

  const onOptionChangeHandler = (event) => {
    switch (
      event.target.value // option1 | option2 | option3
    ) {
      case "option1": // gallon
        setDesiredValue((accumulatedAmount * 0.0078125).toFixed(1));
        break;
      case "option2": // liter
        setDesiredValue((accumulatedAmount * 0.0295735).toFixed(1));
        break;
      case "option3": // glasses
        setDesiredValue((accumulatedAmount / 8).toFixed(1));
        break;
      case "option4":
        setDesiredValue(accumulatedAmount.toFixed(1));
        break;
    }
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
    <main className="scroll-wrapper min-h-screen lg:p-14 flex-col">
      <div className="absolute p-0 right-16 top-3 flex flex-row-reverse items-center justify-center">
        <div className="scale-125 hover:scale-150 duration-200">
          <Link href="./dashboard">
            <Image
              src={Settings}
              alt="settings"
              width={32}
              height={32}
              className="bg-slate-600 p-1 rounded-md"
            />
          </Link>
        </div>
        <div className="mr-5">
          <Image
            src={Reload}
            alt="Reload"
            width={32}
            height={32}
            className="bg-slate-600 p-1.5 rounded-md scale-125 hover:scale-150 duration-200"
            onClick={() => {
              window.location.reload(true);
            }}
          />
        </div>
      </div>
      <div className="flex flex-col mt-8 sm:mt-4 items-center p-2 justify-center">
        <Image
          src={WaterHubLogo}
          alt="WaterHubLogo"
          width={100}
          height={100}
          className=" mt-6 dark:bg-slate-300 rounded-xl"
        />
        <h1 className="text-4xl font-sans text-center font-bold lg:mt-0 text-blue-950 dark:text-white capitalize">
          Hello {username}!
        </h1>
      </div>
      <div className="flex justify-center items-center">
        <Link href="./global">
          <div className="flex flex-row mt-4 mb-6 w-fit text-lg border-2 border-[#459dc5] bg-[#55c0F3] text-white dark:border-white text-center hover:scale-125 font-extrabold py-1 px-2 rounded-xl transition-all duration-200">
            <Image src={Global} alt="global" width={30} height={30} className="scale-100 mr-2" />
            <button className="">Global</button>
          </div>
        </Link>
      </div>
      <div className="mb-4 p-5 text-center backdrop-blur-sm bg-white/10 max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
        <section className="flex flex-col justify-center items-center">
            <div className="entry flex-row text-center mb-16">
              <span className="text-xl font-extrabold text-blue-950 dark:text-white">
                Today
              </span>
              <p className="font-bold text-sm mb-2 text-blue-950 dark:text-white">
                <span className="font-bold  text-xl">
                  {userConsumption || 0}
                </span>
                /{objectives[username] || "??"} oz
              </p>
              <FluidMeter
                percentage={(userConsumption / (objectives[username] + 10)) * 100}
              />

              <div className="flex flex-row items-center justify-center space-x-6 ">
                <Link href={`./fillMenu?username=${username}`}>
                  <div className="flex items-baseline justify-center">
                    <button className="mt-4 z-10 text-lg border-2 border-[#459dc5] bg-[#55c0F3] text-white dark:border-white text-center hover:scale-125 font-extrabold py-1 px-2 rounded-xl transition-all duration-200">
                      More +
                    </button>
                    <div className="absolute mt-5 w-14 z-0 h-8 bg-[#2a7892] rounded-xl transition-all duration-200 animate-ping" />
                  </div>
                </Link>
                <Link href={`./history?username=${username}`}>
                  <div className="flex flex-row scale-110 hover:scale-125 duration-200 cursor-pointer bg-[#55c0F3] border-[#459dc5] dark:border-white border-2 rounded-lg mt-4">
                    <Image src={History} alt="history" width={30} height={30} className="p-1" />
                    <span className="pt-1 pr-1 text-white dark:text-white font-bold">History</span>
                  </div>
                </Link>
              </div>
            </div>
        </section>

        <section className="text-center mx-auto">
          <div className="border-black dark:border-white border-2 p-2 inline-block rounded-lg">
            <p className="text-center inline-block font-bold text-xl">
              Total ever drank: {desiredValue}
            </p>
            <select
              className="ml-2 inline-block font-semibold border border-black rounded-sm text-xl bg-transparent"
              onChange={onOptionChangeHandler}
            >
              <option value="option1">gallons</option>
              <option value="option2">liters</option>
              <option value="option3">glasses</option>
              <option value="option4">ounces</option>
            </select>
          </div>
        </section>
      </div>
      <div className="flex justify-center mt-4">
        <p className="text-center text-sm font-bold text-blue-950 dark:text-white">
          Drinking enough water is vital for our health, as it aids in
          maintaining body temperature, lubricating joints, and removing waste.
          While individual hydration needs vary, a general guideline is to
          consume a variety of fluids and water-rich foods daily. The virtual
          dynamic water bottle is designed to help you reach these hydration
          targets with ease.
          <a
            className=""
            href="https://www.cdc.gov/healthyweight/healthy_eating/water-and-healthier-drinks.html"
            target="_blank"
          >
            <u> Learn more</u>
          </a>
        </p>
      </div>
    </main>
  );
}