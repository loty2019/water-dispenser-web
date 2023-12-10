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

  // Create a reference to the 'water_consumption' node in the database
  
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
  
    // Get today's date in the format "YYYY-MM-DD"
    const todayDate = new Date().toISOString().split('T')[0];
  // console.log(todayDate)
    // Regular expression to match the date part in the keys
    const dateRegex = /^(\d{4}-\d{2}-\d{2})T/;
  
    // Iterate over the properties of the object
    for (let key in obj) {
      // Check if the property is not 'id' and is an object
      if (key !== 'id' && typeof obj[key] === 'object') {
        // Extract the date using the regular expression
        const match = key.match(dateRegex);
  
        // Check if there is a match and the extracted date is today
        console.log(todayDate)
        console.log(match && match[1])
        if (match && match[1] === todayDate) {
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

  console.log(users);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="flex text-center text-5xl">How much water have you drunk today?</h1>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
      </div>

      <div className="mb-32  text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <section className="h-16 flex justify-evenly">
          {users.map((user, index) => (
            <div className="entry mr-8" key={index}>
              <h1 className="text-sm md:text-4xl capitalize">{user.id}</h1>
              <p>Amount drank today: {sumTodayValues(user)} oz</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
