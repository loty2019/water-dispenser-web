'use client'
import { get, ref, push, set } from 'firebase/database'
import { useEffect, useState } from 'react'
import FluidMeter from './components/FluidMeter'
import { database } from './firebaseConfig'
import Image from 'next/image';
import WaterHubLogo from '/public/img/WaterHub.png';
import Coffee from '/public/img/espresso.png';
import Soda from '/public/img/soda_can.png';
import Latte from '/public/img/latte.png';
import Settings from '/public/img/settingImg.png';
import Reload from '/public/img/reload.png';
import Link from 'next/link';

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
  const [objectives, setObjectives] = useState({});
  const [accumulatedAmount, setAccumulatedAmount] = useState(0);
  const [desiredValue, setDesiredValue] = useState(0);
  const [focusStates, setFocusStates] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [submitDone, setSubmitDone] = useState({});
  const [confirmationName, setConfirmationName] = useState({});

  const imgIconSize = 70;

  const handleFluidChange = (event, name) => {
    setInputValues({ ...inputValues, [name]: event.target.value });
    //setFluidValue(event.target.value);
    //setFocusStates({ ...focusStates, [name]: true });
  };

  const handleBlur = (name) => {
    // Set a timeout to allow click event to fire before hiding the button
    setTimeout(() => {
      setFocusStates({ ...focusStates, [name]: false });
    }, 100);
  };

  const handleSubmitDone = (userName) => {
    setTimeout(() => {
      setSubmitDone({ ...submitDone, [userName]: true }); // Set it back to true after 2 seconds
    }, 500);
    setTimeout(() => {
      setSubmitDone({ ...submitDone, [userName]: false }); // Set it back to true after 2 seconds
    }, 4000);
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
    set(fluidRef, parseInt(value)) && set(ref(database, 'records/forever_consumption'), accumulatedAmount + parseInt(value))
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
      handleSubmitDone(name);
  };
  
  // Fetch the data from the database when the component mounts
  useEffect(() => {
    const usersRef = ref(database, 'records');
    const ObjectiveRef = ref(database, 'objective');
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

  useEffect(() => {
    // Fetch objectives data
    const ObjectiveRef = ref(database, 'objective');
    get(ObjectiveRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const objectivesSnapshot = snapshot.val();
          const updatedObjectives = {};
          users.forEach((user) => {
            const userObjective = objectivesSnapshot[user.name];
            updatedObjectives[user.name] = userObjective || '??';
          });
          setObjectives(updatedObjectives);
        } else {
          console.log('No snapshot data exists.');
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [users]);

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
  
// over:scale-110 active:scale-100 duration-200
  return (
    <main className=" min-h-screen p-4 pt-1.5 lg:p-24 flex-col space-y-7">
      <div className="absolute p-0 right-12 top-2 flex flex-row-reverse items-center justify-center">
        <div className='hover:scale-110 active:scale-100 duration-200'>
          <Link href="/settings">
            <Image 
            src={Settings} 
            alt="settings" 
            width={32} height={32} 
            className="bg-slate-600 p-1 rounded-md hover:ease-in-out duration-300"
            />
          </Link>
        </div>
        <div className='hover:scale-110 active:scale-100 duration-200'>
          <Image 
            src={Reload} 
            alt="settings" 
            width={32} height={32} 
            className="bg-slate-600 mr-2 p-1.5 rounded-md hover:ease-in-out duration-300"
            onClick={() => {window.location.reload(true)}}
          />
        </div> 
      </div>
      <div className="flex items-center p-2 justify-center">
        <Image src={WaterHubLogo} alt="WaterHubLogo" width={100} height={100} className="mr-2" />
        <h1 className="text-4xl font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">How much water did you drink today?
        </h1>
      </div>
      <div className="mb-4 p-5 text-center backdrop-blur-sm bg-white/10 lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left mx-auto rounded-3xl">
        <section className="flex justify-evenly">
          {users.map((user, index) => (
            <div className="entry flex-row text-center mb-16" key={index}>
              <h1 className="text-2xl font-bold md:text-4xl capitalize">{user.name}</h1>
              <span className="text-sm font-semibold text-blue-950 dark:text-white">Today</span>
              <p className='font-bold text-sm mb-2 text-blue-950 dark:text-white'>
                <span className='font-bold  text-xl'>{getSum(user)}</span>/{objectives[user.name] || '??'} oz
              </p>
              <FluidMeter percentage={getSum(user) / (objectives[user.name] + 10) * 100} />
              
              <div className="flex items-baseline justify-center">
                <input
                  className="mt-7 w-24 border-2 bg-transparent border-black hover:bg-[#55C0F3] focus:bg-[#55c0F3] text-white dark:placeholder-white dark:border-white text-center font-bold py-2 px-2 rounded-full transition-all duration-200 placeholder-black"
                  placeholder="Add Fluid"
                  value={inputValues[user.name] || ''}
                  onChange={(e) => handleFluidChange(e, user.name)}
                  //onFocus={() => setFocusStates({ ...focusStates, [user.name]: true })}
                  onBlur={() => handleBlur(user.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFluidSubmit(user.name, inputValues[user.name]);
                      handleBlur(user.name);
                      handleSubmitDone(user.name);
                      setConfirmationName(inputValues[user.name] + "oz of fluid");
                    }
                  }}
                />
                <button className="mt-4 ml-1 mr-3 w-11 text-xl border-2 border-black bg-[#55c0F3] hover:bg-[#4ba9d5] text-white dark:border-white text-center font-extrabold py-1 px-0 rounded-full transition-all duration-200" 
                //onFocus={() => setFocusStates({ ...focusStates, [user.name]: true })}
                //onBlur={() => handleBlur(user.name)} // this is causing the button to disappear when clicked
                onClick={() => {
                  setFocusStates({ ...focusStates, [user.name]: !focusStates[user.name] });
                }}
                >+
                </button>
              </div>

              {focusStates[user.name] && (
                <div className='mt-2' >
                <p className="text-sm font-semibold text-blue-950 dark:text-white">Click on the icon to add fluid</p>
                <div className="grid overflow-hidden place-items-center min-w-20 gap-6 sm:grid-cols-3 space-x-3 p-3 pl-0 mt-2 bg-[#ffffff47] mr-3 rounded-xl">
                  <div className="textIconWrapper"
                    onClick={() => {
                      handleFluidSubmit(user.name, 2); //  2 oz of water in coffee
                      handleBlur(user.name);
                      handleSubmitDone(user.name);
                      setConfirmationName("Espresso");
                    }}>
                    <Image
                      src={Coffee}
                      alt="Coffee"
                      width={imgIconSize} height={imgIconSize}
                      className=""
                    />
                    <span className="text-sm sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">Espresso<br/>(2 oz) </span>
                  </div>
                  <div className="textIconWrapper"
                    onClick={() => {
                      handleFluidSubmit(user.name, 8); // 8 oz of water in soda
                      handleBlur(user.name);
                      handleSubmitDone(user.name);
                      setConfirmationName("Soda Can");
                    }}>
                    <Image
                    src={Soda}
                    alt="Soda Can"
                    width={imgIconSize} height={imgIconSize}
                    className=""
                    />
                    <span className="text-sm text-nowrap sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">Soda<br/>(8 oz)</span>
                  </div>
                  <div className="textIconWrapper"
                    onClick={() => {
                      handleFluidSubmit(user.name, 10); // 10 oz of water in latte
                      handleBlur(user.name);
                      handleSubmitDone(user.name);
                      setConfirmationName("Latte");
                    }}>
                    <Image
                      src={Latte}
                      alt="Latte"
                      width={imgIconSize} height={imgIconSize}
                      className=""
                    />
                    <span className="text-sm  sm:pb-2 pt-1 font-semibold text-blue-950 dark:text-white block leading-tight">Latte<br/>(10 oz)</span>
                  </div>
                </div>
                </div>
              )}

              {submitDone[user.name] && (
                <p className="text-lg text-left pt-5 font-semibold text-blue-950 dark:text-white"> <span className= "font-extrabold">{confirmationName}</span> added! 👍<br/>Keep Drinking!</p>
              )}

              </div>
          ))}
        </section>

        <section className='text-center mx-auto'>
          <div className= 'border-black dark:border-white border-2 p-2 inline-block rounded-md'>
            <p className='text-center inline-block font-bold text-xl'>Total ever drank: {desiredValue}</p>
            <select className='ml-2 inline-block font-semibold border border-black rounded-sm text-xl bg-transparent' onChange={onOptionChangeHandler}>
              <option value="option1">gallons</option>
              <option value="option2">liters</option>
              <option value="option3">glasses</option>
              <option value="option4">ounces</option>
            </select>
          </div>
        </section>
      </div>
      <footer className="flex justify-center">
        <p className="text-center text-sm font-bold text-blue-950 dark:text-white">
            Drinking enough water is vital for our health, as it aids in maintaining body temperature, lubricating joints, and removing waste. While individual hydration needs vary, a general guideline is to consume a variety of fluids and water-rich foods daily. The virtual dynamic water bottle is designed to help you reach these hydration targets with ease.
            <a className='' href="https://www.cdc.gov/healthyweight/healthy_eating/water-and-healthier-drinks.html" target="_blank"><u> Learn more</u></a>
        </p>
      </footer>
    </main>
  );
}
