import React from "react"

export default function NavBar() {
    let today = new Date()
    let day = today.getDate()
    let weekdays = ["Sunday", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let weekday = weekdays[today.getDay()]
    return (
        <div className="flex w-full mt-9 fixed justify-center z-50">
            <div className="flex bg-white rounded-full h-16 w-[90%] px-8 items-center justify-between shadow-lg">
                <div className="inline-flex items-center space-x-4">
                    <a href="/" className="text-gray-500 text-2xl font-bold hover:text-blue-700">ymeets</a> 
                </div>
                <div className="inline-flex justify-self-end items-end space-x-4">
                    <div className="inline-flex md:hidden flex-col space-y-1 h-6 w-6 justify-center">
                        <div className="border border-gray-500 w-full"></div>
                        <div className="border border-gray-500 w-full"></div>
                        <div className="border border-gray-500 w-full"></div>
                    </div>
                    <a href="#" className="hidden hover:text-blue-700 md:inline-block">About Us</a>
                    <a href="#" className="hidden hover:text-blue-700 md:inline-block">About YCS</a>
                </div>
            </div>
        </div>
    )
}