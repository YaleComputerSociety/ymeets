import * as React from "react";
import './loginpage.css';

import { useState } from "react";
import { Link } from 'react-router-dom';


export const LoginPageButtons = () => {
    return (
        <div>
            <h1 className='appName'>StudyBuddy</h1>
            <div className='googlesigninwrapper'>
                <Link to='./landingpage'>
                    <button onClick={() => {console.log("Hilogin")}}>Sign in with Google</button>
                </Link>
            </div>
            <div className='nologinwrapper'>
                <Link to='./landingpage'>
                    <button onClick={() => {console.log("Hilogin")}}>Continue Without Login</button>
                </Link>
            </div>
        </div>
    );
}