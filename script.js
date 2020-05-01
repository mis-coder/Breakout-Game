/*---------------------------Selecting elements----------------------------*/
const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rulesEl = document.getElementById('rules');
const endGameEl = document.getElementById('end-game');
const livesEl = document.getElementById('lives');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let totalLives = 3;
let flag = true;

const bricksRowCount = 6;
const bricksColumnCount = 10;

const coords ={
         x: canvas.width,
         y: canvas.height     
}

const lives = [];
for(let i = 0; i < totalLives ; i++){
    const liveEl = document.createElement('i');
    liveEl.className = 'fas fa-heart';
    lives.push(liveEl);
    livesEl.appendChild(liveEl);
}


/*-----------------create ball props---------------------------------------*/
const ball = {
    xcoord: coords.x / 2,
    ycoord: coords.y /2,
    size: 11,
    speed: 8,
    dx: 4,
    dy: -4
};

/*----------------------------------paddle props--------------------------------------------------*/
const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 25,
    w: 120,
    h: 16,
    speed: 8,
    dx: 0
  };


/*------------------brick props-----------------------*/
const brick = {
    w: 70,
    h: 26,
    padding: 5,
    offsetX: 30,
    offsetY: 50,
    visible: true
};



                                       //-- //-- //--        FUNCTIONS       --// --// --//
/*------------------draw ball on canvas-----------------------------------*/
function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.xcoord, ball.ycoord, ball.size, 0 , Math.PI * 2);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    ctx.closePath();
}


/*------------------draw paddle on canvas-----------------------------------*/
function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#32CD32';
    ctx.fill();
    ctx.closePath();
}


/*----------------------draw the score on the canvas----------------------------------*/
function drawText(){
    ctx.font = '20px arial';
    ctx.fillText(`Score: ${score}` , canvas.width - 100 , 30);
    ctx.fillText(`Lives:`, canvas.width - 780,  30);
}


/*------------------------create bricks--------------------------------------------*/
const bricks = [];
for(let i = 0; i < bricksColumnCount; i++){
    bricks[i] = [];
    for(let j = 0; j < bricksRowCount; j++){
        const x = i * (brick.w + brick.padding) + brick.offsetX;
        const y = j * (brick.h + brick.padding) + brick.offsetY;
        bricks[i][j] = {x,y, ...brick};
    }
}

/*--------------------------draw bricks on the canvas---------------------------------------*/
function drawBricks(){
     bricks.forEach(column => {
      column.forEach(brick => {
           ctx.beginPath();
           ctx.rect(brick.x, brick.y, brick.w, brick.h);
           ctx.fillStyle = brick.visible ? "#E74C3C " : 'transparent';
           ctx.fill();
        //    ctx.stroke();
           ctx.closePath();
      });
     });
}

/*----------------------all the drawing goes here--------------------------------*/
function draw(){
    // clear canvas
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     drawBricks();
     drawBall();
     drawPaddle();
     drawText();
}


/*-------------------------------move the paddle-----------------------------------------------------*/
function movePaddle(){
    paddle.x += paddle.dx;

    // if wall is detected
    if(paddle.x + paddle.w  > canvas.width){
        paddle.x = canvas.width - paddle.w;
    }

    if(paddle.x < 0){
        paddle.x = 0;
    }
}

/*------------------------move the ball------------------------------------------------------------*/
function moveBall(){
    ball.xcoord += ball.dx;
    ball.ycoord += ball.dy;

    //to detect wall collision 
    //1. left and right walls
    if(ball.xcoord + ball.size > canvas.width || ball.xcoord - ball.size < 0){
        ball.dx *= -1;
    }

    //2. top and bottom walls
    if(ball.ycoord + ball.size > canvas.height || ball.ycoord - ball.size < 0){
        ball.dy *= -1;
    }

    //to detect paddle collision
    if(ball.xcoord - ball.size >= paddle.x  &&        // check right side of paddle
       ball.xcoord + ball.size <= paddle.x + paddle.w &&   // check left side of paddle
       ball.ycoord + ball.size >= paddle.y ) // check top side of paddle 
       {        
        ball.dy = -ball.speed;
    }

    //brick collsions
    bricks.forEach(column => {
       column.forEach(brick => {
           if(brick.visible){
               if(ball.xcoord - ball.size > brick.x &&      //check right side of brick
                  ball.xcoord + ball.size < brick.x + brick.w  &&  //check left side of brick
                  ball.ycoord + ball.size > brick.y &&             //check top side of brick
                  ball.ycoord - ball.size < brick.y + brick.h) //check bottom side of brick
                  {
                        ball.dy *= -1;
                        brick.visible = false;
                        updateScore();
                  }
           }
       });
    });

    //hit bottom ball lose
    if(ball.ycoord + ball.size > canvas.height){
        updateLives();
    }

    checkWinLose();
}

/*----------------------update scores---------------------------------------*/
function updateScore(){
    score++;
}

/*-----------------------update Lives---------------------------------------------------------*/
function updateLives(){
        totalLives--;
      let live = lives.pop();
       livesEl.removeChild(live);
}

/*--------------------reset complete game------------------------------------------------*/
function resetGame(){
    window.location.reload();
}


/*------------------------check if user won or lost---------------------------*/
function checkWinLose(){
    if(score === (bricksColumnCount * bricksRowCount) && totalLives >= 1)
    {
        endGameEl.classList.add('show');
        endGameEl.innerHTML = `
            <p>Bravo! You broke all of them.</p>
            <button onclick="resetGame()">Play Again</button>        
        `;
        flag = false;
    }
    else if(totalLives < 1 && score !== (bricksColumnCount * bricksRowCount) ){
        endGameEl.classList.add('show');
        endGameEl.innerHTML = `
            <p>You ran out of lives!</p>
            <button onclick="resetGame()">Play Again</button>        
        `;
         flag = false;
    }
}

/*----------------------------------update canvas drawing and animation--------------------------------------*/
function updateCanvas(){
    draw();
    movePaddle();
    moveBall();
    if(flag === false) return;

    requestAnimationFrame(updateCanvas);
}

updateCanvas();

/*-------------------------------show the rules -----------------------------------------*/
function showRules(){
    rulesEl.classList.toggle('show');
}

/*-------------------------------hide the rules -----------------------------------------*/
function hideRules(){
    rulesEl.classList.remove('show');
}

/*------------------------------when user holds a key----------------------------------*/
function keyHold(e){
    if(e.key === 'ArrowRight' || e.key === 'Right' ){
        paddle.dx = paddle.speed;
    }else if(e.key === 'ArrowLeft' || e.key === 'Left'){
        paddle.dx = -paddle.speed;
    }
}

/*---------------------------------when user release a key----------------------------------*/
function keyRelease(e){
    if( e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left'  || e.key === 'ArrowLeft' ){
      paddle.dx = 0;
    }
   
}


                 
                                        //-- //-- //--        EVENT HANDLERS       --// --// --//
/*------------------------------keyboard event handlers-------------------------*/
document.addEventListener('keydown',keyHold);
document.addEventListener('keyup',keyRelease);


/*------------------------show rules and close events--------------------------*/
rulesBtn.addEventListener('click',showRules);
closeBtn.addEventListener('click',hideRules);

