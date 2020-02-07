/*
    Object blueprints
*/

// Display knows about the HTML 5 canvas
// is globally accessable with display
function Display() {
    this.canvas = document.getElementById("game"),
    this.centerWidth = this.canvas.width / 2,
    this.context = this.canvas.getContext("2d"),
    this.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    this.renderBackground = ()=>{
        this.context.fillStyle = colors.background;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    this.recalculate = function() {
        this.canvas = document.getElementById("game");
        this.centerWidth = this.canvas.width / 2;
    },
    this.redrawBackground = () => {
        this.clear();
        this.context.fillStyle = colors.background;
        this.renderBackground();
    },
    this.render = () => {
        for (const iterator of renderSubscribers) {
            iterator[1].render(display.context);
        }
    }
};
// globally represented as playerObj
function player(collisionDetecor) {
    this.shipHandler = new ShipHandler(colors.playerColor, display.canvas.height, `player-ship`, this,10, 3)
    this.lives = 3,
    this.level = 1,
    this.enemyRows = 1,
    this.score = 0,
    this.init = () => {
        this.enemyRows = 1;
        this.lives = 3;
        this.level = 1;
        this.score = 0;
        updatePlayerLivesUI();
        updatePlayerScoreUI(this.score);
    },
    this.increaseLevel = () => {
        this.level++;
        this.enemyRows = Math.ceil(0.01 + this.level % 14);
    },
    this.looseLife = () => {
        if (this.lives > 0) {
            this.lives--;
            updatePlayerLivesUI();
        }        
    },
    this.addScore = (num) => {
        this.score += num;
        updatePlayerScoreUI(this.score);
    },
    this.prepareForNewGame = () => {
        playerObj.collisionDetector = new ProjectileCollisionDetector(enemyObj);
        this.collisionDetecor = playerObj.collisionDetector;
        // delete current ships
        this.shipHandler.removeAllShips();
        this.shipHandler.spawnShips(1);
        // subscribe to keyDown event
        inputSubscribers.set("player", playerObj);
    },
    this.sendScore = (score) => {}
};

// globally represented by enemyObj
function enemy(level) {
    this.shipHandler = new ShipHandler(colors.enemyColor,Math.floor(display.canvas.height * 0.5), `enemy-ship`, this, 3, 1),
    this.intervalHorizontal = 0,
    this.level = level,
    this.horizontalMovingDirection = false,
    this.moveHorizontally = () => {
        if (this.intervalHorizontal >= spaceShipWidth) {
            this.intervalHorizontal = -spaceShipWidth;
            this.horizontalMovingDirection = !this.horizontalMovingDirection;
        }
        for (item of this.shipHandler.spaceShips) {
            item[1][this.horizontalDirections(this.horizontalMovingDirection)].call();            
        }
        this.intervalHorizontal++;
    },
    this.takeAction = () => {
        this.shipHandler.takeAction();
    },
    this.doEachFrame = () => {
        this.moveHorizontally();
    },
    this.horizontalDirections = (which) => {
        return which? 'moveRight' : 'moveLeft';
    },
    this.cleanUp = () => {
        // remove all projectiles
        this.shipHandler.removeAllShips();
    },
    this.sendScore = (score) => {
        playerObj.addScore(score);
    }
};

// shared between enemy and player
// player and enemy have a ship handler
// which deals with creation, controling and removing of space ships
function ShipHandler(color = colors.default, yLimit, prefix, parent, step, hitpoints = 1) {
    this.yLimit = yLimit,
    this.shipArray = [],
    this.prefix = prefix
    this.spaceShips = new Map(),
    this.parent = parent,
    this.color = color,
    this.step = step,
    this.hitpoints = hitpoints,
    this.scorePoints = hitpoints,
    this.inputHandler = function(inputLetter) {
        for (const item of this.spaceShips) {
            // check if the key exists and if it does, call the value which is a function
            if (item[1].keyMap.hasOwnProperty(inputLetter)) {
                item[1].keyMap[inputLetter].call();
            }
        }
    },
    this.render = () => {
        for (const ship of this.spaceShips) {
            ship.render();
        }
    },
    this.spawnShips = (rows) => {
        //populate the game with space ships
        this.triangleFormation(rows);
        //this.rectangleFormation(rows);
    },
    this.collide = () => {
        this.parent.collisionDetecor.collide();
    },
    this.takeAction = () => {
        this.shootStrategy();
    },
    this.simpleShoot = () => {
        this.shoot[Math.floor(Math.random() * this.shoot.length)].call();
    },
    this.multiShoot = () => {
        for (const ship of this.spaceShips) {
            this.shoot[Math.floor(Math.random() * this.shoot.length)].call();
        }
    },
    this.shootStrategy = this.simpleShoot,
    this.shoot = [
        () => {},
        () => {
            let shipIndex = Math.floor(Math.random()*this.shipArray.length);
            if (this.shipArray.length > 0) {
                this.spaceShips.get(this.shipArray[shipIndex]).aiShoot();
            }            
        }
    ],
    this.onDeath = (ship) => {
        parent.sendScore(this.scorePoints);
        exp = new ExplosionAnimation(ship.x, ship.y, 50, 1000);
        exp.register();
        renderSubscribers.delete(ship.renderKey);
        inputSubscribers.delete(ship.renderKey);
        this.spaceShips.delete(ship.renderKey);
        this.shipArray = [...this.spaceShips.keys()];
        delete(ship);
        ship = null;
        CheckForWin();
    },
    this.removeAllShips = () => {
        for (const ship of this.spaceShips) {
            renderSubscribers.delete(ship.renderKey);
            inputSubscribers.delete(ship.renderKey);
            this.spaceShips.delete(ship.renderKey);
            this.shipArray = [...this.spaceShips.keys()];
            delete(ship);
        }
        this.spaceShips.clear();
    },
    this.rectangleFormation = (rows) => {
        for (let i = 0; i < rows; i++) {
            let startX = display.centerWidth - (0.5 * (rows - i) * spaceShipWidth + ((rows - i - 1) * spaceShipWidth));
            let startY = this.yLimit - spaceShipHeight - ((rows - i) * spaceShipHeight);  
            
            for (var j = 0; j < rows; j++) {
                var ship = new spaceShip(startX + ((3 * j) * spaceShipWidth), startY + (spaceShipHeight * i), spaceShipWidth, spaceShipHeight, this.color, this.hitpoints, true, this.step);
                ship.init(this);
                ship.renderKey = `${this.prefix}-${renderSubscribers.size}`;
                this.spaceShips.set(ship.renderKey, ship);
                renderSubscribers.set(ship.renderKey, ship);
            }
        }
        this.shipArray = [...this.spaceShips.keys()];
    },
    this.triangleFormation = (rows) => {
        for (var i = 0; i < rows; i++) {
            // calculate the starting coordinates for X and Y
            let startX = display.centerWidth - (0.5 * (rows - i) * spaceShipWidth + ((rows - i - 1) * spaceShipWidth));
            let startY = this.yLimit - spaceShipHeight - ((rows - i) * spaceShipHeight);
            // then spawn the needed space ships for each row  
            for (var j = 0; j < rows - i; j++) {
                var ship = new spaceShip(startX + ((3 * j) * spaceShipWidth), startY + (spaceShipHeight * i), spaceShipWidth, spaceShipHeight, this.color, this.hitpoints, true, this.step);
                ship.init(this);
                ship.renderKey = `${this.prefix}-${renderSubscribers.size}`;
                this.spaceShips.set(ship.renderKey, ship);
                renderSubscribers.set(ship.renderKey, ship);
            }
        }
        this.shipArray = [...this.spaceShips.keys()];
    }
};

// blueprint for projectiles
// projectiles are instantiated by space ships 
function projectile(x, y, width, height, color, display, step, collisionDetecor, damage = 1) {
    this.active = true,
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.step = step,
    this.maxSteps = display.canvas.height / this.step,
    this.currentSteps = 0,
    this.renderKey = '';
    this.collisionDetecor = collisionDetecor,
    this.damage = damage,
    this.direction = () => {},
    this.render = (context) => {       
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.direction();
    },
    this.shootUp = () => {
        this.direction = this.moveUp;
    },
    this.shootDown = () => {
        this.direction = this.moveDown;
    },
    this.moveUp = ()=>{
        this.y -= this.step;
        this.currentSteps++;
        if (this.currentSteps > this.maxSteps) {
            this.unregister();
        }
    },
    this.moveDown = ()=>{
        this.y += this.step;
        this.currentSteps++;
        if (this.currentSteps > this.maxSteps) {
            this.unregister();
        }
    }, 
    this.register = () => {
        this.renderKey = `projectile-${renderSubscribers.size}-${Math.floor(Math.random()*100)}`;
        renderSubscribers.set(this.renderKey ,this);
        this.collisionDetecor.add([this.renderKey,this]);
    },
    this.unregister = () => {
        this.active = false;
        renderSubscribers.delete(this.renderKey ,this);
        this.collisionDetecor.remove([this.renderKey,this]);
    }
};

// blueprint for space ships
// space ships are controlled by a ship handler 
// they instantiate projectiles 
function spaceShip(x, y, width, height, color, hitpoints = 1, active = true, step=2) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = color,
    this.renderKey = '',
    this.step = step,
    this.hitpoints = hitpoints,
    this.active = active,
    this.parent,
    this.renderMethod = (context) => {},
    this.init = (parent) => {
        this.parent = parent;
        this.renderMethod = this.activeRender;
    },
    this.render = (context) => {
        this.renderMethod(context);
    },
    this.moveLeft = ()=>{
        this.x -this.step < 0 ? this.x = 0 : this.x -= this.step;
    },
    this.moveRight = ()=>{
        this.x +this.step + this.width > game.width ? this.x = game.width - this.width : this.x += this.step;
    },
    this.shoot = ()=>{
        let shot = new projectile(this.x + this.width / 2, this.y - this.height, 3, 10, colors.projectileColor, display, 5, enemyObj.CollisionDetector);
        shot.direction = shot.shootUp;
        shot.register();
    },
    this.aiShoot = () => {
        let shot = new projectile(this.x + this.width / 2, this.y+this.height+10, 3, 10, colors.projectileColor, display, 5, playerObj.collisionDetector);
        shot.direction = shot.shootDown;
        shot.register();
    },
    this.onCollision = (dmg) =>
    {
        this.hitpoints -= dmg;
        if (this.hitpoints <= 0) {
            this.die();
        }
    },
    this.keyMap = {
        "65": this.moveLeft,
        "68": this.moveRight,
        "87": this.shoot,
        "37": this.moveLeft,
        "39": this.moveRight,
        "38": this.shoot
    },
    this.activeRender = function(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    },
    this.die = () =>{
        this.aiShoot = () => {};
        this.activeRender = this.deathRender;
        renderSubscribers.delete(this.renderKey);
        this.parent.onDeath(this);
    },
    this.deathRender = () => {
        // empty function for active render
    }
};

