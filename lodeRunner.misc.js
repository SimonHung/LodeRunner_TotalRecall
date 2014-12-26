//============
// MISC
//============
var DEBUG = 0;
var demoSoundOff = 1;
function debug(string) {
	if(DEBUG) console.log(string);
}

function assert(expression, msg)
{
	if(DEBUG) console.assert(expression, msg);
}

function getScreenSize() 
{
	var x, y;
	
	//----------------------------------------------------------------------
	// Window size and scrolling:
	// URL: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
	//----------------------------------------------------------------------
	if (typeof (window.innerWidth) == 'number') {
		//Non-IE
		x = window.innerWidth;
		y = window.innerHeight;
	} else if ((document.documentElement) &&
		(document.documentElement.clientWidth || document.documentElement.clientHeight)) {
		//IE 6+ in 'standards compliant mode'
		x = document.documentElement.clientWidth;
		y = document.documentElement.clientHeight;
	} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
		//IE 4 compatible
		x = document.body.clientWidth;
		y = document.body.clientHeight;
	}
	return {x:x, y:y};
}

//==============================
// Too many user created Levels
//==============================
var editWarningText = null;
function editWarningMsg(hidden)
{
	var x, y, width, height;

	if(editWarningText == null) 
		editWarningText = new createjs.Text("Too many user created levels !", 
											"bold " +  (64*tileScale) + "px Helvetica", "#fc5c1c");
	
	width = editWarningText.getBounds().width;
	height = editWarningText.getBounds().height;
	x = editWarningText.x = (NO_OF_TILES_X*(tileW+EDIT_PADDING) - width) / 2 | 0;
	y = editWarningText.y = (NO_OF_TILES_Y*tileH - height) / 2 | 0;
	editWarningText.shadow = new createjs.Shadow("white", 2, 2, 1);
	
	if(hidden) {
		mainStage.removeChild(editWarningText);
	} else {
		mainStage.addChild(editWarningText);
	}
	mainStage.update();
}

//================================
// show tips messgae
//===============================
function showTipsMsg(_tipsTxt, _stage, _scale)
{
	var TEXT_SIZE = 72* _scale;
	var TEXT_COLOR = "#ff2020";
	var tipsText = new createjs.Text(_tipsTxt, "bold " +  TEXT_SIZE + "px Helvetica", TEXT_COLOR);
	var screenX1 = _stage.canvas.width;
	var screenY1 = _stage.canvas.height;

	tipsText.x = (screenX1) / 2 | 0;
	tipsText.y = screenY1/2 - tipsText.getBounds().height*5/4 | 0;
	tipsText.shadow = new createjs.Shadow("white", 3, 3, 2);
	tipsText.textAlign = "center";
	
	_stage.addChild(tipsText);
	
	createjs.Tween.get(tipsText).set({alpha:1}).wait(50).to({scaleX:1.2, scaleY:1.2, alpha:0}, 2000)
		.call(function(){_stage.removeChild(tipsText);});
}

//==========================================
// move z-index to top for a child of stage
//==========================================
function moveChild2Top(stage, obj)
{
	stage.setChildIndex(obj, stage.getNumChildren() - 1);
}

//==========================
// BEGIN for Sound function
//==========================
var soundOff = 0;
function soundPlay(name)
{
	if(soundOff || playMode == PLAY_AUTO || (playMode == PLAY_DEMO && demoSoundOff)) return;
	
	if(typeof name == "string") {
		return createjs.Sound.play(name);
	} else {
		name.stop(); //12/21/2014 , for support soundJS 0.6.0
		name.play();
	}
}

function soundStop(name)
{
	if(soundOff || playMode == PLAY_AUTO || (playMode == PLAY_DEMO && demoSoundOff)) return;
	
	if(typeof name == "string") {
		return createjs.Sound.stop(name);
	} else {
		name.stop();
	}
}

function soundPause(name)
{
	if(soundOff || playMode == PLAY_AUTO || (playMode == PLAY_DEMO && demoSoundOff)) return;
	
	if(typeof name == "string") {
		return createjs.Sound.pause(name);
	} else {
		name.pause();
	}
}

function soundResume(name)
{
	if(soundOff || playMode == PLAY_AUTO || (playMode == PLAY_DEMO && demoSoundOff)) return;
	
	if(typeof name == "string") {
		return createjs.Sound.resume(name);
	} else {
		name.resume();
	}
}

//===============
// Random Object
//===============
function  rangeRandom(minValue, maxValue, seedValue)
{
	var rndList, idx, items;
	var min, max;
	var reset;
	var seed = 0;
	
	function rndStart()
	{
		var swapId, tmp;
	
		rndList = [];
		for(var i = 0; i < items; i++) rndList[i] = min + i;
		for(var i = 0; i < items; i++) {
			if(seedValue > 0) {
				seed = seedValue;	
				swapId = (seedRandom() * items) | 0;
			} else {
				swapId = (Math.random() * items) | 0;
			}
			tmp = rndList[i];
			rndList[i] = rndList[swapId];
			rndList[swapId] = tmp;
		}
		idx = 0;
		//debug(rndList);
	}
	
	function seedRandom() 
	{
    	var x = Math.sin(seed++) * 10000;
    	return x - Math.floor(x);
	}
	
	this.get = function ()
	{
		if( idx >= items) {
			rndStart();
			reset = 1;
		} else {
			reset = 0;
		}
		return rndList[idx++];
	}
	
	this.rndReset = function ()
	{
		return reset;
	}
	
	//---------
	// initial 
	//---------
	reset = 0;
	min = minValue;
	max = maxValue;
	if(min > max) { //swap
		var tmp;
		tmp = min;
		min = max;
		max = tmp;
	}
	items = max - min + 1;
	
	rndStart();
}
