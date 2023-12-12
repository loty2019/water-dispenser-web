'use client' 
import Image from 'next/image'
import { useState,useEffect } from 'react'
import { push, get, ref, set } from 'firebase/database'
import { database } from './firebaseConfig'
import FluidMeter from './components/FluidMeter'

// Function to extract users for today
const extractUsersForToday = (records) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const adjustedDate = new Date();
  adjustedDate.setDate(adjustedDate.getDate() - 1);
  const adjustedDateString = adjustedDate.toISOString().split('T')[0];
  

  return records[adjustedDateString] || [];
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
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  

  // Fetch the data from the database when the component mounts
  useEffect(() => {
    const usersRef = ref(database, 'records');
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Extract users for today
          const todayUsers = extractUsersForToday(snapshot.val());

          // Convert the todayUsers data into an array of users
          const usersArray = Object.entries(todayUsers).map(([name, data]) => ({
            name,
            data: Object.entries(data).map(([time, value]) => ({ time, value })),
          }));

          console.log(usersArray)
          // Update the 'users' state with the fetched data for today
          setUsers(usersArray);
        } else {
          console.error('No data available from firebase');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);


  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-4 lg:p-24">
      
      <h1 className="text-4xl font-mono">How much water have you drunk today?</h1>

      <div className="mb-4  text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <section className="h-16 flex justify-evenly">
          {users.map((user, index) => (
            <div className="entry mr-8 text-center" key={index}>
              <h1 className="text-2xl md:text-4xl capitalize">{user.id}</h1>
              <p className='text-sm mb-4'>drank: {getSum(user)} oz</p>
              <FluidMeter percentage={getSum(user)/125 * 100}/>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
