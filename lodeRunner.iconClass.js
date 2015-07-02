function mainMenuIconClass( _screenX1, _screenY1, _scale, _mainMenuBitmap)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var mainMainCanvas, stage;
	var	menuIcon, menuBG;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _mainMenuBitmap.getBounds().width * _scale;
	var bitmapY = _mainMenuBitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	init();
	
	function init()
	{
		createCanvas();
		createMenuIcon();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		menuIcon.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			menuIcon.set({alpha:0})
		} else {
			menuIcon.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}
	
	function enableMouseHandler()
	{
		mouseOverHandler = menuIcon.on("mouseover", mouseOver);
		mouseOutHandler = menuIcon.on("mouseout", mouseOut);
		mouseClickHandler = menuIcon.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		menuIcon.removeEventListener("mouseover", mouseOverHandler);
		menuIcon.removeEventListener("mouseout", mouseOutHandler);
		menuIcon.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		mainMainCanvas = document.createElement('canvas');
		mainMainCanvas.id     = "main_menu";
		mainMainCanvas.width  = bitmapX+border*2;
		mainMainCanvas.height = bitmapY+border*2;
	
		//var left = (_screenX1 - mainMainCanvas.width - bitmapX/3),
		//	top  = (_screenY1 - mainMainCanvas.height - bitmapY/4);
		var left = (_screenX1 - mainMainCanvas.width - screenBorder),
			top  = bitmapY/2|0;
		
		mainMainCanvas.style.left = left + "px";
		mainMainCanvas.style.top =  top + "px";
		mainMainCanvas.style.position = "absolute";
		document.body.appendChild(mainMainCanvas);
	}
	
	function createMenuIcon()
	{
		stage = new createjs.Stage(mainMainCanvas);
		menuIcon = new createjs.Container();
		menuBG = new createjs.Shape();
		
		menuBG.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		menuBG.alpha = 0;
		menuIcon.addChild(menuBG);
		_mainMenuBitmap.setTransform(border, border, _scale, _scale);
		menuIcon.addChild(_mainMenuBitmap);
		
		menuIcon.set({alpha:0})
		stage.addChild(menuIcon);
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || //// demoDataLoading ||
		   (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		stage.cursor = "pointer";
		menuBG.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		menuBG.alpha = 0;
		stage.update();
	}
	
	function mouseClick()
	{
		if(gameState == GAME_PAUSE || //// demoDataLoading ||
		   (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		saveState();
		////mainMenu(restoreState);
		gameMenu(restoreState);
		mouseOut();
	}

	function saveState()
	{
		saveStateObj = saveKeyHandler(noKeyDown);
		gamePause();
		if(playMode == PLAY_EDIT) {
			if(editLevelModified()) saveTestState();
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
		self.disable();
	}
	
	function restoreState()
	{
		restoreKeyHandler(saveStateObj);
		if(playMode == PLAY_EDIT) {
			startEditTicker();
		} else {
			startAllSpriteObj();
			startPlayTicker();
		}
		gameResume();
		self.enable();
	}
}

function selectIconClass( _screenX1, _screenY1, _scale, _bitmap)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var selectCanvas, stage;
	var	selectIcon, selectBG;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _bitmap.getBounds().width * _scale;
	var bitmapY = _bitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	init();
	
	function init()
	{
		createCanvas();
		createSelectIcon();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		document.body.appendChild(selectCanvas);
		selectIcon.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			selectIcon.set({alpha:0})
		} else {
			selectIcon.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}
	
	function enableMouseHandler()
	{
		mouseOverHandler = selectIcon.on("mouseover", mouseOver);
		mouseOutHandler = selectIcon.on("mouseout", mouseOut);
		mouseClickHandler = selectIcon.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		selectIcon.removeEventListener("mouseover", mouseOverHandler);
		selectIcon.removeEventListener("mouseout", mouseOutHandler);
		selectIcon.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		selectCanvas = document.createElement('canvas');
		selectCanvas.id     = "select_menu";
		selectCanvas.width  = bitmapX+border*2;
		selectCanvas.height = bitmapY+border*2;
	
		//var left = (_screenX1 - selectCanvas.width - bitmapX/3),
		//	top  = bitmapY/4|0;
			//top  = (_screenY1 - selectCanvas.height - bitmapY/4);
		var left = (_screenX1 - selectCanvas.width - screenBorder),
			top  = (selectCanvas.height + bitmapY)|0;
		
		selectCanvas.style.left = left + "px";
		selectCanvas.style.top =  top + "px";
		selectCanvas.style.position = "absolute";
		document.body.appendChild(selectCanvas);
	}
	
	function createSelectIcon()
	{
		stage = new createjs.Stage(selectCanvas);
		selectIcon = new createjs.Container();
		selectBG = new createjs.Shape();
		
		selectBG.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		selectBG.alpha = 0;
		selectIcon.addChild(selectBG);
		_bitmap.setTransform(border, border, _scale, _scale);
		selectIcon.addChild(_bitmap);
		
		selectIcon.set({alpha:0})
		stage.addChild(selectIcon);
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || 
		   (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		stage.cursor = "pointer";
		selectBG.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		selectBG.alpha = 0;
		stage.update();
	}
	
	function startSelectMenu()
	{
		saveState();
		activeSelectMenu(activeSelectPlay, restoreState);
		mouseOut();
	}
	
	function mouseClick()
	{
		if(gameState == GAME_PAUSE || 
		   (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		
		if(playMode == PLAY_EDIT && editLevelModified()) {
			if(editLevelModified())saveTestState();
			editConfirmAbortState(startSelectMenu);
		} else {
			startSelectMenu();
		}
	}

	function activeSelectPlay(level)
	{
		//debug("time play:" + level);
		//if(callbackFun != null) callbackFun();
		
		soundStop(soundDig); 
		soundStop(soundFall);
		switch(playMode) {
		case PLAY_EDIT:
			editSelectLevel(level);
			break;
		case PLAY_DEMO:
			curLevel = level;
			setDemoInfo();	
			startGame();
			break;	
		case PLAY_MODERN:		
			curLevel = level;
			//playMode = PLAY_MODERN;
			//document.onkeydown = handleKeyDown;
			//setLastPlayMode();
			setModernInfo();
			startGame();
			break;	
		default:
			debug("activeSelectPlay design error ! playMode = " + playMode);
			break;	
		}
	}	

	function saveState()
	{
		saveStateObj = saveKeyHandler(noKeyDown);
		gamePause();
		if(playMode == PLAY_EDIT) {
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
		self.disable();
	}
	
	function restoreState()
	{
		restoreKeyHandler(saveStateObj);
		if(playMode == PLAY_EDIT) {
			startEditTicker();
		} else {
			startAllSpriteObj();
			startPlayTicker();
		}
		gameResume();
		self.enable();
	}
}

//==============================================================
//
// Champ icon will open a new window contains world high score 
// while back to lode runner main window (onfocus) will auto
// close "lode runner world high score" window
//
// 10/08/2014
//==============================================================

function demoIconClass( _screenX1, _screenY1, _scale, _bitmap)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var canvas, stage;
	var	iconObj, bgObj;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _bitmap.getBounds().width * _scale;
	var bitmapY = _bitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	init();
	
	function init()
	{
		createCanvas();
		createIconObj();
	}
	
	this.enable = function ()
	{
		if(!curDemoLevelIsVaild()) {
			self.disable(1); 
			return;
		}
		if(enabled) return;
		
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		iconObj.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			iconObj.set({alpha:0});
		} else {
			iconObj.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}
	
	function enableMouseHandler()
	{
		mouseOverHandler = iconObj.on("mouseover", mouseOver);
		mouseOutHandler = iconObj.on("mouseout", mouseOut);
		mouseClickHandler = iconObj.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		iconObj.removeEventListener("mouseover", mouseOverHandler);
		iconObj.removeEventListener("mouseout", mouseOutHandler);
		iconObj.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		canvas = document.createElement('canvas');
		canvas.id = "theme_menu";
		canvas.width  = bitmapX+border*2;
		canvas.height = bitmapY+border*2;
	
		var left = (_screenX1 - canvas.width - screenBorder),
			top  = (canvas.height*2 + bitmapY*3/2)|0;
		
		canvas.style.left = left + "px";
		canvas.style.top =  top + "px";
		canvas.style.position = "absolute";
		document.body.appendChild(canvas);
	}
	
	function createIconObj()
	{
		stage = new createjs.Stage(canvas);
		iconObj = new createjs.Container();
		
		//create background shape
		bgObj = new createjs.Shape();
		bgObj.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		bgObj.alpha = 0;
		
		//change bitmap size
		_bitmap.setTransform(border, border, _scale, _scale);
		
		iconObj.addChild(bgObj);
		iconObj.addChild(_bitmap);
		iconObj.set({alpha:0})
		
		stage.addChild(iconObj);
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || 
		   (gameState != GAME_START  && playMode != PLAY_DEMO && playMode != PLAY_DEMO_ONCE && playMode != PLAY_EDIT))
			return;
		
		stage.cursor = "pointer";
		bgObj.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		bgObj.alpha = 0;
		stage.update();
	}
	
	function mouseClick()
	{
		if(gameState == GAME_PAUSE || playMode == PLAY_DEMO_ONCE ||
		   (gameState != GAME_START && playMode != PLAY_DEMO && playMode != PLAY_EDIT))
			return;

		mouseOut();
		demoSoundOff = 1; //always sound off when start demo
		playMode = PLAY_DEMO_ONCE;
		anyKeyStopDemo();
		////setDemoInfo(); //save curLevel to demo info
		startGame(1);
		setTimeout(function() {showTipsText("HIT ANY KEY TO STOP DEMO", 3500);}, 50);
	}
	
	function saveState()
	{
		setThemeMode(curTheme);
		if(playMode == PLAY_EDIT) {
			if(editLevelModified()) saveTestState();
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
	}
}

function soundIconClass( _screenX1, _screenY1, _scale, _soundOnBitmap, _soundOffBitmap)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var canvas, stage;
	var	iconObj, bgObj;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _soundOnBitmap.getBounds().width * _scale;
	var bitmapY = _soundOnBitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	
	function init()
	{
		createCanvas();
		createIconObj();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		iconObj.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			iconObj.set({alpha:0});
		} else {
			iconObj.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}

	function enableMouseHandler()
	{
		mouseOverHandler = iconObj.on("mouseover", mouseOver);
		mouseOutHandler = iconObj.on("mouseout", mouseOut);
		mouseClickHandler = iconObj.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		iconObj.removeEventListener("mouseover", mouseOverHandler);
		iconObj.removeEventListener("mouseout", mouseOutHandler);
		iconObj.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		canvas = document.createElement('canvas');
		canvas.id = "theme_menu";
		canvas.width  = bitmapX+border*2;
		canvas.height = bitmapY+border*2;
	
		var left = (_screenX1 - canvas.width - screenBorder),
			//top  = (_screenY1 - bitmapY*7)|0;
			top  = (_screenY1 - bitmapY*8.6)|0;
		
		canvas.style.left = left + "px";
		canvas.style.top =  top + "px";
		canvas.style.position = "absolute";
		document.body.appendChild(canvas);
	}
	
	this.updateSoundImage = function()
	{
		iconObj.removeAllChildren();
		iconObj.addChild(bgObj);
		
		if(playMode == PLAY_DEMO || playMode == PLAY_DEMO_ONCE) {
			if(demoSoundOff) iconObj.addChild(_soundOffBitmap);
			else iconObj.addChild(_soundOnBitmap);
		} else {
			if(soundOff) iconObj.addChild(_soundOffBitmap);
			else iconObj.addChild(_soundOnBitmap);
		}
		stage.update();
	}	
	
	function createIconObj()
	{
		stage = new createjs.Stage(canvas);
		iconObj = new createjs.Container();
		
		//create background shape
		bgObj = new createjs.Shape();
		bgObj.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		bgObj.alpha = 0;
		
		//change bitmap size
		_soundOnBitmap.setTransform(border, border, _scale, _scale); //sound on bitmap
		_soundOffBitmap.setTransform(border, border, _scale, _scale); //sound iff bitmap
		
		iconObj.set({alpha:0})
		
		stage.addChild(iconObj);
		self.updateSoundImage();
		stage.update();
	}
	

	
	function mouseOver()
	{
		if( gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING) ) return;
		   
		stage.cursor = "pointer";
		bgObj.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		bgObj.alpha = 0;
		stage.update();
	}
	
	function mouseClick()
	{
		if( gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING) ) return;

		if(playMode == PLAY_DEMO || playMode == PLAY_DEMO_ONCE) {
			if((demoSoundOff ^= 1)) { soundStop(soundDig); soundStop(soundFall); }
		} else {
			if((soundOff ^= 1)) { soundStop(soundDig); soundStop(soundFall); }
		}
		
		self.updateSoundImage();
		mouseOut();
	}	
	
	
	init();

}

function repeatActionIconClass( _screenX1, _screenY1, _scale, _repeatActionOnBitmap, _repeatActionOffBitmap)
{
	var border = 4 * _scale;
	var canvas, stage;
	var	iconObj, bgObj;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _repeatActionOnBitmap.getBounds().width * _scale;
	var bitmapY = _repeatActionOnBitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	function init()
	{
		createCanvas();
		createIconObj();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		iconObj.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			iconObj.set({alpha:0});
		} else {
			iconObj.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}

	function enableMouseHandler()
	{
		mouseOverHandler = iconObj.on("mouseover", mouseOver);
		mouseOutHandler = iconObj.on("mouseout", mouseOut);
		mouseClickHandler = iconObj.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		iconObj.removeEventListener("mouseover", mouseOverHandler);
		iconObj.removeEventListener("mouseout", mouseOutHandler);
		iconObj.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		canvas = document.createElement('canvas');
		canvas.id = "theme_menu";
		canvas.width  = bitmapX+border*2;
		canvas.height = bitmapY+border*2;
		
		var left = (_screenX1 - canvas.width - screenBorder),
			//top  = (_screenY1 - bitmapY*4.8)|0;
			top  = (_screenY1 - bitmapY*6.4)|0;
		
		canvas.style.left = left + "px";
		canvas.style.top =  top + "px";
		canvas.style.position = "absolute";
		document.body.appendChild(canvas);
	}
	
	this.updateRepeatActionImage = function()
	{
		iconObj.removeAllChildren();
		iconObj.addChild(bgObj);
		
		if(repeatAction) iconObj.addChild(_repeatActionOnBitmap);
		else iconObj.addChild(_repeatActionOffBitmap);
		stage.update();
	}	
	
	function createIconObj()
	{
		stage = new createjs.Stage(canvas);
		iconObj = new createjs.Container();
		
		//create background shape
		bgObj = new createjs.Shape();
		bgObj.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		bgObj.alpha = 0;
		
		//change bitmap size
		_repeatActionOnBitmap.setTransform(border, border, _scale, _scale); //sound on bitmap
		_repeatActionOffBitmap.setTransform(border, border, _scale, _scale); //sound iff bitmap
		
		iconObj.set({alpha:0})
		
		stage.addChild(iconObj);
		self.updateRepeatActionImage();
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING) ||
		   playMode == PLAY_DEMO || playMode == PLAY_DEMO_ONCE || playMode == PLAY_EDIT) return;
		   
		stage.cursor = "pointer";
		bgObj.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		bgObj.alpha = 0;
		stage.update();
	}
	
	function mouseClick()
	{
		if(gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING) ||
		   playMode == PLAY_DEMO || playMode == PLAY_DEMO_ONCE || playMode == PLAY_EDIT) return;
		
		toggleRepeatAction();
		self.updateRepeatActionImage();
		mouseOut();
	}	
	
	init();
}

