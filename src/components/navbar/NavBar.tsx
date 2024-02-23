import React from "react"
import NavLogo from "./NavLogo"
import { getAccountName } from "../../firebase/events"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IconUser } from "@tabler/icons-react"
import { signInWithGoogle } from "../../firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../firebase/firebase"

export default function NavBar() {
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [name, setName] = useState("")

    const nav = useNavigate()
    
    const navToggle = () => {
        setMenuOpen(menuOpen ? false : true)
    }

    useEffect(() => {
        return onAuthStateChanged(auth, () => {
            setName(getAccountName().split(' ')[0]);
        });  
    }) 

    return (
        <>
        <div className="flex flex-col w-full mt-6 fixed justify-center z-40 items-center">
            <div className="flex bg-white rounded-xl h-16 w-[90%] px-5 sm:px-8 items-center justify-between shadow-lg">
                <NavLogo></NavLogo>
                <div className="inline-flex justify-self-end items-center space-x-4 order-2">
                    {/* <div className="inline-flex flex-col space-y-1 h-6 w-6 justify-center self-center md:hidden cursor-pointer order-1"
                         onClick={navToggle}>
                        <svg viewBox="0 0 100 50" width="30" height="30" fill="currentColor"
                             className={menuOpen ? "text-blue-500" : "text-gray-500"}>
                            <rect width="85" height="10" rx="10"></rect>
                            <rect y="25" width="85" height="10" rx="10"></rect>
                            <rect y="50" width="85" height="10" rx="10"></rect>
                        </svg>
                    </div> */}
                    <a href="/about-us" className="hidden hover:text-blue-700 md:inline-block flex items-center">About Us</a>
                    {/* <a href="https://yalecomputersociety.org/" target="_blank" rel="noopener noreferrer" className="hidden hover:text-blue-700 md:inline-block flex items-center">About y/cs</a> */}
                    
                    {name != "" ? <button onClick={() => nav("/useraccount")} className={`text-gray-500 border border-gray-500 rounded-full \
                                    w-fit h-fit px-3 py-1 self-center hover:bg-gray-500 hover:text-white\
                                    text-sm ${name == "" ? "hidden" : "inline-block"}`}>
                        Welcome, {name}
                    </button> :
                    <button onClick={() => {
                        signInWithGoogle().then((loginSuccessful) => {
                            if (loginSuccessful) {
                                window.location.reload();
                            }
                        })}}>
                    <IconUser/>
                    </button>
                    }
                </div>
            </div>
            {/* MOBILE MENU */}
            {/* <div className={`flex flex-col justify-center text-center items-center rounded-xl h-fit w-[90%]
                             bg-white shadow-lg mt-2
                            ${menuOpen ? "inline-block" : "hidden"}
                            md:hidden`}>
                <button onClick={() => {nav("/about-us"); console.log()}} className="hover:text-blue-700 py-4 border-b border-gray-300 w-full">About Us</button>
                <a href="https://yalecomputersociety.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 py-4 w-full">About y/cs</a>
            </div> */}
        </div>
        {/* Acts as a buffer for floating nav */}
        <div className="h-32">

        </div>
        </>
    )
}