/* =====================================================
   NEON SURVIVOR
   GAME JAVASCRIPT
===================================================== */


/* ================= CANVAS ================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* ================= SCREEN ================= */

const menu =
    document.getElementById("menu");

const howToPlay =
    document.getElementById("howToPlay");

const game =
    document.getElementById("game");

const gameOver =
    document.getElementById("gameOver");


/* ================= HUD ================= */

const levelElement =
    document.getElementById("level");

const hpElement =
    document.getElementById("hp");

const scoreElement =
    document.getElementById("score");

const timeElement =
    document.getElementById("time");

const menuHighScore =
    document.getElementById("menuHighScore");

const finalScore =
    document.getElementById("finalScore");

const finalHighScore =
    document.getElementById("finalHighScore");


/* ================= PAUSE ================= */

const pauseScreen =
    document.getElementById("pauseScreen");

const levelMessage =
    document.getElementById("levelMessage");


/* ================= GAME DATA ================= */

let score = 0;

let hp = 3;

let level = 1;

let gameTime = 0;

let running = false;

let paused = false;

let lastTime = 0;

let animationFrame;


/* ================= HIGH SCORE ================= */

let highScore =
    Number(
        localStorage.getItem(
            "neonSurvivorHighScore"
        )
    ) || 0;

menuHighScore.textContent =
    highScore;


/* ================= PLAYER ================= */

const player = {

    x: canvas.width / 2,

    y: canvas.height / 2,

    size: 22,

    speed: 300

};


/* ================= COIN ================= */

let coin = {

    x: 200,

    y: 200,

    size: 10,

    rotation: 0

};


/* ================= ENEMIES ================= */

let enemies = [];


/* ================= PARTICLES ================= */

let particles = [];


/* ================= KEYBOARD ================= */

const keys = {};


/* ================= HIT COOLDOWN ================= */

let hitCooldown = 0;


/* =====================================================
   SCREEN FUNCTIONS
===================================================== */


function showScreen(screen) {

    menu.classList.remove("active");

    howToPlay.classList.remove("active");

    game.classList.remove("active");

    gameOver.classList.remove("active");


    screen.classList.add("active");
}


/* ================= HOW TO PLAY ================= */

function showHowToPlay() {

    showScreen(howToPlay);

}


/* ================= BACK MENU ================= */

function backToMenu() {

    running = false;

    paused = false;

    cancelAnimationFrame(animationFrame);

    pauseScreen.classList.remove("active");

    showScreen(menu);

    menuHighScore.textContent =
        highScore;

}


/* ================= EXIT ================= */

function exitGame() {

    alert(
        "Terima kasih sudah bermain NEON SURVIVOR!"
    );

}


/* =====================================================
   GAME START
===================================================== */


function startGame() {

    cancelAnimationFrame(animationFrame);


    score = 0;

    hp = 3;

    level = 1;

    gameTime = 0;

    running = true;

    paused = false;

    lastTime =
        performance.now();

    hitCooldown = 0;


    enemies = [];

    particles = [];


    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;


    createCoin();


    /*
        Level 1
        Dua musuh
    */

    for (
        let i = 0;
        i < 2;
        i++
    ) {

        createEnemy();

    }


    pauseScreen.classList.remove(
        "active"
    );


    updateHUD();


    showScreen(game);


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =====================================================
   COIN
===================================================== */


function createCoin() {

    coin.x =
        50 +
        Math.random() *
        (canvas.width - 100);

    coin.y =
        50 +
        Math.random() *
        (canvas.height - 100);

    coin.rotation = 0;

}


/* =====================================================
   ENEMY
===================================================== */


function createEnemy() {

    let x;
    let y;


    do {

        x =
            40 +
            Math.random() *
            (canvas.width - 80);

        y =
            40 +
            Math.random() *
            (canvas.height - 80);

    }

    while (
        Math.hypot(
            x - player.x,
            y - player.y
        ) < 200
    );


    const speed =
        60 +
        level * 15 +
        Math.random() * 20;


    enemies.push({

        x: x,

        y: y,

        size: 15,

        speed: speed

    });

}


/* =====================================================
   PARTICLES
===================================================== */


function createParticles(
    x,
    y,
    type
) {

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            40 +
            Math.random() *
            100;


        particles.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                0.5 +
                Math.random() *
                0.4,

            type: type

        });

    }

}


/* =====================================================
   UPDATE GAME
===================================================== */


