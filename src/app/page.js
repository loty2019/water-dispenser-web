'use client'
import { get, ref } from 'firebase/database'
import { useEffect, useState } from 'react'
import FluidMeter from './components/FluidMeter'
import { database } from './firebaseConfig'

// Function to extract users for today
const extractUsersForToday = (records) => {
  const todayDate = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const options = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
  const todayDateString = new Date(todayDate).toLocaleString('en-US', options).split(',')[0].replace(/\//g, '-');
  const [month, day, year] = todayDateString.split('-');
  const formattedDateString = `${year}-${month}-${day}`;
  console.log(formattedDateString);

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
    <main className=" min-h-screen p-4 lg:p-24 flex-col space-y-10">

      <h1 className=" text-4xl font-mono text-blue-950 dark:text-white flex justify-center ">How much water did you drink today?</h1>

      <div className="mb-4 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left mx-auto">
        <section className="flex flex-col lg:flex-row justify-evenly">
          {users.map((user, index) => (
            <div className="entry text-center mb-16" key={index}>
              <h1 className="text-2xl md:text-4xl capitalize">{user.name}</h1>
              <p className='font-bold  mb-2 text-blue-950 dark:text-white'>drank: {getSum(user)} oz</p>
              <FluidMeter percentage={getSum(user) / 125 * 100} />
            </div>
          ))}
        </section>

        <section className='text-center mx-auto'>
          <div className='border border-black p-2 inline-block rounded-md'>
            <p className='text-center inline-block font-bold text-xl'>Total ever drank: {desiredValue}</p>
            <select className='ml-2 inline-block font-semibold border border-black rounded-sm text-xl dark:bg-transparent' onChange={onOptionChangeHandler}>
              <option value="option1">gallons</option>
              <option value="option2">liters</option>
              <option value="option3">glasses</option>
              <option value="option4">ounces</option>
            </select>
          </div>
        </section>

      </div>
    </main>
  );
}
