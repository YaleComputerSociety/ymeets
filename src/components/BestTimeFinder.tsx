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

        // Typed as text so the boxes can be cleared while typing
        const [durationHours, setDurationHours] = useState('1');
        const [durationMinutes, setDurationMinutes] = useState('0');

        // Total meeting length in minutes (never negative)
        const duration = Math.max(
            0,
            (Number(durationHours) || 0) * 60 + (Number(durationMinutes) || 0)
        );

        // The calendar uses 15-minute blocks, so lengths round up to the next 15
        const roundedDuration = Math.ceil(duration / 15) * 15;
        //store suggested times after the user clicks button
        const[suggestions, setSuggestions] = useState < BestTimeWindow[] > ([]);

        //track if the user has searched yet
        const [searched, setSearched] = useState(false);
        
        //calculate the suggesteions using the helper funciton
        function handleFindTimes()
        {
            if (duration <= 0) return;
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
                        <div className="flex items-center gap-2">
                            <input
                                id="meeting-duration"
                                type="number"
                                min={0}
                                max={24}
                                value={durationHours}
                                onChange={event => setDurationHours(event.target.value)}
                                aria-label="Hours"
                                className="h-10 w-20 rounded-lg border border-slate-500 bg-white px-3 text-gray-900"
                            />
                            <span className="text-slate-200">hr</span>
                            <input
                                type="number"
                                min={0}
                                max={59}
                                value={durationMinutes}
                                onChange={event => setDurationMinutes(event.target.value)}
                                aria-label="Minutes"
                                className="h-10 w-20 rounded-lg border border-slate-500 bg-white px-3 text-gray-900"
                            />
                            <span className="text-slate-200">min</span>
                        </div>
                    </div>
                    <button
                        type = "button"
                        onClick={handleFindTimes}
                        disabled={duration <= 0}
                        className="h-[41px] rounded-lg bg-blue-600 px-5 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                        Find Times
                    </button>
                </div> 
                {duration <= 0 && (
                    <p className="mt-2 text-center text-sm text-slate-300">
                        Enter a meeting length greater than 0.
                    </p>
                )}
                {duration > 0 && roundedDuration !== duration && (
                    <p className="mt-2 text-center text-sm text-slate-300">
                        The calendar works in 15-minute steps, so {duration} min is
                        treated as {roundedDuration} min.
                    </p>
                )}
                {searched && (
                <div className="mt-6">
                    {/* Heading and sort dropdown, centered */}
                    <div className="mb-4 flex flex-col items-center gap-3">
                        <h3 className="text-center text-lg font-medium text-white">
                            Suggested meeting times
                        </h3>
                        <select
                            value={sortBy}
                            onChange={event => setSortBy(event.target.value as 'best' | 'earliest')}
                            className="h-9 rounded-lg border border-slate-500 bg-white px-3 text-sm text-gray-900"
                        >
                            <option value="best">Best match first</option>
                            <option value="earliest">Earliest first</option>
                        </select>
                    </div>

                    {suggestions.length === 0 ? (
                        <p className="text-center text-white">No suitable meeting times available.</p>
                    ) : (
                        // flex-wrap + justify-center keeps a short last row centered
                        <div className="flex flex-wrap justify-center gap-4">
                            {shownSuggestions.map((time, index) => {
                                const key = `${time.col}-${time.startBlock}`;
                                const isSelected = selectedKey === key;
                                return (
                                    <div
                                        key={key}
                                        className={`flex w-full flex-col rounded-lg border p-4 text-center text-white sm:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_2rem)/3)] ${
                                            isSelected ? 'border-blue-400 bg-slate-600' : ''
                                        }`}
                                    >
                                        {/* Every card gets a label line so the content lines up */}
                                        {sortBy === 'best' && (
                                            <p className="mb-1 text-xs font-semibold tracking-wide text-blue-300">
                                                {index === 0 ? 'BEST MATCH' : `#${index + 1}`}
                                            </p>
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

                                        <p className="mt-2 text-sm text-white">
                                            <strong>Available:</strong>{' '}
                                            {time.availableIdx
                                                .map(i => personNames[i] ?? `Person ${i}`)
                                                .join(', ') || 'None'}
                                        </p>

                                        <p className="mt-1 text-sm text-white">
                                            <strong>Unavailable:</strong>{' '}
                                            {time.missingIdx
                                                .map(i => personNames[i] ?? `Person ${i}`)
                                                .join(', ') || 'No one'}
                                        </p>

                                        {/* mt-auto pushes the button to the bottom so all buttons line up */}
                                        <div className="mt-auto pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedKey(key);
                                                    onSelect?.(time);
                                                }}
                                                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                                            >
                                                {isSelected ? 'Selected ✓' : 'Choose this time'}
                                            </button>
                                        </div>
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

