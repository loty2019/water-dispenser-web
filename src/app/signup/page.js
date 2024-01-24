'use client'
import React from 'react';
import { useEffect, useState } from 'react'
import { database } from '../firebaseConfig'
import { get, ref, push, set } from 'firebase/database'
import Link from 'next/link'; // Linking to other pages

import Image from 'next/image';
import Reload from '/public/img/reload.png';
import WaterHubLogo from '/public/img/WaterHub.png';


export default function Page() {
    const [username, setUsername] = useState('');
    const [exercise, setExercise] = useState('');
    const [weight, setWeight] = useState('');
    const [password, setPassword] = useState('');

    const handleFluidSubmit = (name, value) => {
        // get formatted string for the date
        const todayDate = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
        const options = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
        const todayDateString = new Date(todayDate).toLocaleString('en-US', options).split(',')[0].replace(/\//g, '-');
        const [month, day, year] = todayDateString.split('-');
        const formattedDateString = `${year}-${month}-${day}`;
    
        // get formatted time hh:mm:ss in the US east coast
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const time =  hours + ':' + minutes + ':' + seconds;
        console.log(time);
    
        // create path to store the new values
        let path = `records/${formattedDateString}/${name}/${time}`;
        const fluidRef = ref(database, path);
        set(fluidRef, parseInt(value))
          .then(() => {
            console.log('New fluid record added to the database');
          })
          .catch((error) => {
            console.error('Error adding new fluid record to the database:', error);
          });
    };


    const newUserHandler = (e) => {
        // Calculate daily water intake
        const baseWaterIntake = weight * (2 / 3); // Base intake based on weight
        const additionalWater = (parseInt(exercise) / 30) * 12; // Additional water based on exercise
        
        const totalWaterIntake = Math.round(baseWaterIntake + additionalWater);
    
        // set on firebase the new user under the path 'users/username'
        const newUserRef = ref(database, `users/${username}`); 
        set(newUserRef, { objective: totalWaterIntake, password: password })
          .then(() => {
            console.log('New user added to the database');
          })
          .catch((error) => {
            console.error('Error adding new user to the database:', error);
          });
        
        handleFluidSubmit(username, 0);
        // redirect to the home page
        window.location.href = '/';
    };

    return (
      <main>
        <div className="absolute p-0 left-4  top-4 flex flex-row-reverse items-center justify-center">
            <Link href="./">
              <button className="bg-slate-600 p-2 font-sans font-bold text-white rounded-lg hover:scale-110 active:scale-100 duration-200">← Go Back</button>
            </Link>
        </div>
        <div htmlFor="reloadButton" className="absolute p-0 right-16 top-3 flex flex-row-reverse items-center justify-center scale-125 hover:scale-110 duration-200">
          <Image 
            src={Reload} 
            alt="reload" 
            width={32} height={32} 
            className="bg-slate-600 mr- p-1.5 rounded-md hover:ease-in-out duration-300"
            onClick={() => {window.location.reload(true)}}
          />
        </div>  
        <div className="flex flex-col items-center mt-28 p-2 justify-center">
          <Image src={WaterHubLogo} alt="WaterHubLogo" width={100} height={100} className="mr-2 mb-2 dark:bg-slate-300 rounded-xl" />
          <h1 className="text-4xl font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">SignUp</h1>
        </div>
        <div className="mb-4 p-5 text-center backdrop-blur-sm bg-white/10 lg:max-w-xl lg:w-full lg:mb-0 lg:text-left mx-auto rounded-3xl">
            <div className="flex flex-col mt-4 mb-2 items-center p-2 justify-center">
         <label htmlFor="username">
            <label htmlFor="first_name" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">First name</label>
           <input
             type="text"
             id="username"
             className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
             placeholder="John"
             value={username}
             onChange={(e) => setUsername(e.target.value.toLowerCase())}
           />
         </label>
         <label htmlFor="weight">
            <label htmlFor="first_name" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Weight (lb)</label>
           <input
             type="number"
             id="weight"
             className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
             placeholder="165"
             value={weight}
             onChange={(e) => setWeight(e.target.value)}
           />
         </label>
         <label htmlFor="exercise">
            <label htmlFor="first_name" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Daily Exercise (min)</label>
           <input
             type="number"
             id="exercise"
             className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
             placeholder="60"
             value={exercise}
             onChange={(e) => setExercise(e.target.value)}
           />
         </label>
         <label htmlFor="password">
            <label htmlFor="first_name" className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Password</label>
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
           onClick={newUserHandler}
         >
           Submit
         </button>
        </div>
        </div>
        <div className="flex justify-center mt-4">
        <p className="text-center text-sm font-bold text-blue-950 dark:text-white">
            Daily water intake is calculated based on your weight and exercise.
            <a className='' href="https://www.wku.edu/news/articles/index.php?view=article&articleid=2762&return=archive" target="_blank"><u> Learn more about how</u></a>
        </p>
      </div>
      </main>
    );
}