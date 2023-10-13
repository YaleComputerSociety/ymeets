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
    }))

    return (
        <div className={`time-select-wrapper`}>
            <div className='time-select-text-wrapper'>
                <p className='time-select-text'>FROM</p>
            </div>
            <Select searchable={false} options={options} values={[]} onChange={(values:any) => {props.updateStart((values[0]['value']-1) * 60)}} />
            <div className='time-select-text-wrapper'>
                <p className='time-select-text'>TO</p>
            </div>
            <Select searchable={false} options={options} values={[]} onChange={(values:any) => {props.updateEnd((values[0]['value']-1) * 60)}} />
        </div>
    );
}