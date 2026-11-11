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
    onSelect?: (time: BestTimeWindow) => void;
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
        onSelect,
    }: BestTimeFinderProps)
    {
        const [sortBy, setSortBy] = useState<'best' | 'earliest'>('best');

        const [selectedKey, setSelectedKey] = useState<string | null>(null);   

        //store selected meeting length
        const [duration, setDuration] = useState(60);

        //store suggested times after the user clicks button
        const[suggestions, setSuggestions] = useState < BestTimeWindow[] > ([]);

        //track if the user has searched yet
        const [searched, setSearched] = useState(false);
        
        //calculate the suggesteions using the helper funciton
        function handleFindTimes()
        {
            const results = findBestTimes
            (
                availabilities,
                personIdx, 
                dayLabels.length, 
                numBlocks, 
                duration,
                15, // block size in minutes
                10  // how many to return
            );
            setSelectedKey(null);
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

        const shownSuggestions =
            sortBy === 'best'
                ? suggestions
                : [...suggestions].sort(
                    (a, b) => a.col - b.col || a.startBlock - b.startBlock
                );
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
                        <select
                            value={sortBy}
                            onChange={event => setSortBy(event.target.value as 'best' | 'earliest')}
                            className="mb-3 h-9 rounded-lg border border-slate-500 bg-white px-3 text-sm text-gray-900">
                            <option value="best">Best match first</option>
                            <option value="earliest">Earliest first</option>
                        </select>

                        {suggestions.length === 0? (
                            <p className = "text-white">No suitable meeting times avaible.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {shownSuggestions.map((time, index) => {
                                    const key = `${time.col}-${time.startBlock}`;
                                    const isSelected = selectedKey === key;
                                    return (
                                        <div
                                            key={key}
                                            className={`rounded-lg border p-4 text-white ${
                                                isSelected ? 'border-blue-400 bg-slate-600' : ''
                                            }`}
                                        >
                                            {sortBy === 'best' && index === 0 && (
                                                <p className="mb-1 text-xs font-semibold text-blue-300">BEST MATCH</p>
                                            )}
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedKey(key);
                                                onSelect?.(time);
                                            }}
                                            className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
                                            {isSelected ? 'Selected ✓' : 'Choose this time'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                    </div>
                )}
        
            </div>
        );
}

