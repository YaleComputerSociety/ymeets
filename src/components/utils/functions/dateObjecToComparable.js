export function dateObjectToComparable(dateObject) {


    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();
    const year = dateObject.getFullYear();

    const dateString = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return dateString

}