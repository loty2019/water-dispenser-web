"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import { get, ref, push, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import FluidMeter from "../components/FluidMeter";
import Plant from '../components/Plant';
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
// styles
import "./individual.css";


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
  const [objectives, setObjectives] = useState();
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  const [desiredValue, setDesiredValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userConsumption, setUserConsumption] = useState(0);
  const [chartData, setChartData] = useState({});
  const [averageGrade, setAverageGrade] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const handleInputChange = (e) => {
    setPercentage(e.target.value);
  };

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
    async function fetchData() {
    // if the password is correct, fetch the records data
    let correctPassword = false;

    await get(ref(database, `users/${savedUsername}/password`))
      .then((snapshot) => {
        const dbPassword = snapshot.val().toString(); // the password from the database

        const localStoragePassword = localStorage.getItem('password');

        correctPassword = dbPassword === localStoragePassword;
        
      })
      .catch((error) => {
        console.log("Error", error);
        correctPassword = false;
      });

    if (correctPassword) {
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
            //console.log(usersToday);
            usersToday[savedUsername] && setUserConsumption(usersToday[savedUsername].reduce((acc, { value }) => acc + value, 0));
            
            // save the user consumption to the local storage
            localStorage.setItem("userConsumption", (usersToday[savedUsername].reduce((acc, { value }) => acc + value, 0)) );

            setLoading(false);
          } else {
            console.log("No snapshot data exists.");
          }
        })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
    }
  }
  fetchData();
  }, []);

  useEffect( () => {

    async function fetchData() {
    const username = localStorage.getItem("username");

    let correctPassword = false;

    await get(ref(database, `users/${username}/password`))
      .then((snapshot) => {
        const dbPassword = snapshot.val().toString(); // the password from the database

        const localStoragePassword = localStorage.getItem('password');

        correctPassword = dbPassword === localStoragePassword;
        
      })
      .catch((error) => {
        console.log("Error", error);
        correctPassword = false;
      });

    if (correctPassword) {

    const recordsRef = ref(database, "records");
    const objectiveRef = ref(database, `users/${username}/objective`);
    const endDate = new Date();
    let startDate = new Date();

    startDate.setDate(endDate.getDate() - 7); // 7 days ago

    // Use a Promise to fetch both records and objective in parallel
    Promise.all([get(recordsRef), get(objectiveRef)])
      .then(([recordsSnapshot, objectiveSnapshot]) => {
        let objective = 0;
        if (objectiveSnapshot.exists()) {
          objective = objectiveSnapshot.val();
          setObjectives(objective);
        } else {
          console.log("No objective data available");
        }

        if (recordsSnapshot.exists()) {
          const records = recordsSnapshot.val();
          const userData = {};
          const percentage = {};

          // Loop through the records by date
          Object.keys(records).forEach((date) => {
            let recordDate = new Date(date);
            if (
              recordDate >= startDate &&
              recordDate <= endDate &&
              records[date][username]
            ) {
              Object.keys(records[date][username]).forEach((time) => {
                const quantity = records[date][username][time];
                userData[date] = (userData[date] || 0) + quantity;
              });

              percentage[date] = Math.round((userData[date] / objective) * 100);
            }
          });

          //console.log(percentage)
          // do an average of all the percentages
          let sum = 0;
          for (let i in percentage) {
            if (percentage[i] == 0) {
              delete percentage[i];
              continue;
            }
            sum += percentage[i];
          }
          let average = sum / Object.keys(percentage).length;
          setAverageGrade(average); // set the average grade

          // Convert userData to chartData
          setChartData({
            labels: Object.keys(userData).sort(),
            datasets: [
              {
                label: "Water Consumption",
                data: Object.values(userData),
                borderColor: "rgb(85,192,243)",
                backgroundColor: "rgba(85,192,243, 0.5)",
                pointRadius: 4, // Change the size of the points
                tension: 0.4,
                // add fade effect under the line
                fill: {
                  target: "origin",
                  above: "rgba(85,192,243, 0.3)",
                },
              },
              {
                label: "Ideal Consumption",
                data: Array(Object.keys(userData).length).fill(objective), // Array of 'objective' values
                borderColor: "red",
                borderWidth: 3,
                borderDash: [10, 5], // line dashed
                tension: 0,
                pointRadius: 0, // No points along this line
              },
            ],
          });
        } else {
          console.log("No records data available");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
    }
  }
  fetchData();
  }, []);

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
    <main>
      <div>
        <div className="absolute p-0 left-5 top-3 flex flex-row-reverse items-center justify-center">
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
      </div>

      <div className="flex flex-col mt-8 mb-6 sm:mt-4 items-center p-2 justify-center">
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

      <div className="flex justify-center items-center lg:px-16">
        <div className="min-w-full items-center justify-center grid gap-6 sm:grid-cols-2">
          <div className="flex justify-center items-center row-span-3 p-5 h-full text-center backdrop-blur-sm bg-white/20 rounded-3xl">
            <div className="absolute top-4 sm:top-12 left-5 lg:left-14 bg-white/30 rounded-xl p-1">
              <p className=" font-sans font-bold text-md">Weekly</p>
              <p className=" font-sans font-bold text-md">Grade</p>
              <span
                className={`text-xl font-bold p-1.5 rounded-lg ${
                  averageGrade >= 60
                    ? "text-green-600 dark:text-green-400"
                    : averageGrade < 40
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {Math.round(averageGrade)}%
              </span>
            </div>
            <section className="">
              <div className="entry flex-row text-center mb-4">
                <span className="text-xl font-extrabold text-blue-950 dark:text-white">
                  Today
                </span>
                <p className="font-bold text-sm mb-4 text-blue-950 dark:text-white">
                  <span className="font-bold  text-xl">
                    {userConsumption || 0}
                  </span>
                  /{objectives || "??"} oz
                </p>
                <div className="mb-6 scale-110">
                  <FluidMeter
                    percentage={(userConsumption / (objectives + 10)) * 100}
                  />
                </div>
                <div className="flex flex-row items-center justify-center space-x-6 mt-2 ">
                  <Link href={`./fillMenu?username=${username}`}>
                    <div className="flex items-baseline justify-center">
                      <button className="mt-3 z-10 scale-125 text-lg border-2 border-[#459dc5] bg-[#55c0F3] text-white dark:border-white text-center hover:bg-[#469fc8] font-extrabold py-1 px-2 rounded-lg transition-all duration-200">
                        More +
                      </button>
                      <div className="absolute mt-3.5 w-16 h-9 z-0 bg-[#37758a] rounded-lg transition-all duration-500 animate-ping" />
                    </div>
                  </Link>
                  <Link href={`./history?username=${username}`}>
                    <div className="flex ml-6 flex-row scale-125 hover:bg-[#469fc8] duration-200 cursor-pointer bg-[#55c0F3] border-[#459dc5] dark:border-white border-2 rounded-lg mt-3">
                      <Image
                        src={History}
                        alt="history"
                        width={30}
                        height={30}
                        className="p-1"
                      />
                      <span className="pt-1 pr-1 py-1 text-white dark:text-white font-bold">
                        History
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </section>
          </div>

          <Link href="./global">
            <div className="flex justify-center items-center p-4  border-[#459dc5] hover:bg-[#469fc8] bg-[#55c0F3] border-2 text-white dark:border-white rounded-xl">
              <div className="flex flex-row text-lg text-white text-center font-extrabold">
                <Image
                  src={Global}
                  alt="global"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                <button className="">Global View</button>
              </div>
            </div>
          </Link>

          <div className="text-center">
            <div className="flex flex-col justify-center items-center backdrop-blur-sm bg-white/20 py-4 rounded-xl">
              <p className="text-center inline-block font-bold text-xl">
                Total you ever drank: {desiredValue}
              </p>
              <select
                className="ml-4 font-semibold border border-black rounded-sm text-xl bg-transparent"
                onChange={onOptionChangeHandler}
              >
                <option value="option1">gallons</option>
                <option value="option2">liters</option>
                <option value="option3">glasses</option>
                <option value="option4">ounces</option>
              </select>
            </div>
          </div>

          <Link href={`./history?username=${username}`}>
            <div className="flex justify-center items-center h-64 bg-white/20 backdrop-blur-md rounded-2xl p-2">
              {chartData && chartData.labels ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: objectives + 10,
                      },
                    },
                    plugins: {
                      title: {
                        display: true,
                        text: "Week",
                        font: {
                          size: 20,
                          weight: "bold",
                        },
                      },
                      legend: {
                        display: false,
                      },
                    },
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <p>No data to display</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      <div className="flex justify-center mb-8 mt-6">
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
