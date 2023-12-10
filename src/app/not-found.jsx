

import Link from 'next/link';
import React from 'react';

const NotFoundPage = () => {
    return (
        <div class="relative w-full min-h-screen flex items-center" bis_skin_checked="1">
            <div class="fixed z-0 w-full h-full flex items-center justify-center" bis_skin_checked="1">
                <h1 class="font-bold text-[30vw] text-gray-500">404</h1>
                <div class="absolute inset-0 bg-black/90 w-full h-full" bis_skin_checked="1"></div>
            </div>
            <div class="group/section px-4 md:px-12 lg:px-20 xl:px-28 2xl:px-36 relative z-10 flex flex-col items-center w-full h-full text-center " bis_skin_checked="1">
                <div class="mb-4 text-gray-300" bis_skin_checked="1">
                    <span class="text-lg">Welcome to <span class="text-red-300">404 dimension</span></span>
                </div>
                <p class="text-4xl font-semibold">You have reached nothingness</p>
                <p class="text-2xl text-gray-200 mt-4">Please head back.</p>
                <Link href="/">
                    <button type="button" class="transition duration-300 text-base flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-opacity-80 mt-8 hover:bg-primary-500 border-2 border-primary-500">
                        <p class="text-lg">Go back</p>
                    </button>
                </Link>
            </div>
        </div>
    );
};


export default NotFoundPage;


