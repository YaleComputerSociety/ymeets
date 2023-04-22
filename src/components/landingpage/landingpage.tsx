import * as React from "react";
import './landingpage.css';
import '../landingbackground.jpg';

import { useState } from "react";
import { Link } from 'react-router-dom';


export const LandingPageButtons = () => {
    return (
        <div className='background'>
            <div className='loginbuttons'>
                <div className='createneweventwrapper'>
                    <Link to='/dayselect'>
                        <button className='standbutton' onClick={() => {console.log("Hilogin")}}>Create New Event</button>
                    </Link>
                </div>
                <div className='eventcodewrapper'>
                    <Link to='/eventcode'>
                        <button className='standbutton' onClick={() => {console.log("Hilogin")}}>Use Event Code</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}