// Animation for exploding space ships
function ExplosionAnimation(startX, startY, lineLen, duration) {
    this.startX = startX,
    this.startY = startY,
    this.sub = 1,
    this.lineLenMax = lineLen,
    this.lineLen = 1,
    this.duration = duration,
    this.renderKey = '',
    this.render = () => {
        // draw 24 increasing lines 
        for (let i = 1; i <= 24; i++)
        {
            display.context.beginPath();
            display.context.strokeStyle =  '#FAB500';
            display.context.moveTo(this.startX, this.startY);
            display.context.lineTo( this.startX + (this.lineLen * Math.sin(i * this.sub+15) ), this.startY + (this.lineLen * Math.cos(i*this.sub+15)));
            display.context.stroke();
            this.duration--;
            if (this.lineLen < this.lineLenMax) this.lineLen+= this.lineLenMax/this.duration;
        }
        this.sub+=10;
        if (this.duration <= 0) this.unregister();
    },
    this.register = () => {
        this.renderKey = `explosion-${renderSubscribers.size}-${Math.floor(Math.random()*100)}`;
        renderSubscribers.set(this.renderKey ,this);
    },
    this.unregister = () => {
        renderSubscribers.delete(this.renderKey ,this);
    }
};

// knows projectiles and checks if they collide with target objects 
// collision detection is not pixel perfect
function ProjectileCollisionDetector(target) {
    this.target = target,
    this.rows = Math.ceil(display.canvas.width / spaceShipWidth)
    this.projectilesOfSource = new Map(),
    this.collide = () => {   
        // if there are no projectiles, don't bother     
        if(this.projectilesOfSource.size == 0) return;

        // loop through the known projectiles
        for (const proj of this.projectilesOfSource) {
            let item = proj[1];
            // continue if projectile is not active
            if (!item.active) continue;

            // divide the canvas logical in rows and columns
            let itemColumn = Math.ceil(item.x / spaceShipWidth);
            let itemRow = Math.ceil(item.y / spaceShipHeight)

            for (const enemyShipItem of this.target.collisionDetecor.target.shipHandler.spaceShips) {
                // select the value of enemyShipItem
                enemyShip = enemyShipItem[1];
                let enemyShipColumn = Math.ceil(enemyShip.x / spaceShipWidth);
                let enemyShipRow = Math.ceil(enemyShip.y / spaceShipHeight);

                if (enemyShipColumn >= itemColumn-1 && enemyShipColumn <= itemColumn+1
                    && enemyShipRow >= itemRow-1 && enemyShipRow <= itemRow + 1
                    && item.x - enemyShip.x > 0
                    && (enemyShip.x + enemyShip.width) - (item.x+item.width) > 0 ) {
                        // inform the space ship about the hit
                        enemyShip.onCollision(item.damage);
                        // deactivate the projectile
                        item.unregister();
                }                
            }
        }
    },
    this.add = (pair) => {
        this.projectilesOfSource.set(pair[0], pair[1]);
    },
    this.remove = (item) => {
        this.projectilesOfSource.delete(item);
    }     
};