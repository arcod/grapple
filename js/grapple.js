

var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 300;
var canvasElement = $("<canvas>")
	.attr('width', CANVAS_WIDTH)
	.attr('height', CANVAS_HEIGHT);

var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('.canvasHolder');

var FPS = 50;

var	level = 1;

var setIntervalId = (setInterval(function () {
update();
draw();
}, 1000/FPS))



//draw function

function draw() {
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	
	canvas.fillStyle = "rgba(0, 0, 0, .3)";
  canvas.font = "italic 50pt georgia";
  canvas.textAlign="center"; 
  canvas.fillText("Level " + level, CANVAS_WIDTH/2, 3*CANVAS_HEIGHT/4);

	
	player.draw();
	ground.draw();
	
	platforms.forEach(function(platform){
		platform.draw();
	});
	


	
}
			
			
//constructor functions, various relevant globals
			
var player = {
	color: colors.player,
	x: CANVAS_WIDTH/3,
	y: 100,
	width: 10,
	height: 25,
	jumping: true,
	yVelocity: 2,
	special: null,
	draw: function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	},
	 aboveGround: function() {
    return this.y < CANVAS_HEIGHT;
  }
};

var scrollSpeed = 2;
var gravity = 1.5;

var ground = {
	color: colors.ground,
	x:0,
	y:200,
//	yVelocity:.7,
	width:CANVAS_WIDTH,
	height:20,
	draw: function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	},
	update: function(){

	}
}

var platforms = [];

function AddPlatform(I) {
	I.width=50;
	I.height=15;
//	I.yVelocity=scrollSpeed;
	I.color = colors.platform;
	I.draw = function() {
		canvas.beginPath();
		canvas.rect(this.x, this.y, this.width, this.height);
		canvas.fillStyle = this.color;
		canvas.fill();
		canvas.lineWidth = 2;
		canvas.strokeStyle = colors.platformBorder;
		canvas.stroke();
	};
	
	I.update = function() {

	};
	
	I.inBounds = function() {
		return I.y >= 0 && I.y+I.height <= CANVAS_HEIGHT;
	};
	
	return I;
}


function increaseScore(amount){
	var scoreCounter = document.getElementById('scoreCounter');
	var score = scoreCounter.innerHTML;

	if (player.special === 'doublePoints'){
		score = parseInt(score, 10) + 2*amount;
	} else {
		score = parseInt(score, 10) + amount;
	}
	scoreCounter.innerHTML = score;
	
	if (parseInt(score,10)>(level*10000)) {
		level++;
		FPS += 3;
		window.clearInterval(setIntervalId);
		setIntervalId = (setInterval(function () {
				update();
				draw();
			}, 1000/FPS))
	}
	
}


//this is some wrapper the tutorial gave.  I don't really know what it does. 
$(function() {
  window.keydown = {};
  
  function keyName(event) {
    return jQuery.hotkeys.specialKeys[event.which] ||
      String.fromCharCode(event.which).toLowerCase();
  }
  
  $(document).bind("keydown", function(event) {
    keydown[keyName(event)] = true;
  });
  
  $(document).bind("keyup", function(event) {
    keydown[keyName(event)] = false;
  });
});

//update
function update() {
	//scoring
	increaseScore(1);
	
	
	//lateral movement keybinds
  if (keydown.left || keydown.a) {
    player.x -= 6;
  }

  if (keydown.right || keydown.d) {
    player.x += 6;
  }
// here are the movement limits to stop going off the canvas
  if (player.x <= 0){
  	player.x = 0;
  }
  if (player.x >= CANVAS_WIDTH - player.width){
  	player.x = CANVAS_WIDTH - player.width;
  }
   


//jump keybind
	if ((keydown.up || keydown.w) && !(player.jumping)){
		player.jumping = true;
		player.yVelocity = -20;
	}

	if (player.jumping){
		player.y += player.yVelocity;
		player.yVelocity += gravity
		if (player.yVelocity > 15) {
			player.vVelocity = 15;
		};
	}

	if (!(player.jumping)){
		player.y += player.yVelocity;
		player.yVelocity += gravity;
	}
//player death
	if (!player.aboveGround()){
		clearInterval(setIntervalId);
		
		var scoreCounter = document.getElementById('scoreCounter');
		var score = scoreCounter.innerHTML;
		var deadScore = document.getElementById('deadScore');
		deadScore.innerHTML = score;
		
		$('#gameOverScreen').toggle();
	}

//other keybinds
	if (keydown.space) {
	     pointGlobes.push(AddPointGlobe({
   			x: Math.random()*CANVAS_WIDTH,
  			y: 10,
			}));
	}
	
//platform spawn


	if (platforms.length < 10)	{
	    platforms.push(AddPlatform({
   			x: Math.random()*(CANVAS_WIDTH - 50)+25,
  			y: 100,
			}));
	}

//ground movement
	
	ground.update();
	
//platform movement
	
	platforms.forEach(function(platform) {
		platform.update();
		if (!(platform.inBounds())){
			platforms.splice(platform,1);
		}
  });
  
  
//handlecollisions
	handleCollisions();  

} //end of update




//collision detection

function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function collidesWithCircle(a,c){
	 var distX = Math.abs(c.x - a.x-a.width/2);
    var distY = Math.abs(c.y - a.y-a.height/2);

    if (distX > (a.width/2 + c.radius)) { return false; }
    if (distY > (a.height/2 + c.radius)) { return false; }

    if (distX <= (a.width/2)) { return true; } 
    if (distY <= (a.height/2)) { return true; }

    var dx=distX-a.width/2;
    var dy=distY-a.height/2;
    return (dx*dx+dy*dy<=(c.radius*c.radius));
}


// evaluates to true if a lands on b
function landsOn(a,b){
	return a.yVelocity > 0 &&
		a.y + a.height > b.y &&
		(a.y + a.height < b.y + b.height || a.y +a.height -a.yVelocity <b.y +b.height) && 
		b.x - a.width < a.x &&
		a.x < b.x+b.width;
}

function handleCollisions() {
	if (collides(player,ground)){
		player.jumping=false;
		player.y = ground.y - player.height;
		player.yVelocity = scrollSpeed;
	}
	platforms.forEach(function(platform){
		if (landsOn(player,platform)){
			player.jumping=false;
			player.y = platform.y - player.height;
			player.yVelocity = scrollSpeed;	
		}
	})


}
