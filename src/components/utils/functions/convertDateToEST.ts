export function convertDatesToEST(dates: Date[]): Date[] {
  return dates.map(date => {
    console.log("Before:", date);

    // Format the date as a string in EST
    const estString = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
    console.log("EST String:", estString);

    // Create a new Date object from the EST string
    const estDate = new Date(estString);
    console.log("After:", estDate);

    return estDate;
  });
}
