window.onload = function () {
    var canvasWidth = 1500;
    var canvasHeight = 700;
    var blockSize = 50;
    var ctx;
    var delay = 100;
    var snakee;
    var applee;
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;
    var timeout;
    var snakeHeadImg = new Image(); // Image pour la tête du serpent
    snakeHeadImg.src = 'snake-head.png'; // Chemin vers l'image de la tête du serpent
    var eatSound = new Audio('eat.mp3'); 
    var img = new Image();
    img.src = 'tulipe.png';

    snakeHeadImg.onload = function() {
        img.onload = function() {
            init();
        };
    };
    function init() {
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid #7451eb ";
        canvas.style.margin = "20px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#f1efe7";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }
    var animationFrameId;
    function refreshCanvas() {
        snakee.advance();
        if (snakee.checkCollision()) {
            gameOver();
        } else {
            if (snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while (applee.isOnSnake(snakee));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snakee.draw();
            applee.draw();
            animationFrameId = requestAnimationFrame(refreshCanvas);
        }
    }
    
    var lastTime = 0;
    var delay = 80; 

    function refreshCanvas(time) {
        if (time - lastTime >= delay) { // Se déplace seulement si le délai est atteint
            snakee.advance();
            if (snakee.checkCollision()) {
                gameOver();
                return;
            } else {
                if (snakee.isEatingApple(applee)) {
                    // 2. Jouer le son lorsque le serpent mange une pomme
                    eatSound.play();

                    score++;
                    snakee.ateApple = true;
                    do {
                        applee.setNewPosition();
                    } while (applee.isOnSnake(snakee));
                }
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                drawScore();
                snakee.draw();
                applee.draw();
            }
            lastTime = time; // Met à jour le dernier temps de mouvement
        }
        animationFrameId = requestAnimationFrame(refreshCanvas);
    }

    function gameOver() {
        cancelAnimationFrame(animationFrameId);
        ctx.save();
        ctx.font = "40px Honk, system-ui";
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 180);
        ctx.fillText("Perdu !", centreX, centreY - 260);
        
        var newWidth = 100;
        var scaleFactor = newWidth / img.width;
        var newHeight = img.height * scaleFactor;
        var imageX = centreX - newWidth / 2;
        var imageY = 360;
        
        ctx.drawImage(img, imageX, imageY, newWidth, newHeight);

        ctx.fillText("Best score Sydney : 6", centreX, canvasHeight - 60);
        ctx.fillText("t nul", centreX, canvasHeight - 90);
        ctx.restore();
    }

    function restart() {
        score = 0;
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        applee = new Apple([10, 10]);
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = "95px Alfa Slab One, serif";
        ctx.fillStyle = "#22004c";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;

        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }

    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }
    var snakeBodyImg = new Image();
    snakeBodyImg.src = 'snake-body.png';
    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
    
        this.draw = function () {
            ctx.save();
            for (var i = 0; i < this.body.length; i++) {
                var x = this.body[i][0] * blockSize;
                var y = this.body[i][1] * blockSize;
                
                if (i === 0) {
                    // Dessine l'image de la tête du serpent pour le premier segment
                    ctx.drawImage(snakeHeadImg, x, y, blockSize, blockSize);
                } else {
                    // Dessine l'image pour les autres segments du corps
                    ctx.drawImage(snakeBodyImg, x, y, blockSize, blockSize);
                }
            }
            ctx.restore();
        };

        this.advance = function () {
            var nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw ("Invalid Direction");
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else {
                this.ateApple = false;
            }
        };

        this.setDirection = function (newDirection) {
            var allowedDirections;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ("Invalid Direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        this.checkCollision = function () {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }

            for (var i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };

        this.isEatingApple = function (appleToEat) {
            var head = this.body[0];
            return head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1];
        };
    }

    function Apple(position) {
        this.position = position;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#1cc68d";
            ctx.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        };

        this.setNewPosition = function () {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function (snakeToCheck) {
            var isOnSnake = false;

            for (var i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }

    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;
        switch (key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
}