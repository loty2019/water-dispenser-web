"use client";
import { get, ref, push, set } from "firebase/database";
import { useEffect, useState } from "react";
import FluidMeter from "./components/FluidMeter";
import { database } from "./firebaseConfig";
import Link from "next/link"; // Linking to other pages
import Image from "next/image";
// import of images
import WaterHubLogo from "/public/img/WaterHub.png";
import Settings from "/public/img/settingImg.png";
import Reload from "/public/img/reload.png";
import NewUser from "/public/img/newUser.png";
import History from "/public/img/history.png";

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

  return records[formattedDateString] || [];
};

function getSum(user) {
  return user.data.reduce((sum, entry) => sum + entry.value, 0);
}

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
  const [focusStates, setFocusStates] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [submitDone, setSubmitDone] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmationName, setConfirmationName] = useState({});


  const handleFluidChange = (event, name) => {
    setInputValues({ ...inputValues, [name]: event.target.value });
    //setFluidValue(event.target.value);
    //setFocusStates({ ...focusStates, [name]: true });
  };

  const handleBlur = (name) => {
    // Set a timeout to allow click event to fire before hiding the button
    setTimeout(() => {
      setFocusStates({ ...focusStates, [name]: false });
    }, 100);
  };

  const handleSubmitDone = (userName) => {
    setTimeout(() => {
      setSubmitDone({ ...submitDone, [userName]: true }); // Set it back to true after 2 seconds
    }, 500);
    setTimeout(() => {
      setSubmitDone({ ...submitDone, [userName]: false }); // Set it back to true after 2 seconds
    }, 4000);
  };

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
          console.log("Fluid value added to the database");

          // Update the 'users' state with the fetched data for today
          const updatedUsers = [...users];
          const userIndex = updatedUsers.findIndex(
            (user) => user.name === name
          );
          if (userIndex !== -1) {
            updatedUsers[userIndex].data.push({ time, value: parseInt(value) });
            setUsers(updatedUsers);
          }
        })
        .catch((error) => {
          console.error("Error adding fluid value to the database:", error);
        });
    setInputValues({ ...inputValues, [name]: "" });
    handleSubmitDone(name);
  };

  // Fetch the data from the database when the component mounts
  useEffect(() => {
    const usersRef = ref(database, "records");
    
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          // Extract users for today
          const todayUsers = extractUsersForToday(snapshot.val());

          // Convert the todayUsers data into an array of users
          const usersArray = Object.entries(todayUsers).map(([name, data]) => ({
            name,
            data: Object.entries(data).map(([time, value]) => ({
              time,
              value,
            })),
          }));

          console.log(usersArray);
          // Update the 'users' state with the fetched data for today
          setUsers(usersArray);
          setAccumulatedAmount(snapshot.val().forever_consumption);
          setDesiredValue(
            (snapshot.val().forever_consumption * 0.0078125).toFixed(1)
          );
        } else {
          console.error("No data available from firebase");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
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
    <main className="scroll-wrapper min-h-screen p-4 lg:p-14 flex-col">
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
      <div className="flex flex-col sm:flex-row mt-8 sm:mt-4 items-center p-2 justify-center">
        <Image
          src={WaterHubLogo}
          alt="WaterHubLogo"
          width={100}
          height={100}
          className=" mt-6 dark:bg-slate-300 rounded-xl"
        />
        <h1 className="text-4xl font-sans text-center font-bold lg:mt-0 text-blue-950 dark:text-white">
          How much water did you drink today?
        </h1>
      </div>
      <div className="flex mb-6 items-center p-2 justify-center">
        <div className="scale-110 hover:scale-125 duration-200 cursor-pointer">
          <Link href="./signup">
            <Image
              src={NewUser}
              alt="new user"
              width={30}
              height={30}
              className="bg-slate-600 mr-2 p-1 rounded-md"
            />
          </Link>
        </div>
        <h1 className="text-lg font-sans font-bold text-blue-950 dark:text-white">
          Register!
        </h1>
      </div>
      <div className="mb-4 p-5 text-center backdrop-blur-sm bg-white/10 lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left mx-auto rounded-3xl">
        <section className={`grid grid-cols-2 md:grid-cols-3 justify-evenly`}>
          {users.map((user, index) => (
            <div className="entry flex-row text-center mb-16" key={index}>
              <h1 className="text-2xl font-bold md:text-4xl capitalize">
                {user.name}
              </h1>
              <span className="text-sm font-semibold text-blue-950 dark:text-white">
                Today
              </span>
              <p className="font-bold text-sm mb-2 text-blue-950 dark:text-white">
                <span id={user.name} className="font-bold  text-xl">
                  {getSum(user)}
                </span>
                /{objectives[user.name] || "??"} oz
              </p>
              <FluidMeter
                percentage={(getSum(user) / (objectives[user.name] + 10)) * 100}
              />

              <div className="flex flex-col items-center justify-center md:flex-row md:space-x-4 ">
                <Link href={`./fillMenu?username=${user.name}`}>
                  <div className="flex items-baseline justify-center">
                    <button className="mt-4 z-10 text-lg border-2 border-[#000000b8] bg-[#55c0F3] text-white dark:border-white text-center hover:scale-125 font-extrabold py-1 px-2 rounded-xl transition-all duration-200">
                      More +
                    </button>
                    <div className="absolute mt-5 w-14 z-0 h-8 bg-[#2a7892] rounded-xl transition-all duration-200 animate-ping" />
                  </div>
                </Link>
                <div className="scale-110 hover:scale-150 duration-200 cursor-pointer">
                  <Link href={`./history?username=${user.name}`}>
                    <Image
                      src={History}
                      alt="history"
                      width={33}
                      height={30}
                      className="bg-[#55c0F3] border-[#000000b8] border-2 p-1 rounded-lg mt-4"
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
