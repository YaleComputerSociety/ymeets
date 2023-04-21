

import * as React from "react";

import { useState } from "react";
import { Link } from 'react-router-dom';


function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(result);

    return result;
}


const randomURL = () => {
    return (
        <div>
            <button onClick={generateRandomString}></button>
        </div>
    );
}

export default randomURL;