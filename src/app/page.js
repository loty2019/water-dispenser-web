"use client";
import { get, ref, push, set } from "firebase/database";
import { useEffect, useState } from "react";
import FluidMeter from "./components/FluidMeter";
import { database } from "./firebaseConfig";
import Link from "next/link"; // Linking to other pages
import Image from "next/image";
// import of images
import WaterHubLogo from "/public/img/WaterHub.png";
import Settings from "/public/img/settingImg.png";
import Reload from "/public/img/reload.png";
import NewUser from "/public/img/newUser.png";
import History from "/public/img/history.png";
import Profile from "/public/img/newUser.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


/**
 * Represents the Home component.
 * @returns {JSX.Element} The rendered Home component.
 */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setAutoLogin(localStorage.getItem("autoLogin") || false);
    if (typeof window !== "undefined") {
      if (localStorage.getItem("autoLogin") === "false") {
        const savedUsername = localStorage.getItem("username") || "";
        const savedPassword = localStorage.getItem("password") || "";

        const usersRef = ref(database, "users/" + savedUsername);

        get(usersRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const user = snapshot.val();
              if (user.password === savedPassword) {
                window.location.href = "/individual";
              }
            } else {
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error getting user data:", error);
          });
      } else {
        setLoading(false);
      }
    }
  }, []);

  const signInHandler = () => {
    setLoading(true);
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    // get the user data from the database
    const userRef = ref(database, `users/${username}`);
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const user = snapshot.val();
          if (user.password === password) {
            localStorage.setItem("weight", user.weight);
            localStorage.setItem("exercise", user.exercise);
            window.location.href = "/individual";
          } else {
            setError(true);
            setLoading(false);
          }
        } else {
          setError(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error getting user data:", error);
        setError(true);
        setLoading(false);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="mb-4">
          <Image
            src={WaterHubLogo}
            alt="WaterHubLogo"
            width={100}
            height={100}
            className="dark:bg-slate-300 rounded-xl scale-125"
          />
        </div>
        <div role="status" className="scale-150">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 dark:fill-gray-300"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <main >
        <div className="flex flex-col items-center mt-14 p-2 justify-center">
          <Image
            src={WaterHubLogo}
            alt="WaterHubLogo"
            width={100}
            height={100}
            className=" mb-2 dark:bg-slate-300 rounded-xl"
          />
          <div className="flex flex-row items-center justify-center">
            <h1 className="text-4xl mb-3 font-sans font-bold text-blue-950 dark:text-white">
              Welcome, Log In
            </h1>
          </div>
          <div className="flex mb-2 items-center p-2 justify-center">
            <Link href="./signup">
              <h1 className="text-md font-sans font-bold text-blue-950 dark:text-white">
                <u>Sign Up</u>
              </h1>
            </Link>
          </div>
        </div>
      <div className="mb-4 p-5 text-center max-w-sm backdrop-blur-sm bg-white/10 lg:max-w-sm lg:mb-0 lg:text-left mx-auto rounded-3xl">
        <div className="flex flex-col mt-4 mb-2 items-center p-2 justify-center">
          <label htmlFor="username">
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your name
            </label>
            <input
              type="text"
              id="username"
              className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="john"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
          </label>
          <label htmlFor="password" className="mt-6">
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="•••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={togglePasswordVisibility}
                className="absolute scale-110 inset-y-0 pr-3 right-0 items-center text-sm leading-5"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>
          <button
            type="submit"
            className="text-white font-extrabold mt-4 border-2 border-[#486bdf] hover:border-[#4991b2] bg-[#426eff] hover:bg-[#479fc8] hover:scale-110 duration-200 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              signInHandler();
            }}
          >
            Submit
          </button>
          <label htmlFor="auto_login" className="flex items-center mt-8">
            <input
              type="checkbox"
              id="auto_login"
              className="form-checkbox h-4 w-4 text-blue-500 dark:text-white"
              checked={autoLogin}
              onChange={(e) => {
                setAutoLogin(e.target.checked);
                localStorage.setItem("autoLogin", autoLogin);
              }}
            />
            <span className="ml-2 text-sm font-bold text-gray-900 dark:text-white">
              Auto-login
            </span>
          </label>
        </div>
        {error && (
          <div className="flex flex-row items-center justify-center mt-2 p-2">
            <h1 className="text-md font-sans font-bold text-red-600 dark:text-red-400">
              Invalid username or password
            </h1>
          </div>
        )}
      </div>
    </main>
  );
}
