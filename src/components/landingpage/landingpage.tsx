import { Link } from 'react-router-dom';



export const LandingPageButtons = () => {

    return (
        <div className='bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 h-screen w-screen flex justify-center'>
            <div className='w-4/5 sm:w-4/6 md:w-1/2 mx-auto'>
                <div className='text-center h-30 mb-16 mt-40'>
                    <Link to='/dayselect'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg' onClick={() => {console.log("Hilogin")}}>Create New Event</button>
                    </Link>
                </div>
                <div className='text-center h-30'>
                    <Link to='/eventcode'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg' onClick={() => {console.log("Hilogin")}}>Use Event Code</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}