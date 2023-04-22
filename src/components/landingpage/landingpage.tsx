import * as React from "react";
import './landingpage.css';

import { useState } from "react";
import { Link } from 'react-router-dom';


export const LandingPageButtons = () => {
    return (
        <div>
            <div className='createneweventwrapper'>
                <Link to='/dayselect'>
                    <button>Create New Event</button>
                </Link>
            </div>
            <div className='eventcodewrapper'>
                <Link to='/eventcode'>
                    <button>Use Event Code</button>
                </Link>
            </div>
            <div className='graphic'>
                <img src='calendargraphic.png'></img>
            </div>
        </div>
    );
}