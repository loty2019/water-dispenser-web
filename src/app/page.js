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

function getDesireValue(value) {

  
}

/**
 * Represents the Home component.
 * @returns {JSX.Element} The rendered Home component.
 */
export default function Home() {
  // Define the state variable 'users' and the function to update it 'setUsers'
  const [users, setUsers] = useState([]);
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  const [desiredValue, setDesiredValue] = useState(0);
  

  // Fetch the data from the database when the component mounts
  useEffect(() => {
    const usersRef = ref(database, 'records');
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val())
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
          setAccumulatedAmount(snapshot.val().forever_consumption)
          setDesiredValue((snapshot.val().forever_consumption * 0.0078125).toFixed(1));
        } else {
          console.error('No data available from firebase');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const onOptionChangeHandler = (event) => {
    switch (event.target.value) { // option1 | option2 | option3
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


  return (
    <main className=" min-h-screen p-4 lg:p-24">
      
      <h1 className=" text-4xl font-mono text-blue-950 dark:text-white">How much water have you drunk today?</h1>

      <div className="mb-4  text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
        <section className="flex flex-col lg:flex-row justify-evenly">
          {users.map((user, index) => (
            <div className="entry text-center mb-16" key={index}>
              <h1 className="text-2xl md:text-4xl capitalize">{user.name}</h1>
              <p className='font-bold  mb-2 text-blue-950 dark:text-white'>drank: {getSum(user)} oz</p>
              <FluidMeter percentage={getSum(user)/125 * 100}/>
            </div>
          ))}
        </section>

        <section className='text-center'>
          <p className='text-center inline-block'>Total ever drank: {desiredValue}</p>
          <select className='ml-2 inline-block' onChange={onOptionChangeHandler}>
                    <option value="option1">Gallon</option>
                    <option value="option2">Liter</option>
                    <option value="option3">Glasses</option>
                    <option value="option4">oz</option>
          </select>
        </section>
      </div>
    </main>
  );
}
