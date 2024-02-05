'use client'
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
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import { get, ref } from 'firebase/database';
import { database } from '../firebaseConfig';
import WaterHubLogo from "/public/img/WaterHub.png";
import Reload from "/public/img/reload.png";

export default function Page() {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [name , setName] = useState("");
    const [averageGrade, setAverageGrade] = useState(0);
    const [objective, setObjective] = useState(0);
    const [selectedRange, setSelectedRange] = useState('week');

    useEffect(() => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        setName(username);

        const endDate = new Date();
        let startDate = new Date();

        switch(selectedRange) {
            case 'week':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '2 weeks':
                startDate.setDate(endDate.getDate() - 14);
                break;
            case 'month':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case '3 months':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case 'forever':
                // No change to startDate
                break;
        }

        if (username) {
            const recordsRef = ref(database, 'records');
            const objectiveRef = ref(database, `users/${username}/objective`);
    
            Promise.all([get(recordsRef), get(objectiveRef)]).then(([recordsSnapshot, objectiveSnapshot]) => {
                let objective = 0;
                if (objectiveSnapshot.exists()) {
                    objective = objectiveSnapshot.val();
                    setObjective(objective);
                } else {
                    console.log("No objective data available");
                }

                if (recordsSnapshot.exists()) {
                    const records = recordsSnapshot.val();
                    const userData = {};
                    const percentage = {};

                    Object.keys(records).forEach((date) => {
                        let recordDate = new Date(date);
                        if (recordDate >= startDate && recordDate <= endDate && records[date][username]) {
                            Object.keys(records[date][username]).forEach((time) => {
                                const quantity = records[date][username][time];
                                userData[date] = (userData[date] || 0) + quantity;
                            });

                            percentage[date] = Math.round((userData[date] / objective) * 100);
                        }
                    });

                    let sum = 0;
                    Object.values(percentage).forEach(p => sum += p);
                    let average = sum / Object.keys(percentage).length;
                    setAverageGrade(average);

                    setChartData({
                        labels: Object.keys(userData).sort(),
                        datasets: [{
                            label: 'Water Consumption',
                            data: Object.values(userData),
                            borderColor: 'rgb(85,192,243)',
                            backgroundColor: 'rgba(85,192,243, 0.5)',
                            pointRadius: 4, // Change the size of the points
                            tension: 0.4,
                            // add fade effect under the line
                            fill: {
                                target: 'origin',
                                above: 'rgba(85,192,243, 0.3)',
                            }

                        }, {
                            label: 'Ideal Consumption',
                            data: Array(Object.keys(userData).length).fill(objective), // Array of 'objective' values
                            borderColor: 'red',
                            borderWidth: 3,
                            borderDash: [10, 5], // line dashed
                            tension: 0,
                            pointRadius: 0, // No points along this line
                        }]
                    });
                } else {
                    console.log("No records data available");
                }
                setLoading(false);
            }).catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
        }
    }
}, [selectedRange]);


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
          <h1 className="text-center text-4xl mb-4 font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">
            {String(name).charAt(0).toUpperCase() + String(name).slice(1)}
            &apos;s History
          </h1>
        </div>
        <div className='flex items-center justify-center mb-6 '>
            <div className="flex flex-row items-center w-fit bg-[#ffffff3a] mt-2 p-2 justify-center rounded-lg">
              <h1 className="text-2xl  p-1 font-sans font-bold text-blue-950 dark:text-white ">
                Your {selectedRange} grade{" "}
              </h1>
                <span
                  className={`text-2xl font-bold backdrop-blur-md bg-[#ffffff60] p-1.5 rounded-lg ${
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
        </div>

        <div className='flex items-start justify-start'>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className='mb-2 p-2 border font-bold border-gray-300 rounded-lg bg-white/20 backdrop-blur-md dark:bg-slate-600 dark:text-white'
            >
              <option value="week">1 Week</option>
              <option value="2 weeks">2 Weeks</option>
              <option value="month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="forever">Forever</option>
            </select>
        </div>
        <div className="flex justify-center items-center h-64 sm:h-80 md:h-96  bg-white/20 backdrop-blur-md rounded-2xl p-2">
          {chartData && chartData.labels ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true, // Or false, depending on your data
                    max: objective + 15, // Set this to a value higher than your highest data point
                  },
                },
                plugins: {
                  title: {
                    display: true,
                    text: "Water Consumption",
                    font: {
                      size: 20,
                      weight: 'bold',
                    },
                  },
                },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <p>No data to display</p>
          )}
        </div>
      </main>
    );
}