'use client'
import React from 'react';
import Link from 'next/link'; // Linking to other pages
import Image from 'next/image';
import Reload from '/public/img/reload.png';
import WaterHubLogo from '/public/img/WaterHub.png';


export default function Page() {
    return (
      <main>
        <div className="absolute p-0 left-4  top-4 flex flex-row-reverse items-center justify-center">
            <Link href="./">
              <button className="bg-slate-600 p-2 font-sans font-bold text-white rounded-lg hover:scale-110 active:scale-100 duration-200">← Go Back</button>
            </Link>
        </div>
        <div className="absolute p-0 right-16 top-3 flex flex-row-reverse items-center justify-center scale-125 hover:scale-110 duration-200">
          <Image 
            src={Reload} 
            alt="settings" 
            width={32} height={32} 
            className="bg-slate-600 mr- p-1.5 rounded-md hover:ease-in-out duration-300"
            onClick={() => {window.location.reload(true)}}
          />
        </div>  
        
        <div className="flex flex-col items-center mt-10 p-2 justify-center">
          <Image src={WaterHubLogo} alt="WaterHubLogo" width={100} height={100} className="mr-2" />
          <h1 className="text-4xl font-sans font-bold lg:mt-0 text-blue-950 dark:text-white">Settings</h1>
        </div>
      </main>
    );
}