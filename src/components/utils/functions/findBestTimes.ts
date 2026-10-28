import { Availability } from '../../../types';

export interface BestTimeWindow 
{
    col: number; 
    startBlock: number; 
    endBlock: number; 
    availableIdx: number[];
    missingIdx: number[];
}

export function findBestTimes
(
    availabilities: Availability[],
    personIdx: number[],
    numCols: number,
    numBlocks: number,
    durationMinutes: number,
    blockMinutes = 15, 
    topN = 5
): BestTimeWindow[] 
{
    const windowSize = Math.ceil(durationMinutes/blockMinutes);
    const all:BestTimeWindow[]=[];

    //check each day separately
    for (let col = 0; col < numCols; col++) {
    const blocksForDay = Math.min(
        ...personIdx.map((p) => availabilities[p]?.[col]?.length ?? 0)
    );

    for (let start = 0; start + windowSize <= blocksForDay; start++) {
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
            a.startBlock - b.startBlock
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