import * as React from "react";
import './locationSelectionComponent.css';
import Select from "react-dropdown-select";

export const LocationSelectionComponent = (props:any) => {
    let locations : Array<String> = props.locations
    let options = locations.map(loc => {
        return {
            value: loc,
            label: loc
        }
    })

    return (
        <Select multi 
            create 
            options={options} 
            clearOnSelect={false}
            placeholder="Select location preference(s)"
            values={[]} 
            onChange={(values:any) => {
                props.update(values.map((val:any) => val.value))
            }}/>
    );
}