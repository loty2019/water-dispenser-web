'use client'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import { get, ref } from 'firebase/database';
import { database } from '../firebaseConfig';
import WaterHubLogo from "/public/img/WaterHub.png";
import Reload from "/public/img/reload.png";
import {CircularProgress} from '@nextui-org/react';

export default function Page() {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [name , setName] = useState("");
    const [averageGrade, setAverageGrade] = useState(0);
    const [gradeColor, setGradeColor] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('username');
            setName(username);

            if (username) {
                const recordsRef = ref(database, 'records');
                const objectiveRef = ref(database, `users/${username}/objective`);
    
                // Use a Promise to fetch both records and objective in parallel
                Promise.all([get(recordsRef), get(objectiveRef)]).then(([recordsSnapshot, objectiveSnapshot]) => {
                    let objective = 0;
                    if (objectiveSnapshot.exists()) {
                        objective = objectiveSnapshot.val();
                    } else {
                        console.log("No objective data available");
                    }
    
                    if (recordsSnapshot.exists()) {
                        const records = recordsSnapshot.val();
                        const userData = {};
                        const percentage = {};

                        // Loop through the records by date
                        Object.keys(records).forEach((date) => {
                            if (records[date][username]) {
                                // Loop through the times for this user on this date
                                Object.keys(records[date][username]).forEach((time) => {

                                    const quantity = records[date][username][time];
                                    
                                    // Add the quantity to the existing total for this date
                                    userData[date] = (userData[date] || 0) + quantity;
                                    
                                });

                                // calculate the percentage of the objective
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
                        setAverageGrade(average);  
                        
                        // set the color of the grade
                        if (average >= 60) {
                            setGradeColor('success');
                        } else if (average < 60) {
                            setGradeColor('warning');
                        }
                        else if (average < 40){
                            setGradeColor('danger');
                        }

                        // Convert userData to chartData
                        setChartData({
                            labels: Object.keys(userData).sort(),
                            datasets: [{
                                label: 'Water Consumption',
                                data: Object.values(userData),
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                pointRadius: 4, // Change the size of the points
                                tension: 0.4,

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
    }, []);

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
        <div className="absolute p-0 left-4  top-4 flex flex-row-reverse items-center justify-center">
            <Link href="./">
              <button className="bg-slate-600 p-2 font-sans font-bold text-slate-200 rounded-lg hover:scale-110 active:scale-100 duration-200">← Go Back</button>
            </Link>
        </div>
        <div className="absolute p-0 right-16 top-3 flex flex-row-reverse items-center justify-center scale-125 hover:scale-150 duration-200">
          <Image 
            src={Reload} 
            alt="settings" 
            width={32} height={32} 
            className="bg-slate-600 mr- p-1.5 rounded-md hover:ease-in-out duration-300"
            onClick={() => {window.location.reload(true)}}
          />
        </div>    
        <div className="flex flex-col items-center mt-10 p-2 justify-center">
            <Image src={WaterHubLogo} alt="WaterHubLogo" width={100} height={100} className="dark:bg-slate-300 rounded-xl" />
            <h1 className="text-4xl mb-4 font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">{String(name).charAt(0).toUpperCase() + String(name).slice(1)}&apos;s History</h1>
        </div>
        <div className="flex flex-row items-center mt-2 p-2 justify-center">
            <h1 className="text-2xl mb-4 font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">Your grade </h1>
            <div className='ml-2 mb-2'>
                <CircularProgress
                    size="lg"
                    value={averageGrade}
                    showValueLabel={true}
                    color= {gradeColor}
                    aria-label="Average Grade"
                    className='backdrop-blur-md rounded-2xl'
                />
            </div>
        </div>
        <div className='flex justify-center items-center'>
            {chartData && chartData.labels ? (
                <Line data={chartData} options={{ responsive: true }} className='bg-[#ffffff60] mb-4 mt-2 backdrop-blur-md rounded-2xl ml-4 mr-4 p-2 md:mr-10 md:ml-10 lg:ml-32 lg:mr-32' />
            ) : (
                <p>No data to display</p>
            )}
        </div>
      </main>
    );
}