import React from "react";

export default function Footer() {
    return   ( 
    
    <>
    <div className="h-4"></div>
    <footer className='fixed bottom-0 left-0 right-0 bg-white w-full flex items-center justify-center text-sm sm:text-md p-3.5 pl-8 pr-8'>
        <div className="flex flex-col lg:flex-row md:flex-row sm:flex-row">
            <div className="items-center justify-center m-1">
                <p className="px-2 text-center hover:text-blue-700 font-bold">
                    <a href="https://yalecomputersociety.org/">
                        &copy; 2024 &ndash; &nbsp;A y/cs product
                    </a> 
                </p>
            </div>
            <div className="items-center text-center justify-center m-1">
                <p className="px-2 hover:text-blue-700">
                    <a href="/privacy">
                        privacy policy + limited use agreement
                    </a>
                </p>
            </div>
        </div>
    </footer>
    </>
    )
}