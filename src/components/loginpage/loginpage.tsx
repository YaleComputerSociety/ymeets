import * as React from "react";
import graphic from './calendargraphic.png';
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
        <div className='homepage'>
            {/* <h1 className='appName'>StudyBuddy</h1> */}
            <div className='aboutinfo'>
                <div className='slogan'>
                    <h1 className='slogantext'><b>Group meetings made easy.</b></h1>
                    <h3 className='moreinfo'>Find the optimal meeting time and location with ease with YMeets!</h3>
                </div>
                <div className='buttonslog'>
                    <div className='googlesigninwrapper'>
                            <button onClick={() => {handleSignInWithGoogle()}}>Sign in with Google</button>
                    </div>
                    <div className='nologinwrapper'>
                        <Link to='./landingpage'>
                            <button onClick={() => {console.log("Hi login")}}>Continue Without Login</button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className='graphic'>
                <img src={graphic}></img>
            </div>
        </div>
    );
}