function update(dt) {

    gameTime += dt;

    hitCooldown =
        Math.max(
            0,
            hitCooldown - dt
        );


    /* ================= PLAYER ================= */

    let dx = 0;

    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        dy--;

    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        dy++;

    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        dx--;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        dx++;

    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );


        player.x +=
            (dx / length) *
            player.speed *
            dt;


        player.y +=
            (dy / length) *
            player.speed *
            dt;

    }


    /* ================= BOUNDARY ================= */

    player.x =
        Math.max(
            player.size,
            Math.min(
                canvas.width -
                player.size,
                player.x
            )
        );


    player.y =
        Math.max(
            player.size,
            Math.min(
                canvas.height -
                player.size,
                player.y
            )
        );


    /* ================= COIN ================= */

    coin.rotation +=
        dt * 5;


    const coinDistance =
        Math.hypot(
            player.x - coin.x,
            player.y - coin.y
        );


    if (
        coinDistance <
        player.size +
        coin.size +
        5
    ) {

        score += 10;


        createParticles(
            coin.x,
            coin.y,
            "coin"
        );


        createCoin();


        /*
            Setiap 50 score
            naik level
        */

        if (
            score > 0 &&
            score % 50 === 0
        ) {

            nextLevel();

        }

    }


    /* ================= ENEMIES ================= */

    enemies.forEach(enemy => {

        const angle =
            Math.atan2(
                player.y - enemy.y,
                player.x - enemy.x
            );


        enemy.x +=
            Math.cos(angle) *
            enemy.speed *
            dt;


        enemy.y +=
            Math.sin(angle) *
            enemy.speed *
            dt;


        const enemyDistance =
            Math.hypot(
                player.x - enemy.x,
                player.y - enemy.y
            );


        if (
            enemyDistance <
            player.size +
            enemy.size
        ) {

            damagePlayer();

        }

    });


    /* ================= TIME ENEMY ================= */

    const wantedEnemies =
        Math.min(
            2 +
            Math.floor(gameTime / 25) +
            level -
            1,
            9
        );


    while (
        enemies.length <
        wantedEnemies
    ) {

        createEnemy();

    }


    /* ================= PARTICLES ================= */

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx *
                dt;

            particle.y +=
                particle.vy *
                dt;

            particle.life -=
                dt;

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );


    updateHUD();

}


/* =====================================================
   DAMAGE PLAYER
===================================================== */


function damagePlayer() {

    if (
        hitCooldown > 0
    ) {

        return;

    }


    hp--;

    hitCooldown = 1;


    createParticles(
        player.x,
        player.y,
        "hit"
    );


    /*
        Dorong pemain sedikit
    */

    player.x +=
        Math.random() > 0.5
            ? 25
            : -25;


    player.y +=
        Math.random() > 0.5
            ? 25
            : -25;


    if (hp <= 0) {

        endGame();

    }

}


/* =====================================================
   LEVEL UP
===================================================== */


function nextLevel() {

    level++;


    /*
        Tambahkan musuh
    */

    const number =
        Math.min(
            2 + level,
            9
        );


    while (
        enemies.length <
        number
    ) {

        createEnemy();

    }


    levelMessage.textContent =
        "LEVEL " +
        level;


    levelMessage.classList.add(
        "show"
    );


    setTimeout(
        () => {

            levelMessage.classList.remove(
                "show"
            );

        },
        1000
    );


    createParticles(
        player.x,
        player.y,
        "level"
    );

}


/* =====================================================
   HUD
===================================================== */


function updateHUD() {

    levelElement.textContent =
        level;

    hpElement.textContent =
        hp;

    scoreElement.textContent =
        score;

    timeElement.textContent =
        Math.floor(gameTime);

}


/* =====================================================
   PAUSE
===================================================== */


function togglePause() {

    if (!running) {

        return;

    }


    paused =
        !paused;


    if (paused) {

        pauseScreen.classList.add(
            "active"
        );

    } else {

        pauseScreen.classList.remove(
            "active"
        );


        lastTime =
            performance.now();

    }

}


/* =====================================================
   GAME OVER
===================================================== */


function endGame() {

    running = false;

    cancelAnimationFrame(
        animationFrame
    );


    finalScore.textContent =
        score;


    if (
        score >
        highScore
    ) {

        highScore =
            score;


        localStorage.setItem(
            "neonSurvivorHighScore",
            highScore
        );

    }


    finalHighScore.textContent =
        highScore;


    showScreen(
        gameOver
    );

}


/* =====================================================
   DRAW BACKGROUND
===================================================== */


