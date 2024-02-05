import React from "react";

export default function Footer() {
    return   <footer className='fixed bottom-0 left-0 right-0 bg-white w-full flex items-center justify-center text-sm sm:text-md p-3.5 pl-8 pr-8'>
        <div className="flex">
            <p className="px-2 hover:text-blue-700 font-bold">
            <a href="https://yalecomputersociety.org/">
                &copy; 2024 &ndash; &nbsp;A y/cs product
            </a> 
            </p>
            <p className="px-2 hover:text-blue-700">
            <a href="/privacy">
                privacy policy
            </a>
            </p>
        </div>
    </footer>
}