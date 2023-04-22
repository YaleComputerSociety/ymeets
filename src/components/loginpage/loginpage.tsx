import * as React from "react";
import graphic from './calendargraphic.png';
import './loginpage.css';

import {useNavigate} from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/firebase";

export const LoginPageButtons = () => {
    const navigate = useNavigate();

    const handleSignInWithGoogle = () => {
        signInWithGoogle().then(() => {
            navigate('./landingpage');
        });
    }

    const handleSignInAnonymous = () => {
        signInAnonymously(auth).then(() => {
            navigate('./landingpage');
        });
    }

    return (
        <div className='homepage'>
            {/* <h1 className='appName'>StudyBuddy</h1> */}
            <div className='aboutinfo'>
                <div className='slogan'>
                    <h1 className='slogantext'><b>Group meetings made easy.</b></h1>
                    <h3 className='moreinfo'>Find the optimal meeting time and location with ease with YMeets!</h3>
                </div>
                <div className='buttonslog'>
                    <div className='googlesigninwrapper'>
                            <button className='standbutton' onClick={() => {handleSignInWithGoogle()}}>Sign in with Google</button>
                    </div>
                    <div className='nologinwrapper'>
                            <button className='standbutton' onClick={() => {handleSignInAnonymous()}}>Continue Without Login</button>
                    </div>
                </div>
            </div>
            <div className='graphic'>
                <img src={graphic} className='graphicpic'></img>
            </div>
        </div>
    );
}

