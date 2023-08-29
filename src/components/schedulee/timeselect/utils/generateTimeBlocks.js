export function generateTimeBlocks(startTime, endTime) {
    const blocks = [];
    const format = { hour: 'numeric', minute: 'numeric', hour12: false };
    
    // Parse the input times into Date objects
    const start = new Date(`2023-08-19 ${startTime}`);
    const end = new Date(`2023-08-19 ${endTime}`);
    
    // Iterate over the time range in 30-minute intervals
    while (start < end) {
        const formattedTime = start.toLocaleTimeString('en-US', format);
        blocks.push(formattedTime);
        start.setMinutes(start.getMinutes() + 30);
    }
    
    return blocks
}