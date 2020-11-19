function getDay(date) {
    let day = date.getDay();
    if (day === 0) day = 7;
    return day - 1;
}
function createCalendar(elem, year, month) {
    let element = document.getElementById(elem);
    let table = '<table><tr><th>пн</th><th>вт</th><th>ср</th><th>чт</th><th>пт</th><th>сб</th><th>вс</th></tr><tr>';
    let newDate = new Date(year, month-1);

    for (let i = 0; i < getDay(newDate); i++) {
        table += '<td></td>';
    }

    while (newDate.getMonth() === month-1) {
        table += '<td>' + newDate.getDate() + '</td>';

        if (getDay(newDate) % 7 === 6) {
            table += '</tr><tr>';
        }

        newDate.setDate(newDate.getDate() + 1);
    }


    if (getDay(newDate) !== 0) {
        for (let i = getDay(newDate); i < 7; i++) {
            table += '<td></td>';
        }
    }

    table += '</tr></table>';

    element.innerHTML += table;
}
console.log(createCalendar('cal',2020,11));
console.log(createCalendar('cal',2020,10));
console.log(createCalendar('cal',2020,9));
