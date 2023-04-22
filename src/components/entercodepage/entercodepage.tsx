// import * as React from "react";
import './entercodepage.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventById } from '../../firebase/events';

export const EnterCodeComp = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setInput(event.target.value);
    }

    const handleButtonClick = () => {
        console.log(input);
        if (input.length !== 6) {
            alert('Please enter a valid code.');
        } else {
            setError('');
            getEventById(input).then((result) => {
                if (result) {
                    // @ts-ignore
                    navigate('/timeselect', { code: input });
                } else {
                    alert('Please enter a valid code.');
                }
            }).catch(() => {
                alert('Please enter a valid code.');
            });
        }
    }

    return (
        <div className='eventcodeback'>
            <div className="container1">
                <h1 className="eventtitle">Enter Event Code</h1>
                <input
                    id="eventCodeInput"
                    className="event-code-input"
                    type="text"
                    placeholder="e.g. DFMPRH"
                    value={input}
                    onChange={handleInputChange}
                ></input>
                {error && <p className="error-msg">{error}</p>}
                <div className='eventcontwrapper'>
                    <button className='standbutton' onClick={handleButtonClick}>Join</button>
                </div>
            </div>
        </div>
    );
}



// import { useState } from "react";
// import { Link } from 'react-router-dom';

// // Event Code Input Element
// // const eventCodeInput = document.getElementById('eventCodeInput') as HTMLInputElement;

// var input = "";

// function codeCheck(){
//     input = document.getElementById("userInput").value;
// }
// // // Next Button Element
// // const nextButton = document.getElementById('nextButton');

// // Add Event Listener to Next Button
// // nextButton.addEventListener('click', () => {
// //     const eventCode = eventCodeInput.value.trim();
// //     if (eventCode.length !== 6) {
// //         if (eventCode.length === 0) {
// //             alert('Enter your code above.');
// //         } else {
// //             alert('Please enter a valid code.');
// //         }
// //     } else {
// //         // Proceed with the next action
// //         // For example, redirect to another page or perform an API call
// //         alert('Event Code: ' + eventCode);
// //     }
// // });


// export const EnterCodeComp = () => {
//     return (
//         <div className="container1">
//             <h1 className="eventtitle">Enter Event Code</h1>
//             <input id="eventCodeInput" className="event-code-input" type="text" placeholder="e.g. DFMPRH"></input>
//             <div className='eventcontwrapper'>
//                 <Link to='/eventcode'>
//                     <button onClick={() => {codeCheck()}}>Continue</button>
//                 </Link>
//             </div>
//         </div>
//     );
// }
