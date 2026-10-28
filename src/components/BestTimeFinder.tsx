import { findBestTimes } from './utils/functions/findBestTimes';
import type { BestTimeWindow } from './utils/functions/findBestTimes';
import { useState } from 'react';
import { Availability} from '../types';

interface BestTimeFinderProps
{
    availabilities: Availability[];
    personIdx: number[];
    personNames: string[];
    dayLabels: string[];
    numBlocks: number;
    startHour?: number;
}

export default function BestTimeFinder
(
    {
        availabilities,
        personIdx,
        personNames,
        dayLabels,
        numBlocks,
        startHour = 8,
    }: BestTimeFinderProps)
    {
        //store selected meeting length
        const [duration, setDuration] = useState(60);

        //store suggested times after the user clicks button
        const[suggestions, setSuggestions] = useState < BestTimeWindow[] > ([]);

        //track if the user has searched yet
        const [searched, setSearched] = useState(false);
        
        //calculate the suggesteions using the helper funciton
        function handleFindTimes()
        {
            console.log("Availability matrix:", availabilities);
            console.log("Number of participants:", availabilities.length);
            console.log("Number of days:", dayLabels.length);
            console.log("Number of blocks:", numBlocks);
            console.log("First participant:", availabilities[0]);
            console.log("Selected participant indices:", personIdx);
            console.log("Meeting duration:", duration);
            console.log(
                "Full availability data:",
                JSON.stringify(availabilities, null, 2)
            );

            console.log(
                "Availability dimensions:",
                availabilities.map(person =>
                    person.map(day => day.length)
                )
            );

            console.log(
                "Calendar start time:",
                startHour
            );
            const results = findBestTimes
            (
                availabilities,
                personIdx, 
                dayLabels.length, 
                numBlocks, 
                duration
            );
            console.log("Suggested results:", results);
            setSuggestions(results);
            setSearched(true);
        }

        //convert calendar block index into readable time

        function formatTime(block: number): string
        {
            const totalMinutes = startHour * 60 + block * 15;
            const hour = Math.floor(totalMinutes/60);
            const minutes = totalMinutes % 60;

            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const displayMinutes = String(minutes).padStart(2, '0');
            
            return (
                String(displayHour) +
                ':' +
                displayMinutes +
                ' ' +
                period
            );
        }

        return(
            <div className = "mx-auto max-w-4xl rounded-xl bg-slate-700 p-6 text-white shadow-sm">
                <h2 className="mb-4 text-2xl text-center font-semibold text-white">
                    Find the Best Meeting Time
                </h2>

                <div className= "flex items-end justify-center gap-3">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="meeting-duration" className="text-sm font-medium text-slate-200">
                            Meeting duration
                        </label>
                        <select
                            id = "meeting-duration"
                            value = {duration}
                            onChange = {event => setDuration(Number(event.target.value))}
                            className = "h-10 min-w-32 rounded-lg border border-slate-500 bg-white px-3 text-gray-900"
                        >
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>
                    <button
                        type = "button"
                        onClick={handleFindTimes}
                        className="h-[41px] rounded-lg bg-blue-600 px-5 font-medium text-white transition hover:bg-blue-500"
                    >
                        Find Times
                    </button>
                </div> 

                {searched && (
                    <div className = "mt-6">
                        <h3 className = "mb-3 text-lg font-medium text-white">
                            Suggested meeting times
                        </h3>

                        {suggestions.length === 0? (
                            <p className = "text-white">No suitable meeting times avaible.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {suggestions.map((time) => (
                                    <div
                                        key={`${time.col}-${time.startBlock}`}
                                        className = "rounded-lg border p-4 text-white"
                                    >
                                        <h4 className="font-semibold text-white">
                                            {dayLabels[time.col] ?? `Day ${time.col + 1}`}
                                        </h4>

                                        <p>
                                            {formatTime(time.startBlock)} –{' '}
                                            {formatTime(time.endBlock + 1)}
                                        </p>

                                        <p className="mt-2">
                                            <strong>
                                            {time.availableIdx.length} of {personIdx.length}
                                            </strong>{' '}
                                            selected participants can attend.
                                        </p>

                                        {/* List the participants who can attend. */}
                                        <p className="mt-2 text-sm text-white">
                                            <strong>Available:</strong>{' '}
                                            {time.availableIdx
                                            .map(i => personNames[i] ?? `Person ${i}`)
                                            .join(', ') || 'None'}
                                        </p>

                                        {/* List the participants who cannot attend. */}
                                        <p className="mt-1 text-sm text-white">
                                            <strong>Unavailable:</strong>{' '}
                                            {time.missingIdx
                                            .map(i => personNames[i] ?? `Person ${i}`)
                                            .join(', ') || 'Everyone can attend'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
        
            </div>
        );
}

