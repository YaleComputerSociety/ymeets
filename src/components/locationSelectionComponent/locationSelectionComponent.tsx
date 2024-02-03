import * as React from "react";
import './locationSelectionComponent.css';
import Select from "react-dropdown-select";
import { useEffect, useState } from "react";
import { getLocationsVotes } from "../../firebase/events";
import { getParticipantIndex, getAccountId, getAccountName } from "../../firebase/events";

export const LocationSelectionComponent = (props:any) => {
    let locations : Array<String> = props.locations
    let options = locations.map(loc => {
        return {
            value: loc,
            label: loc
        }
    })

    const [importedVote, setImportedVote]  = useState([])

    useEffect(() => {

        let votes = getLocationsVotes();

        console.log(votes);
        //@ts-ignore
        let user = getParticipantIndex(getAccountName(), getAccountId())

        if (user != undefined) {
            console.log("the vote " + votes[user]);
            setImportedVote(votes[user])
        }

    }, [])

    return (
        <Select multi 
            create 
            options={options} 
            clearOnSelect={false}
            placeholder="Select location preference(s)"
            values={importedVote} 
            onChange={(values:any) => {
                props.update(values.map((val:any) => val.value))
            }}
            noDataRenderer={() => (
                <div className="p-2 text-center">No location options set :(</div>
            )}     
        />
    );
}