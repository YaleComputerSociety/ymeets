import * as React from "react";
import './time_select_component.css';
import Select from "react-dropdown-select";

import { useState } from "react";

export const TimeSelectComponent = (props:any) => {

    const turnToTimeString = (i:any) => {
        if (i === 0) {
            return "12:00 AM";
        } else if (i < 12) {
            return i.toString().padStart(2, "0") + ":00 AM";
        } else if (i === 12) {
            return "12:00 PM";
        } else {
            return (i - 12).toString().padStart(2, "0") + ":00 PM";
        }
    }

    const options = Array.from({length: 24}, (_, i) => ({
        value: i + 1,
        label: turnToTimeString(i)
    }));
    
    return (
        <div className='absolute top-[-35px] right-0 flex flex-row'>
            <div className='grid items-center px-1 sm:px-2'>
                <p className='text-right font-bold m-0 text-sm sm:text-base'>FROM</p>
            </div>
            <Select className="" searchable={false} options={options} values={[]} onChange={(values:any) => {props.updateStart((values[0]['value']-1) * 60)}} />
            <div className='grid items-center px-1 sm:px-2'>
            <p className='text-right font-bold m-0 text-sm sm:text-base'>TO</p>
            </div>
            <Select className="" searchable={false} options={options} values={[]} onChange={(values:any) => {props.updateEnd((values[0]['value']-1) * 60)}} />
        </div>
    );
}