function drawBackground() {

    /*
        Background
    */

    ctx.fillStyle =
        "#070914";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Grid
    */

    ctx.strokeStyle =
        "rgba(0,240,255,0.08)";

    ctx.lineWidth = 1;


    const gridSize = 40;


    for (
        let x = 0;
        x <= canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y <= canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }


    /*
        Center glow
    */

    const glow =
        ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            10,
            canvas.width / 2,
            canvas.height / 2,
            450
        );


    glow.addColorStop(
        0,
        "rgba(0,240,255,0.08)"
    );


    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


/* =====================================================
   DRAW DIAMOND
===================================================== */


function drawDiamond(
    x,
    y,
    size,
    fill,
    glow
) {

    ctx.save();


    ctx.beginPath();

    ctx.moveTo(
        x,
        y - size
    );

    ctx.lineTo(
        x + size,
        y
    );

    ctx.lineTo(
        x,
        y + size
    );

    ctx.lineTo(
        x - size,
        y
    );

    ctx.closePath();


    ctx.fillStyle =
        fill;


    ctx.shadowBlur =
        20;


    ctx.shadowColor =
        glow;


    ctx.fill();


    ctx.shadowBlur = 0;


    ctx.strokeStyle =
        glow;


    ctx.lineWidth = 2;

    ctx.stroke();


    ctx.restore();

}


/* =====================================================
   DRAW PLAYER
===================================================== */


function drawPlayer() {

    ctx.save();


    /*
        Efek berkedip
        saat terkena musuh
    */

    if (
        hitCooldown > 0 &&
        Math.floor(
            hitCooldown * 10
        ) % 2 === 0
    ) {

        ctx.globalAlpha =
            0.35;

    }


    drawDiamond(
        player.x,
        player.y,
        player.size,
        "#00f0ff",
        "#9fffff"
    );


    /*
        Inti player
    */

    ctx.fillStyle =
        "#061018";


    ctx.beginPath();


    ctx.arc(
        player.x,
        player.y,
        5,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

}


/* =====================================================
   DRAW COIN
===================================================== */


function drawCoin() {

    const size =
        coin.size +
        Math.sin(
            coin.rotation
        ) * 2;


    drawDiamond(
        coin.x,
        coin.y,
        size,
        "#ffe600",
        "#fff6a0"
    );

}


/* =====================================================
   DRAW ENEMIES
===================================================== */


function drawEnemies() {

    enemies.forEach(
        enemy => {

            drawDiamond(
                enemy.x,
                enemy.y,
                enemy.size,
                "#ff2d9b",
                "#ff9bd0"
            );


            /*
                Mata musuh
            */

            ctx.fillStyle =
                "#250018";


            ctx.fillRect(
                enemy.x - 5,
                enemy.y - 1,
                10,
                2
            );

        }
    );

}


/* =====================================================
   DRAW PARTICLES
===================================================== */


function drawParticles() {

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life
                );


            if (
                particle.type ===
                "coin"
            ) {

                ctx.fillStyle =
                    "#ffe600";

            } else if (
                particle.type ===
                "hit"
            ) {

                ctx.fillStyle =
                    "#ff2d9b";

            } else {

                ctx.fillStyle =
                    "#00f0ff";

            }


            ctx.beginPath();


            ctx.arc(
                particle.x,
                particle.y,
                3,
                0,
                Math.PI * 2
            );


            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;

}


/* =====================================================
   DRAW GAME
===================================================== */


function draw() {

    drawBackground();

    drawCoin();

    drawEnemies();

    drawPlayer();

    drawParticles();


    /*
        Text game
    */

    ctx.fillStyle =
        "rgba(232,246,255,0.6)";


    ctx.font =
        "12px Consolas";


    ctx.fillText(
        "NEON SURVIVOR // LEVEL " +
        level,
        15,
        22
    );

}


/* =====================================================
   GAME LOOP
===================================================== */


function gameLoop(time) {

    if (!running) {

        return;

    }


    const dt =
        Math.min(
            (time - lastTime) /
            1000,
            0.033
        );


    lastTime = time;


    if (!paused) {

        update(dt);

    }


    draw();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =====================================================
   KEYBOARD EVENTS
===================================================== */


document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        keys[key] = true;


        /*
            Jangan scroll
            menggunakan arrow
        */

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(key)
        ) {

            event.preventDefault();

        }


        /*
            ESC = PAUSE
        */

        if (
            key === "escape" &&
            running
        ) {

            togglePause();

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        const key =
            event.key.toLowerCase();


        keys[key] = false;

    }
);


/* =====================================================
   INITIAL DRAW
===================================================== */

drawBackground();