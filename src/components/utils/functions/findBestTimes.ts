import { Availability, BoundingBox } from '../../../types';

export interface BestTimeWindow
{
    col: number;
    startBlock: number;
    endBlock: number;
    availableIdx: number[];
    missingIdx: number[];
}

/** The calendar selection covering a suggested window (for export and labels). */
export const windowToSelection = (w: BestTimeWindow): BoundingBox =>
    new BoundingBox(
        { col: w.col, block: w.startBlock },
        { col: w.col, block: w.endBlock }
    );

/**
 * @param blockStartMinutes Start of each stored block in minutes, from
 *   getBlockMinutes. Bounds the search to the calendar's real blocks, and
 *   windows only cover blocks that follow each other in time (a column that
 *   wraps past midnight can store 01:45 next to 20:00).
 */
export function findBestTimes
(
    availabilities: Availability[],
    personIdx: number[],
    numCols: number,
    blockStartMinutes: number[],
    durationMinutes: number,
    blockMinutes = 15,
    topN = 5
): BestTimeWindow[]
{
    if (personIdx.length === 0) return [];
    const windowSize = Math.ceil(durationMinutes/blockMinutes);
    if (windowSize <= 0) return [];
    const all:BestTimeWindow[]=[];

    // A window is a real time span only if each block starts blockMinutes after the previous one
    const isContinuous = (start: number): boolean => {
        for (let i = start; i < start + windowSize - 1; i++) {
            if (blockStartMinutes[i + 1] - blockStartMinutes[i] !== blockMinutes) {
                return false;
            }
        }
        return true;
    };

    // Every day has the same blocks. A person with a shorter or missing row
    // just counts as unavailable for the blocks they don't have.
    const blocksForDay = blockStartMinutes.length;

    //check each day separately
    for (let col = 0; col < numCols; col++) {
        for (let start = 0; start + windowSize <= blocksForDay; start++) {
            if (!isContinuous(start)) continue;

            const availableIdx: number[] = [];
            const missingIdx: number[] = [];

            //for each person check that every block in the window is free
            for(const p of personIdx)
            {
                let free = true;
                for(let i = 0; i < windowSize; i++)
                {
                    if(availabilities[p]?.[col]?.[start+i] !== true)
                    {
                        free = false;
                        break; //one busy block is enough to rule this person out
                    }
                }
                (free ? availableIdx : missingIdx).push(p);
            }

            //only keep windows where at least one person can make it
            if(availableIdx.length > 0)
            {
                all.push
                (
                    {
                        col,
                        startBlock: start,
                        endBlock: start + windowSize - 1,
                        availableIdx,
                        missingIdx,
                    }
                );
            }
        }
    }

    //rank mmost people available; when there is ties, earliest day and earliest time is ranked first
    all.sort
    (
        (a, b) =>
            b.availableIdx.length - a.availableIdx.length ||
            a.col - b.col ||
            blockStartMinutes[a.startBlock] - blockStartMinutes[b.startBlock]
    );

    //skip any window that overlaps one we've already picked
    const picked: BestTimeWindow[] = [];
    for(const w of all)
    {
        const overlaps = picked.some
        (
            (p) =>
                p.col == w.col &&
            w.startBlock <= p.endBlock &&
            w.endBlock >= p.startBlock
        );
        if(!overlaps) picked.push(w);
        if(picked.length == topN) break; //stop once there is enough
    }
    return picked;
}
