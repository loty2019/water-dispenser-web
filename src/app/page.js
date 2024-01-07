'use client'
import { get, ref, push, set } from 'firebase/database'
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

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const time =  hours + ':' + minutes + ':' + seconds;
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
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  const [desiredValue, setDesiredValue] = useState(0);
  const [focusStates, setFocusStates] = useState({});
  const [inputValues, setInputValues] = useState({});
  

  const handleFluidChange = (event, name) => {
    setInputValues({ ...inputValues, [name]: event.target.value });
    //setFluidValue(event.target.value);
    setFocusStates({ ...focusStates, [name]: true });
  };

  const handleBlur = (name) => {
    // Set a timeout to allow click event to fire before hiding the button
    setTimeout(() => {
      setFocusStates({ ...focusStates, [name]: false });
    }, 500);
  };


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

    // set values in the database
    set(fluidRef, parseInt(value))
      .then(() => {
        console.log('Fluid value added to the database');

        // Update the 'users' state with the fetched data for today
        const updatedUsers = [...users];
        const userIndex = updatedUsers.findIndex(user => user.name === name);
        if (userIndex !== -1) {
          updatedUsers[userIndex].data.push({ time, value: parseInt(value) });
          setUsers(updatedUsers);
        }
      })
      .catch((error) => {
        console.error('Error adding fluid value to the database:', error);
      });
      setInputValues({ ...inputValues, [name]: '' });
  };
  
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

  // [lorenzo, +{laci}]
  // lorenzo button 1 => {lorenzo: [24], if theres no laci in firebase that date, then laci: [0]}
  // laci button 2 => {lorenzo: [0], laci: [32]}

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
  
// <input className="mt-7 bg-transparent border border-black hover:bg-[#55C0F3] focus:bg-[#55c0F3] text-white text-center font-bold py-2 rounded-full transition-all duration-200 placeholder-black" placeholder="Add Fluid"></input>

  return (
    <main className=" min-h-screen p-4 lg:p-24 flex-col space-y-10">

      <h1 className=" text-4xl font-mono text-blue-950 dark:text-white flex justify-center ">How much water did you drink today?</h1>

      <div className="mb-4 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left mx-auto">
        <section className="flex justify-evenly">
          {users.map((user, index) => (
            <div className="entry text-center mb-16" key={index}>
              <h1 className="text-2xl md:text-4xl capitalize">{user.name}</h1>
              <p className='font-bold  mb-2 text-blue-950 dark:text-white'>{getSum(user)} oz</p>
              <FluidMeter percentage={getSum(user) / 125 * 100} />
              
              <input
                className="mt-7 w-24 bg-transparent border border-black hover:bg-[#55C0F3] focus:bg-[#55c0F3] text-white text-center font-bold py-2 px-2 rounded-full transition-all duration-200 placeholder-black"
                placeholder="Add Fluid"
                value={inputValues[user.name] || ''}
                onChange={(e) => handleFluidChange(e, user.name)}
                onFocus={() => setFocusStates({ ...focusStates, [user.name]: true })}
                onBlur={() => handleBlur(user.name)}
              />
              {focusStates[user.name] && (
                <button
                  className="ml-2 inline-block p-2 bg-[#ffffff] hover:bg-[#55C0F3] transition-all duration-200 font-semibold border border-black rounded-full text-x"
                  onClick={() => handleFluidSubmit(user.name, inputValues[user.name])}
                >
                  Submit
                </button>
              )}

              </div>
          ))}
        </section>

        <section className='text-center mx-auto'>
          <div className= 'border-black border-2 p-2 inline-block rounded-md'>
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
