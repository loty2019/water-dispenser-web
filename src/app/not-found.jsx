import Link from 'next/link';
import React from 'react';

const NotFoundPage = () => {
    return (
        <div className="relative w-full min-h-screen flex flex-col justify-center items-center" bis_skin_checked="1">
            <div className="relative z-0 w-full h-full flex items-center justify-center" bis_skin_checked="1">
                <h1 className="font-bold text-[30vw] text-gray-500">404</h1>
                <div className="absolute inset-0 bg-black-90 w-full h-full" bis_skin_checked="1"></div>
            </div>
            <div className="group/section px-4 md:px-12 lg:px-20 xl:px-28 2xl:px-36 relative z-10 flex flex-col items-center w-full h-full text-center " bis_skin_checked="1">
                
                <p className="text-4xl font-semibold">You have reached nothingness</p>
                <p className="text-2xl text-black mt-4">Please head back.</p>
                <Link href="/">
                    <button type="button" className="transition duration-300 text-base flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-opacity-80 mt-8 hover:bg-blue-200 border-2 border-primary-500 bg-blue-500 text-white">
                        <p className="text-lg">Go back</p>
                    </button>
                </Link>
            </div>
        </div>
    );
};


export default NotFoundPage;