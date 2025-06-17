import { timezones } from "../constants/timezones";

export function getUserTimezone() {
    
    const userTimezone =  Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    
    // Check if user's timezone is already in the list
    if (timezones.includes(userTimezone)) {
        return userTimezone;
    }
        
    const now = new Date();
    
    const userOffset = now.getTimezoneOffset() * -1; // Flip sign to match standard convention
    
    
    let closestTimezone = timezones[0];
    let smallestDifference = Infinity;
    
    // Compare with each timezone in the list
    timezones.forEach(tz => {
        try {
            const targetDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
            const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
            
            const targetOffset = (targetDate.getTime() - utcDate.getTime()) / (1000 * 60);
            
            const difference = Math.abs(userOffset - targetOffset);
            
            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestTimezone = tz;
            }
        } catch (error) {
            //@ts-ignore
            console.log(`Error processing ${tz}:`, error.message);
        }
    });
    
    return closestTimezone;
}