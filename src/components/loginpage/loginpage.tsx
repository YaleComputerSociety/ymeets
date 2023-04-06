import * as React from "react";
import './loginpage.css';

import { Link } from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";


export const LoginPageButtons = () => {
    const navigate = useNavigate();

    const handleSignInWithGoogle = () => {
        signInWithGoogle().then(() => {
            navigate('./landingpage')
        });
    }

    return (
        <div>
            <h1 className='appName'>StudyBuddy</h1>
            <div className='googlesigninwrapper'>
                    <button onClick={() => {handleSignInWithGoogle()}}>Sign in with Google</button>
            </div>
            <div className='nologinwrapper'>
                <Link to='./landingpage'>
                    <button onClick={() => {console.log("Hi login")}}>Continue Without Login</button>
                </Link>
            </div>
        </div>
    );
}