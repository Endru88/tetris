const canvas = document.getElementById("tetris");
const ctx = canvas.getContext('2d');
const scale = 20;
ctx.scale(scale, scale);
const tWidth = canvas.width / scale;
const tHeight = canvas.height / scale;

//Vytvoření dílků pomocí 2 rozměrného pole
const pieces = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0]
    ],
    [
        [0, 0, 0],
        [3, 3, 0],
        [0, 3, 3]
    ],
    [
        [0, 0, 0],
        [0, 4, 4],
        [4, 4, 0]
    ],
    [
        [5, 0, 0],
        [5, 0, 0],
        [5, 5, 0]
    ],
    [
        [0, 0, 6],
        [0, 0, 6],
        [0, 6, 6]
    ],
    [
        [0, 0, 0],
        [7, 7, 7],
        [0, 7, 0]
    ]
];
//Barvy
const colors = [
    null,
    '#F7FF00',
    '#00FFFB',
    '#FF2D00',
    '#00FF27',
    '#FFB900',
    '#0036FF',
    '#C100FF'
];

let arena = [];
let rand;
let interval = 1000;
let lastTime = 0;
let count = 0;
let score = 0;
let final = 0;
//Pozice hráče
const player = {
    pos: {x: 0, y: 1},
    matrix: null,
    color: null
}

//Vygenerování dílku
rand = Math.floor(Math.random() * pieces.length);
player.matrix = pieces[rand];
player.color = colors[rand+1];



//FUNKCE
//----------------------------------------------------------------------------------------------------------//

//Vykreslení dílku
function drawMatrix(matrix, x, y) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j])
                ctx.fillRect(x + j, y + i, 1, 1);
        }
    }
}

//Rotace dílku
function rotateMatrix(matrix, dir) {
    let newMatrix = [];

    for (let i in matrix)
        newMatrix.push([]);

    if (dir === 1) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                newMatrix[j][matrix.length - i - 1] = matrix[i][j];
            }
        }
    } else {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                newMatrix[matrix.length - j - 1][i] = matrix[i][j];
            }
        }
    }

    return newMatrix;
}

//poslední nejvyšší úroveň v aréně, díklů, okraje
function collides(player, arena) {
    for (let i = 0; i < player.matrix.length; i++) {
        for (let j = 0; j < player.matrix[i].length; j++) {
            if (player.matrix[i][j] && arena[player.pos.y + i + 1][player.pos.x + j + 1])
                return 1;
        }
    }

    return 0;
}

//Funkce na zjištění celého plného řádku
function mergeArena(matrix, x, y) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            arena[y+i+1][x+j+1] = arena[y+i+1][x+j+1] || matrix[i][j];
        }
    }
}

//vymazání spodní řady s blocky 
function clearBlocks() {
    for (let i = 1; i < arena.length-2; i++) {
        let clear = 1;
        
        for (let j = 1; j < arena[i].length-1; j++) {
            if (!arena[i][j])
                clear = 0;
                
        }

        if (clear) {
            let r = new Array(tWidth).fill(0);
            r.push(1);
            r.unshift(1);
            
            
        
            arena.splice(i, 1);
            arena.splice(1, 0, r);
        }
        //scoreText();
    }
    
}
function scoreText(){
    if (score == 1){
        final+=40
    }
    else if(score == 2){
        final +=100
    }
    else if(score == 3){
        final +=300
    }
    else if(score == 4){
        final +=1200
    }
    console.log(final)
}

//grafika areny
function drawArena() {
    for (let i = 1; i < arena.length-2; i++) {
        for (let j = 1; j < arena[i].length-1; j++) {
            if (arena[i][j]) {
                ctx.fillStyle = colors[arena[i][j]];
                ctx.fillRect(j-1, i-1, 1, 1);
            }
        }
    }
}

//vykreslení array 
function initArena() {
    arena = [];

    const r = new Array(tWidth + 2).fill(1);
    arena.push(r);

    for (let i = 0; i < tHeight; i++) {
        let row = new Array(tWidth).fill(0);
        row.push(1);
        row.unshift(1);

        arena.push(row);
    }

    arena.push(r);
    arena.push(r);
}
//konec hry
function gameOver() {
    for (let j = 1; j < arena[1].length-1; j++){
        if (arena[1][j])
        return initArena();
    }
    return;
}

//padání dílku, rychlost padání,
function update(time = 0) {

    const dt = time - lastTime;
    lastTime = time;
    count += dt;

    if (count >= interval) {
        player.pos.y++;
        count = 0;
    }
    //pokud dílek narazí na jiný, vykresli se nový
    if (collides(player, arena)) {
        mergeArena(player.matrix, player.pos.x, player.pos.y-1);
        clearBlocks();
        gameOver();

        player.pos.y = 1;
        player.pos.x = 0;

        rand = Math.floor(Math.random() * pieces.length);
        player.matrix = pieces[rand];
        player.color = colors[rand+1];

        interval = 1000;
    }
    //výplň pozadí
    ctx.fillStyle = "rgb(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawArena();
    ctx.fillStyle = player.color;
    drawMatrix(player.matrix, player.pos.x, player.pos.y);

    requestAnimationFrame(update);
}

//controles, poslouchání klávec
document.addEventListener("keydown", event => {

    if (event.keyCode === 37 && interval-1) {
        player.pos.x--;
        if (collides(player, arena))
            player.pos.x++;
    } else if (event.keyCode === 39 && interval-1) {
        player.pos.x++;
        if (collides(player, arena))
            player.pos.x--;
    } else if (event.keyCode === 40) {
        player.pos.y++;
        count = 0;
    } else if (event.keyCode === 38) {
        player.matrix = rotateMatrix(player.matrix, 1);
        if (collides(player, arena))
            player.matrix = rotateMatrix(player.matrix, -1);
    } else if (event.keyCode === 32) {
        interval = 1;
    }

});

initArena();
update();
