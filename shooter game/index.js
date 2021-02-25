

            /* HOW TO PLAY:
            *  You are Cupid now. Shoot arrows at the hearts!
            *  The faster you shoot all the hearts, the better your score.
            *  But be warned: if you hit any particular heart more than once, it will break! 
            *  Your score will be lowered by the passing of time as well as every miss and every broken heart.
            *  The game ends when all the hearts have been shot.
            *  Good luck!
            */
			
			/* About the implementation:
			*  The game utilizes two canvas elements: canvasMain is seen by the player, while canvasHelper 
			*  is used to discern the hearts from one another. Each heart has a unique colour on the 
			*  helperCanvas. Therefore, the hit is detected by checking the colour of the pixel the player 
			*  clicked on.
			*/

            const CANVAS_WIDTH = 1200;
            const CANVAS_HEIGHT = 600;
			
			/* While changing the value of this variable will not change the background colour of the 
			*  visible canvas, this information needs to be available so that this colour will not be 
			*  used to colour the hearts on the helper canvas.
			*/
			const CANVAS_FILL_COLOUR = "rgb(0, 0, 0)";

            let HEARTS = [];
            const NUMBER_OF_HEARTS = 15;
            const RADIUS = 20;
            const HEART_STROKE_COLOUR = "rgb(0, 0, 0)";
            const HEART_FILL_COLOUR = "rgb(220, 20, 60)";

            const LOCATION_MIN_X = 0 + (CANVAS_WIDTH / 10);
            const LOCATION_MAX_X = CANVAS_WIDTH - (CANVAS_WIDTH / 10);
            const LOCATION_MIN_Y = 0 + (CANVAS_HEIGHT / 10);
            const LOCATION_MAX_Y = CANVAS_HEIGHT - (CANVAS_HEIGHT / 10);
            const VELOCITY_MIN = 3;
            const VELOCITY_MAX = 5;
            const FALL_VELOCITY = 5;

            let PLAYER_SCORE = 100000;
            const MISS_PENALTY = 80;
            const BROKEN_HEART_PENALTY = 1000;
            const TIME_PENALTY = 40;
            let INTERVAL;
            let HEARTS_LEFT = NUMBER_OF_HEARTS;


            class Heart {
                constructor(location, velocity, colour, shot = false, arrowLocation = [], broken = false) {
                    this._location = location;
                    this._velocity = velocity;
                    this._colour = colour;
                    this._shot = shot;
                    this._arrowLocation = arrowLocation;
                    this._broken = broken;
                }

                get location() {
                    return this._location;
                }

                set location(newLocation) {
                    this._location = newLocation;
                }

                get velocity() {
                    return this._velocity;
                }

                set velocity(newVelocity) {
                    this._velocity = newVelocity;
                }

                /* The colour is used to tell different hearts apart
                *  and is applied only on the helper canvas.
                */
                get colour() {
                    return this._colour;
                }

                set colour(newColour) {
                    this._colour = newColour;
                }

                get shot() {
                    return this._shot;
                }

                set shot(newShot) {
                    this._shot = newShot;
                }

                get arrowLocation() {
                    return this._arrowLocation;
                }

                set arrowLocation(newLocation) {
                    this._arrowLocation = newLocation;
                }

                get broken() {
                    return this._broken;
                }

                set broken(newBroken) {
                    this._broken = newBroken;
                }

                draw(canvas, strokeColour, fillColour) {
                    let context = canvas.getContext("2d");

                    context.beginPath();

                    context.arc(this.location[0], this.location[1], RADIUS, Math.PI, 0);
                    context.arc(this.location[0] + (RADIUS * 2), this.location[1], RADIUS, Math.PI, 0);
                    context.lineTo(this.location[0]  + (RADIUS), this.location[1] + (RADIUS * 2));
                    context.lineTo(this.location[0]  - (RADIUS), this.location[1]);

                    context.strokeStyle = strokeColour;
                    context.lineWidth = 1;
                    context.stroke();
                    context.fillStyle = fillColour;
                    context.fill();

                    // Draw the mark if a heart is broken.
                    if (this.broken) {
                        context.beginPath();
                        context.moveTo(this.location[0] + RADIUS, this.location[1]);
                        context.lineTo(this.location[0], this.location[1] + RADIUS);
                        context.lineTo(this.location[0] + RADIUS, this.location[1] + RADIUS);
                        context.lineTo(this.location[0] + RADIUS, this.location[1] + RADIUS * 2);
                        context.stroke();
                    }
                }

                drawArrow(canvas) {
                    let context = canvas.getContext("2d");
                    context.beginPath();
                    context.moveTo(this.arrowLocation[0], this.arrowLocation[1]);
                    context.lineTo(this.arrowLocation[0] + RADIUS, this.arrowLocation[1] - RADIUS);
                    context.lineTo(this.arrowLocation[0] + RADIUS, this.arrowLocation[1] - RADIUS - (RADIUS / 4));
                    context.moveTo(this.arrowLocation[0] + RADIUS, this.arrowLocation[1] - RADIUS);
                    context.lineTo(this.arrowLocation[0] + RADIUS + (RADIUS / 4), this.arrowLocation[1] - RADIUS);
                    context.strokeStyle = HEART_STROKE_COLOUR;
                    context.lineWidth = 3;
                    context.stroke();
                }

                /* Checks that the hearts and arrows stay inside the canvas.
                */
                checkConstraints() {

                    if (!this.broken) {
                        // x coordinate of the heart
                        if (this.location[0] < 0 + RADIUS) {
                            this.location[0] = 0 + RADIUS;
                            this.velocity *= -1;
                        }
                        if (this.location[0] > CANVAS_WIDTH - RADIUS * 3) {
                            this.location[0] = CANVAS_WIDTH - RADIUS * 3;
                            this.velocity *= -1;
                        }
                    
                        // x coordinate of the arrow
                        if (this.arrowLocation[0] < 0)
                            this.arrowLocation[0] = 0;
                        if (this.arrowLocation[0] > CANVAS_WIDTH)
                            this.arrowLocation[0] = CANVAS_WIDTH;
                    }

                    else {
                        // y coordinate of the (falling) broken heart
                        if (this.location[1] > CANVAS_HEIGHT - RADIUS)
                            this.velocity = 0;
                    }
                }

                move() {
                    if (!this.broken) {
                        this.location = [
                            this.location[0] + this.velocity,
                            this.location[1]
                        ];
                        this.arrowLocation = [
                            this.arrowLocation[0] + this.velocity,
                            this.location[1]
                        ]
                    }

                    else {
                        this.location = [
                            this.location[0],
                            this.location[1] + FALL_VELOCITY
                        ];
                        this.arrowLocation = [
                            this.arrowLocation[0],
                            this.location[1] + FALL_VELOCITY
                        ]
                    }

                    this.checkConstraints();
                }

                getShot(coordinates) {
                    if (this.shot)
                        this.broken = true;
                    else {
                        this.shot = true;
                        HEARTS_LEFT -= 1;
                        this.arrowLocation = coordinates;
                    }
                }
            }

            function initializeCanvas(canvasId, width, height) {
                let canvas = document.getElementById(canvasId);

                let context = canvas.getContext("2d");
                context.canvas.width = width;
				context.canvas.height = height;
				
                return canvas;
            }

            function clearCanvas(canvas) {
                let context = canvas.getContext("2d");
                context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            function getRandomColour() {
                var red = getRandomInteger(0, 255);
                var green = getRandomInteger(0, 255);
                var blue = getRandomInteger(0, 255);

                var colour = "rgb(" + red + ", " + green + ", " + blue + ")";

                return colour;
            }

            /* Both minimum and maximum values are inclusive.
            */
            function getRandomInteger(min, max) {
                return Math.floor(Math.random() * (max - min + 1) ) + min;
            }

            /* Returns a random location in the range specified in constant variables.
            */
            function getRandomLocation() {
                return [ getRandomInteger(LOCATION_MIN_X, LOCATION_MAX_X), 
                    getRandomInteger(LOCATION_MIN_Y, LOCATION_MAX_Y) ];
            }

            /* Returns a random velocity in the range specified in constant variables.
            */
            function getRandomVelocity() {
                let velocity = getRandomInteger(VELOCITY_MIN, VELOCITY_MAX);

                // The direction of movement can be to the left or to the right.
                let direction = getRandomInteger(0, 1);
                if (!direction)
                    velocity *= -1;
                
                return velocity;
            }

            function createHearts(number) {
                for (let i = 0; i < number; i++) {
                    // Since the colour is chosen by random, we check for duplicates and the canvas fill colour.
                    let ok = true;
                    let colour;
                    do {
                        colour = getRandomColour();
                        for (let j = 0; j < HEARTS.length; j++) {
                            if (colour == HEARTS[j].colour || colour == CANVAS_FILL_COLOUR)
                                ok = false;
                        }
                    } while (!ok);
                    HEARTS.push(new Heart(getRandomLocation(), getRandomVelocity(), colour));
                }
            }

            function drawHearts(canvasMain, canvasHelper) {
                // Visible canvas
                clearCanvas(canvasMain);
                HEARTS.forEach(element => {
                    element.draw(canvasMain, HEART_STROKE_COLOUR, HEART_FILL_COLOUR);
                        if (element.shot)
                            element.drawArrow(canvasMain);
                });
                
                // Helper canvas
                clearCanvas(canvasHelper);
                HEARTS.forEach(element => {
                    element.draw(canvasHelper, element.colour, element.colour);
                });
            }

            function moveHearts() {
                HEARTS.forEach(element => {
                    element.move();
                });
            }

            /* Checks if the player hit a heart and changes the score accordingly.
            */
            function shoot(canvas, coordinates) {
                let context = canvas.getContext("2d");
                let colour = context.getImageData(coordinates[0], coordinates[1], 1, 1).data;
                colour = "rgb(" + colour[0] + ", " + colour[1] + ", " + colour[2] + ")";

                let hit = false;
                
                // If the player gets a hit.
                for (let element of HEARTS) {
                    if (colour == element.colour) {
                        if (element.shot)
                            PLAYER_SCORE -= BROKEN_HEART_PENALTY;
                        element.getShot(coordinates);
                        hit = true;
                        break;
                    }
                };

                // If the player misses.
                if (!hit)
                    PLAYER_SCORE -= MISS_PENALTY;
            }

            function endGame(canvas) {
                clearInterval(INTERVAL);
                clearCanvas(canvas);
                let context = canvas.getContext("2d");

                if (PLAYER_SCORE < 0)
                    PLAYER_SCORE = 0;
                
                let finalScore = "Your score: " + PLAYER_SCORE;
                context.font = "30px Courier New";
                context.fillStyle = "black";
                context.textAlign = "center";
                context.fillText(finalScore, CANVAS_WIDTH/2, CANVAS_HEIGHT/2); 
            }

            function main() {
                let canvasMain = initializeCanvas("canvasMain", CANVAS_WIDTH, CANVAS_HEIGHT);
                let canvasHelper = initializeCanvas("canvasHelper", CANVAS_WIDTH, CANVAS_HEIGHT);

                createHearts(NUMBER_OF_HEARTS);

                canvasMain.addEventListener('click', function(e) {
                    x = e.x - canvasMain.offsetLeft;
                    y = e.y - canvasMain.offsetTop;
                    shoot(canvasHelper, [x, y]);
                }, false);

                INTERVAL = setInterval(() => {
                    moveHearts();
                    drawHearts(canvasMain, canvasHelper);
                    PLAYER_SCORE -= TIME_PENALTY;

                    if(HEARTS_LEFT == 0)
                        endGame(canvasMain);
                    
                }, 20);
            }