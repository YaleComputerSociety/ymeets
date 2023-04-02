import * as React from "react";
import './loginpage.css';

import { useState } from "react";
import { Link } from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";


export const LoginPageButtons = () => {
    return (
        <div>
            <h1 className='appName'>StudyBuddy</h1>
            <div className='googlesigninwrapper'>
                <Link to='./landingpage'>
                    <button onClick={() => {signInWithGoogle()}}>Sign in with Google</button>
                </Link>
            </div>
            <div className='nologinwrapper'>
                <Link to='./landingpage'>
                    <button onClick={() => {console.log("Hi login")}}>Continue Without Login</button>
                </Link>
            </div>
        </div>
    );
}