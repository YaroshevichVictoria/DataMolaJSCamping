let players = ['Computer','You'],
    winningCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winContainer = document.getElementById('containerWin');
const winner = document.getElementById('win');
const resetButton = document.getElementById('resetButton');
const box = document.getElementById('box');
const fields = document.getElementsByClassName('field');
let arr = [];
let arrComp = [];

function isWinning(arr, player) {
    for (let i = 0; i < winningCombinations.length; i++) {
        if (arr.sort().join().includes((winningCombinations[i]).sort().join())) {
            winContainer.style.visibility = 'visible';
            winner.textContent = `${player} won!`;
        }
    }
}

function computer() {
    if ([...fields].find(e => e.value === '')) {
        let id = Math.floor(Math.random() * 10);
        if (arr.indexOf(id) === -1 && id <= 8 && arrComp.indexOf(id) === -1) {
            let field = document.getElementById(id.toString());
            field.value = 'o';
            arrComp.push(id);
            if (arrComp.length >= 3) isWinning(arrComp, players[0]);
        } else computer();
    }else isWinning(arr,players[1]);
}
box.addEventListener('click', (event) => {
    const target = event.target;
    if(target.value === '') {
        arr.push(Number(target.id));
        if (target.className === 'field') {
            target.value = 'x';
        }
        if (arr.length >= 3) isWinning(arr, players[1]);
        computer();
    }
});

resetButton.addEventListener('click',reset);
function reset() {
    const fields = document.querySelectorAll('.field');
    fields.forEach((field) => field.value = '');
    arr.splice(0);
    arrComp.splice(0);
    winContainer.style.visibility = 'hidden';
}
