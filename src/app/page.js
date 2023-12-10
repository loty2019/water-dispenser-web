'use client' 
import Image from 'next/image'
import { useState,useEffect } from 'react'
import { push, get, ref, set } from 'firebase/database'
import { database } from './firebaseConfig'

/**
 * Represents the Home component.
 * @returns {JSX.Element} The rendered Home component.
 */
export default function Home() {
  // Define the state variable 'users' and the function to update it 'setUsers'
  const [users, setUsers] = useState([]);

  // Fetch the data from the database when the component mounts
  useEffect(() => {
    const usersRef = ref(database, 'water_consumption');
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Convert the snapshot data into an array of users
          const usersArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
          }));
          // Update the 'users' state with the fetched data
          setUsers(usersArray);
        } else {
          console.error('No data available from firebase');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  function sumTodayValues(obj) {
    let sum = 0;
  
    // Get yesterday's date in the format "YYYY-MM-DD", because there is a time different in Firebase DB and NextJS current time
    let yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate = yesterdayDate.toISOString().split('T')[0];
  
    // Regular expression to match the date part in the keys
    const dateRegex = /^(\d{4}-\d{2}-\d{2})T/;
  
    // Iterate over the properties of the object
    for (let key in obj) {
      // Check if the property is not 'id' and is an object
      if (key !== 'id' && typeof obj[key] === 'object') {
        // Extract the date using the regular expression
        const match = key.match(dateRegex);
  
        // Check if there is a match and the extracted date is today
        if (match && match[1] === yesterdayDate) {
          // Iterate over the properties of the nested object
          for (let nestedKey in obj[key]) {
            // Check if the nested object has a numeric value
            if (obj[key].hasOwnProperty(nestedKey) && typeof obj[key][nestedKey] === 'number') {
              sum += obj[key][nestedKey];
            }
          }
        }
      }
    }
  
    return sum;
  }

  function switchTheme() {
    
  } 


  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-4 lg:p-24">
      <div class="block dark:hidden absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <button className=''>Switch Theme</button>
      <h1 className="text-4xl font-mono">How much water have you drunk today?</h1>

      <div className="mb-32  text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <section className="h-16 flex justify-evenly">
          {users.map((user, index) => (
            <div className="entry mr-8" key={index}>
              <h1 className="text-2xl md:text-4xl capitalize">{user.id}</h1>
              <p className='text-sm'>drank: {sumTodayValues(user)} oz</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
