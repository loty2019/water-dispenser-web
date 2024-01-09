import { get, ref, push, set } from 'firebase/database'
import { useEffect, useState } from 'react'
import { database } from '../src/app/firebaseConfig'
import Image from 'next/image';
import WaterHubLogo from '/public/img/WaterHub.png';
import React from 'react';

export default function Settings() {
    return (
      <div>
        <h1>Settings</h1>
        <p>Page under development.</p>
      </div>
    );
}