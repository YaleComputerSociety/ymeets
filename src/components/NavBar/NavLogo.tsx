import CalendarIcon from "./CalendarIcon"

export default function NavLogo() {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const currDate = new Date(Date.now())
    const currWeekDay = weekdays[currDate.getDay()]
    const currMonthDay = currDate.getDate().toString().padStart(2, '0')
    return (
        <div className="inline-flex items-center space-x-4 transition hover:scale-x-102">
            <a href="/">
                <div className="flex flex-row items-center select-none text-gray-500 \
                                hover:text-blue-500">
                    <div className="mr-2">
                        <CalendarIcon></CalendarIcon>
                    </div>
                    <span className="text-2xl font-bold font-mono">ymeets</span> 
                </div>
            </a>
        </div>
    )
}