function infoIconClass( _screenX1, _screenY1, _scale, _bitmap)
{
	var border = 4 * _scale;
	var canvas, stage;
	var	iconObj, bgObj;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _bitmap.getBounds().width * _scale;
	var bitmapY = _bitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	
	function init()
	{
		createCanvas();
		createIconObj();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		iconObj.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			iconObj.set({alpha:0});
		} else {
			iconObj.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}

	function enableMouseHandler()
	{
		mouseOverHandler = iconObj.on("mouseover", mouseOver);
		mouseOutHandler = iconObj.on("mouseout", mouseOut);
		mouseClickHandler = iconObj.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		iconObj.removeEventListener("mouseover", mouseOverHandler);
		iconObj.removeEventListener("mouseout", mouseOutHandler);
		iconObj.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		canvas = document.createElement('canvas');
		canvas.id = "info_menu";
		canvas.width  = bitmapX+border*2;
		canvas.height = bitmapY+border*2;
	
		var left = (_screenX1 - canvas.width - screenBorder),
			//top  = (_screenY1 - bitmapY*3.2);
			top  = (_screenY1 - bitmapY*4.8);
		
		canvas.style.left = left + "px";
		canvas.style.top =  top + "px";
		canvas.style.position = "absolute";
		document.body.appendChild(canvas);
	}
	
	function createIconObj()
	{
		stage = new createjs.Stage(canvas);
		iconObj = new createjs.Container();
		
		//create background shape
		bgObj = new createjs.Shape();
		bgObj.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		bgObj.alpha = 0;
		
		//change bitmap size
		_bitmap.setTransform(border, border, _scale, _scale);
		
		iconObj.addChild(bgObj);
		iconObj.addChild(_bitmap);
		
		iconObj.set({alpha:0})
		
		stage.addChild(iconObj);
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		
		stage.cursor = "pointer";
		bgObj.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		bgObj.alpha = 0;
		stage.update();
	}
	
	function mouseClick()
	{
		if(gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		saveState();
		infoMenu(restoreState, null);
		mouseOut();
	}	
	
	function saveState()
	{
		saveStateObj = saveKeyHandler(noKeyDown);
		gamePause();
		if(playMode == PLAY_EDIT) {
			if(editLevelModified()) saveTestState();
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
		self.disable();
	}
	
	function restoreState()
	{
		restoreKeyHandler(saveStateObj);
		if(playMode == PLAY_EDIT) {
			startEditTicker();
		} else {
			startAllSpriteObj();
			startPlayTicker();
		}
		gameResume();
		self.enable();
	}	
	init();
}

function helpIconClass( _screenX1, _screenY1, _scale, _bitmap)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var canvas, stage;
	var	iconObj, bgObj;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _bitmap.getBounds().width * _scale;
	var bitmapY = _bitmap.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	
	function init()
	{
		createCanvas();
		createIconObj();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		iconObj.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			iconObj.set({alpha:0});
		} else {
			iconObj.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}

	function enableMouseHandler()
	{
		mouseOverHandler = iconObj.on("mouseover", mouseOver);
		mouseOutHandler = iconObj.on("mouseout", mouseOut);
		mouseClickHandler = iconObj.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		iconObj.removeEventListener("mouseover", mouseOverHandler);
		iconObj.removeEventListener("mouseout", mouseOutHandler);
		iconObj.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		canvas = document.createElement('canvas');
		canvas.id = "help_menu";
		canvas.width  = bitmapX+border*2;
		canvas.height = bitmapY+border*2;
	
		var left = (_screenX1 - canvas.width - screenBorder),
			//top  = (_screenY1 - bitmapY*1.6);
			top  = (_screenY1 - bitmapY*3.2);
		
		canvas.style.left = left + "px";
		canvas.style.top =  top + "px";
		canvas.style.position = "absolute";
		document.body.appendChild(canvas);
	}
	
	function createIconObj()
	{
		stage = new createjs.Stage(canvas);
		iconObj = new createjs.Container();
		
		//create background shape
		bgObj = new createjs.Shape();
		bgObj.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		bgObj.alpha = 0;
		
		//change bitmap size
		_bitmap.setTransform(border, border, _scale, _scale);
		
		iconObj.addChild(bgObj);
		iconObj.addChild(_bitmap);
		
		iconObj.set({alpha:0})
		
		stage.addChild(iconObj);
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		
		stage.cursor = "pointer";
		bgObj.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		bgObj.alpha = 0;
		stage.update();
	}
	
	function mouseClick()
	{
		if(gameState == GAME_PAUSE || (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return;
		saveState();
		helpMenu(restoreState); 
		mouseOut();
	}	
	
	function saveState()
	{
		saveStateObj = saveKeyHandler(noKeyDown);
		gamePause();
		if(playMode == PLAY_EDIT) {
			if(editLevelModified()) saveTestState();
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
		self.disable();
	}
	
	function restoreState()
	{
		restoreKeyHandler(saveStateObj);
		if(playMode == PLAY_EDIT) {
			startEditTicker();
		} else {
			startAllSpriteObj();
			startPlayTicker();
		}
		gameResume();
		self.enable();
	}	
	init();

}

function themeIconClass( _screenX1, _screenY1, _scale, _themeBitmapApple2, _themeBitmapC64)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var themeCanvas, stage;
	var	themeIcon, themeBG;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _themeBitmapApple2.getBounds().width * _scale;
	var bitmapY = _themeBitmapApple2.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	init();
	
	function init()
	{
		createCanvas();
		createThemeIcon();
	}
	
	this.enable = function ()
	{
		if(enabled) return;
		enabled = 1;
		disableMouseHandler();
		enableMouseHandler();
		themeIcon.set({alpha:1})
		stage.enableMouseOver(60);
		stage.update();
	}
	
	this.disable = function (hidden)
	{
		disableMouseHandler();
		if(hidden) {
			themeIcon.set({alpha:0});
		} else {
			themeIcon.set({alpha:1})
		}
		stage.update();
		enabled = 0;
		stage.enableMouseOver(0);
	}
	
	function enableMouseHandler()
	{
		mouseOverHandler = themeIcon.on("mouseover", mouseOver);
		mouseOutHandler = themeIcon.on("mouseout", mouseOut);
		mouseClickHandler = themeIcon.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		themeIcon.removeEventListener("mouseover", mouseOverHandler);
		themeIcon.removeEventListener("mouseout", mouseOutHandler);
		themeIcon.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		themeCanvas = document.createElement('canvas');
		themeCanvas.id = "theme_menu";
		themeCanvas.width  = bitmapX+border*2;
		themeCanvas.height = bitmapY+border*2;
	
		var left = (_screenX1 - themeCanvas.width - screenBorder),
			//top  = (_screenY1 - themeCanvas.height)/2|0;
			top  = (_screenY1 - bitmapY*1.5);
		
		themeCanvas.style.left = left + "px";
		themeCanvas.style.top =  top + "px";
		themeCanvas.style.position = "absolute";
		document.body.appendChild(themeCanvas);
	}
	
	function createThemeIcon()
	{
		stage = new createjs.Stage(themeCanvas);
		themeIcon = new createjs.Container();
		
		//create background shape
		themeBG = new createjs.Shape();
		themeBG.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		themeBG.alpha = 0;
		
		//change bitmap size
		_themeBitmapApple2.setTransform(border, border, _scale, _scale);
		_themeBitmapC64.setTransform(border, border, _scale, _scale);
		
		themeIcon.set({alpha:0})
		stage.addChild(themeIcon);
		updateThemeImage(0);
		//stage.update();
	}
	
	function updateThemeImage(showTips)
	{
		themeIcon.removeAllChildren();
		themeIcon.addChild(themeBG);
		
		if(curTheme == THEME_APPLE2) {
			themeIcon.addChild(_themeBitmapApple2);
			//if(showTips) setTimeout(function() {showTipsText("APPLE-II THEME MODE", 2500);}, 50);
		} else {
			themeIcon.addChild(_themeBitmapC64);
			//if(showTips) setTimeout(function() {showTipsText("C64 THEME MODE", 2500);}, 50);
		}
		
		stage.update();
	}
	
	function mouseOver()
	{
		if(gameState == GAME_PAUSE || (gameState == GAME_WAITING && playMode != PLAY_EDIT) || 
		   (gameState != GAME_START  && playMode != PLAY_DEMO && playMode != PLAY_DEMO_ONCE && playMode != PLAY_EDIT))
			return;
		
		stage.cursor = "pointer";
		themeBG.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		themeBG.alpha = 0;
		stage.update();
	}

	function mouseClick()
	{
		if(gameState == GAME_PAUSE || (gameState == GAME_WAITING && playMode != PLAY_EDIT) || 
		   (gameState != GAME_START && playMode != PLAY_DEMO && playMode != PLAY_DEMO_ONCE && playMode != PLAY_EDIT))
			return;
		
		curTheme = (curTheme == THEME_APPLE2?THEME_C64:THEME_APPLE2);
		saveState();
		
		soundStop(soundDig); 
		soundStop(soundFall);
		
		themeDataReset();
		updateThemeImage(1);
		mouseOut();
		if(playMode == PLAY_EDIT) {
			startEditMode();		
		} else {
			startGame(1);
		}
	}
	
	function saveState()
	{
		setThemeMode(curTheme);
		if(playMode == PLAY_EDIT) {
			if(editLevelModified()) saveTestState();
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*
function iconBase(_screenX, _screenY, _scale, _bitmap1, _bitmap2, _posY)
{
	var	border = 4 * _scale;
	var canvas, stage;

	var	iconObj, bgObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _bitmap1.getBounds().width * _scale;
	var bitmapY = _bitmap1.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	function enableMouseHandler()
	{
		mouseOverHandler = iconObj.on("mouseover", mouseOver);
		mouseOutHandler = iconObj.on("mouseout", mouseOut);
		mouseClickHandler = iconObj.on("click", mouseClick);
	}
	
	function disableMouseHandler()
	{
		iconObj.removeEventListener("mouseover", mouseOverHandler);
		iconObj.removeEventListener("mouseout", mouseOutHandler);
		iconObj.removeEventListener("click", mouseClickHandler);
		stage.cursor = "default";
		stage.update();
	}
	
	function createCanvas()
	{
		canvas = document.createElement('canvas');
		canvas.id = "theme_menu";
		canvas.width  = bitmapX+border*2;
		canvas.height = bitmapY+border*2;
	
		var left = (_screenX1 - canvas.width),
			top  = (_screenY1 - _posY)|0;
		
		canvas.style.left = left + "px";
		canvas.style.top =  top + "px";
		canvas.style.position = "absolute";
		document.body.appendChild(canvas);
	}
	
	function createIcon()
	{
		stage = new createjs.Stage(canvas);
		iconObj = new createjs.Container();
		
		//create background shape
		bgObj = new createjs.Shape();
		bgObj.graphics.beginFill("#fefef1")
			      .drawRect(0, 0, bitmapX+border*2, bitmapY+border*2).endFill();
		bgObj.alpha = 0;
		
		//change bitmap size
		_bitmap1.setTransform(border, border, _scale, _scale);
		if(_bitmap2) _bitmap2.setTransform(border, border, _scale, _scale);
		
		iconObj.set({alpha:0})
		stage.addChild(iconObj);
		
		updateImage();
		//stage.update();
	}	
	
	function updateImage()
	{
		iconObj.addChild(bgObj);
		iconObj.addChild(_bitmap1);
		stage.update();
	}

	function invalidState()
	{
		if(gameState == GAME_PAUSE || 
		   (gameState != GAME_START && gameState != GAME_RUNNING && playMode != PLAY_EDIT)) return 1;
		
		return 0;
	}
	
	function mouseOver()
	{
		if(invalidState()) return;
		
		stage.cursor = "pointer";
		bgObj.alpha = 1;
		stage.update();
	}
	
	function mouseOut()
	{
		stage.cursor = "default";
		bgObj.alpha = 0;
		stage.update();
	}	

	function mouseClick()
	{
		if(gameState == GAME_PAUSE || 
		   (gameState != GAME_START && playMode != PLAY_DEMO && playMode != PLAY_DEMO_ONCE && playMode != PLAY_EDIT))
			return;
		
		curTheme = (curTheme == THEME_APPLE2?THEME_C64:THEME_APPLE2);
		saveState();
		
		soundStop(soundDig); 
		soundStop(soundFall);
		
		themeDataReset();
		updateThemeImage();
		mouseOut();
		if(playMode == PLAY_EDIT) {
			startEditMode();		
		} else {
			startGame(1);
		}
	}
		
	
}

iconBase.prototype.init = function()
{
	this.createCanvas();
	this.createIcon();
}

iconBase.prototype.enable = function()
{
	if(enabled) return;
	enabled = 1;
	disableMouseHandler();
	enableMouseHandler();
	iconObj.set({alpha:1})
	stage.enableMouseOver(60);
	stage.update();
}

iconBase.prototype.disable = function(hidden)
{
	disableMouseHandler();
	if(hidden) {
		iconObj.set({alpha:0});
	} else {
		iconObj.set({alpha:1})
	}
	stage.update();
	enabled = 0;
	stage.enableMouseOver(0);
}


function themeIconClass( _screenX1, _screenY1, _scale, _themeBitmapApple2, _themeBitmapC64)
{
	//_scale = _scale*2/3;
	var border = 4 * _scale;
	var themeCanvas, stage;
	var	themeIcon, themeBG;
	var saveStateObj;
	var mouseOverHandler = null, mouseOutHandler = null, mouseClickHandler = null;
	
	var bitmapX = _themeBitmapApple2.getBounds().width * _scale;
	var bitmapY = _themeBitmapApple2.getBounds().height * _scale;	
	var self = this;
	var enabled = 0;
	
	init();

	


	
	function updateThemeImage()
	{
		themeIcon.removeAllChildren();
		themeIcon.addChild(themeBG);
		
		if(curTheme == THEME_APPLE2) {
			themeIcon.addChild(_themeBitmapApple2);
		} else {
			themeIcon.addChild(_themeBitmapC64);
		}
		stage.update();
	}
	


	function mouseClick()
	{
		if(gameState == GAME_PAUSE || 
		   (gameState != GAME_START && playMode != PLAY_DEMO && playMode != PLAY_DEMO_ONCE && playMode != PLAY_EDIT))
			return;
		
		curTheme = (curTheme == THEME_APPLE2?THEME_C64:THEME_APPLE2);
		saveState();
		
		soundStop(soundDig); 
		soundStop(soundFall);
		
		themeDataReset();
		updateThemeImage();
		mouseOut();
		if(playMode == PLAY_EDIT) {
			startEditMode();		
		} else {
			startGame(1);
		}
	}
	
	function saveState()
	{
		setThemeMode(curTheme);
		if(playMode == PLAY_EDIT) {
			if(editLevelModified()) saveTestState();
			stopEditTicker();
		} else {
			stopPlayTicker();
			stopAllSpriteObj();
		}
	}
}

*/
