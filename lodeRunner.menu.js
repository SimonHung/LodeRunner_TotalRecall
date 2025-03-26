function saveKeyHandler(newHandler)
{
	var keyHandler, clickState; 
	
	keyHandler = document.onkeydown;
	clickState = disableStageClickEvent();
	document.onkeydown = newHandler;
	
	return { keyHandler: keyHandler, clickState:  clickState };
}

function restoreKeyHandler(stateObj)
{
	document.onkeydown = stateObj.keyHandler;
	if(stateObj.clickState) enableStageClickEvent();	
}

function helpMenuClass(_stage, _bitmap, _editBitmap, _scale)
{
	var HELP_BORDER_SIZE = 24;
	
	var saveStateObj;
	var playScale, curScale;
	var stage, helpBitmap = [], bitmapId;
	var helpBorder, helpBackground, versionText;
	var startX, startY, menuX, menuY;
	var closeBoxSize;
	var callBackFun, callBackArgs;
	var coverBackgroundObj, closeIcon;

	stage = _stage;
	helpBitmap[0] = _bitmap;
	helpBitmap[1] = _editBitmap;
	bitmapId = 0;
	playScale = _scale;

	this.showHelp = function(id, callback, scale, args)
	{
		curScale = scale;
		if(typeof args == "undefined") args = null;
		callBackFun = callback;
		callBackArgs = args;
		closeBoxSize = 12*curScale+2;
		closeIcon = null;
		bitmapId = id;
		
		drawBackground();
		drawHelpMenu();
		drawCloseIcon(0);
		stage.update();
		
		saveStateObj = saveKeyHandler(helpKeyDown);
	}
	
	function drawBackground()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill("black").drawRect(0, 0, stage.canvas.width, stage.canvas.height).endFill();
		coverBackgroundObj.alpha = 0.3;
		stage.addChild(coverBackgroundObj);		
	}	
	
	function removeBackground()
	{
		stage.removeChild(coverBackgroundObj);
	}	

	function drawHelpMenu()
	{
		var borderSize = HELP_BORDER_SIZE * curScale;
		var halfBorder = borderSize/2;
		var bitmapW = helpBitmap[bitmapId].getBounds().width * curScale;
		var bitmapH = helpBitmap[bitmapId].getBounds().height * curScale;
	
		menuX = bitmapW + borderSize;
		menuY = bitmapH + borderSize;
		startX = (stage.canvas.width - menuX)/2;
		startY = (stage.canvas.height - menuY)/2;
		
		if(startX < 0) startX = 0; 
		if(startY < 0) startY = 0;
	
		helpBorder = new createjs.Shape();
		helpBackground = new createjs.Shape();
		versionText = new createjs.Text(
			"Ver " + VERSION + "." + AI_VERSION + "." + playScale
			, (16*curScale) + "px Helvetica", "#FFF");
	
		var helpG = helpBorder.graphics;
	
		helpBorder.alpha = 0.8;
		helpG.beginFill("#FF0").drawRoundRect(startX, startY, menuX, menuY, halfBorder).endFill();
		
	
		var helpB = helpBackground.graphics;
	
		helpBackground.alpha = 0.6;
		helpB.beginFill("#190218")
			 .drawRoundRect(startX + halfBorder, startY + halfBorder, bitmapW, bitmapH, halfBorder/2).endFill();
	
	
		helpBitmap[bitmapId].setTransform(startX + halfBorder, startY + halfBorder, curScale, curScale);
		//helpBitmap.set({alpha:0.8});
	
		versionText.x = startX + (menuX - versionText.getBounds().width-borderSize); 
		versionText.y = startY + (menuY - versionText.getBounds().height*2.5); 
		
		stage.addChild(helpBorder);
		stage.addChild(helpBackground);
		stage.addChild(helpBitmap[bitmapId]);
		stage.addChild(versionText);
	}

	function removeHelpMenu()
	{
		stage.removeChild(versionText);
		stage.removeChild(helpBitmap[bitmapId]);
		stage.removeChild(helpBackground);
		stage.removeChild(helpBorder);
	}

	function helpKeyDown(event)
	{
		if(!event){ event = window.event; } //cross browser issues exist
		if(event.keyCode == KEYCODE_ESC) {
			closeHelpMenu();
		}
		return false;
	}	
	
	function drawCloseIcon(mouseOver)
	{
		var cycle, cross;
		var alpha, cycColor, crosColor;
		if(closeIcon == null) {
			closeIcon = new createjs.Container();
			cross = new createjs.Shape();
			cycle = new createjs.Shape();
			closeIcon.addChild(cycle, cross);
			closeIcon.on("mouseover", handleMouseOver);
			closeIcon.on("mouseout", handleMouseOut);
			closeIcon.on("click", closeHelpMenu);
			closeIcon.x = startX+menuX - closeBoxSize*3;
			closeIcon.y = startY + closeBoxSize*2;
			stage.enableMouseOver(30);
			stage.addChild(closeIcon);
		} else {
			cycle = closeIcon.getChildAt(0);
			cross = closeIcon.getChildAt(1);
		}
		if(mouseOver) {
			alpha = 0.6;
			cycColor = "red";
			crosColor = "white";	
		} else {
			alpha = 0.01;
			cycColor = "gold";
			crosColor = "white";
		}
		
		var g = cycle.graphics; 
		g.clear();
		cycle.alpha = alpha;	
		g.beginFill(cycColor).dc(closeBoxSize/2, closeBoxSize/2, closeBoxSize*5/4);
		
		g = cross.graphics;
		g.clear();
		//cross.alpha = 1;
	    g.setStrokeStyle(closeBoxSize/4).beginStroke(crosColor).moveTo(0,0)
		 .lineTo(closeBoxSize,closeBoxSize).closePath();
		
		g.moveTo(closeBoxSize,0).lineTo(0,closeBoxSize).closePath();
		
		stage.update();	
	}
	
	function removeCloseIcon()
	{
		stage.removeChild(closeIcon);
	}
	
	function handleMouseOver(event) 
	{
		stage.cursor = 'pointer'; 
		drawCloseIcon(1);
	}

	function handleMouseOut(event) 
	{
		stage.cursor = 'default'; 
		drawCloseIcon(0);
	}
	
	function closeHelpMenu() 
	{
		firstPlay = 0; // 01/12/2015
		removeCloseIcon();
		removeHelpMenu();
		removeBackground();
		stage.cursor = 'default'; 
		stage.update();
		stage.enableMouseOver(0);
		restoreKeyHandler(saveStateObj);
		if(callBackFun) setTimeout(function() { callBackFun(callBackArgs);}, 10); //add setTimeout just don't cause mouse event (click) cascade!
	}
}


function closeIconClass(_width, _height, _stage, _scale, _activeColor, _callBack, _args)
{
	var closeBoxSize = 12*_scale+2;
	var closeIcon = null;;

	drawCloseIcon(0);
	return closeIcon; //must remove by contractor 

	function drawCloseIcon(mouseOver)
	{
		var cycle, cross;
		var alpha, cycColor, crosColor;
		if(closeIcon == null) {
			closeIcon = new createjs.Container();
			cross = new createjs.Shape();
			cycle = new createjs.Shape();
			closeIcon.addChild(cycle, cross);
			closeIcon.on("mouseover", handleMouseOver);
			closeIcon.on("mouseout", handleMouseOut);
			closeIcon.on("click", handleMouseClick);
			closeIcon.x = _width  - closeBoxSize*3;
			closeIcon.y = _height + closeBoxSize*2;
			//_stage.enableMouseOver(30);
			_stage.addChild(closeIcon);
		} else {
			cycle = closeIcon.getChildAt(0);
			cross = closeIcon.getChildAt(1);
		}
		if(mouseOver) {
			alpha = 1;
			cycColor = _activeColor;
			crosColor = "white";	
		} else {
			alpha = 0.01;
			cycColor = _activeColor;
			crosColor = "white";
		}
		
		var g = cycle.graphics; 
		g.clear();
		cycle.alpha = alpha;	
		g.beginFill(cycColor).dc(closeBoxSize/2, closeBoxSize/2, closeBoxSize*5/4);
		
		g = cross.graphics;
		g.clear();
		//cross.alpha = 1;
	    g.setStrokeStyle(closeBoxSize/4).beginStroke(crosColor).moveTo(0,0)
		 .lineTo(closeBoxSize,closeBoxSize).closePath();
		
		g.moveTo(closeBoxSize,0).lineTo(0,closeBoxSize).closePath();
		
		_stage.update();
		
	}
	
	function handleMouseOver(event) 
	{
		_stage.cursor = 'pointer'; 
		drawCloseIcon(1);
	}

	function handleMouseOut(event) 
	{
		_stage.cursor = 'default'; 
		drawCloseIcon(0);
	}
	
	function handleMouseClick(event) 
	{
		_stage.cursor = 'default'; 
		if(_callBack) setTimeout(function(){_callBack(_args);},10);
	}
}



//             -+--  +-------------------------------------------------------------+
//  TOP_BORDER1 |    |                       Lode Runner 1                         |
//              |    |                                                             |
//             -+--  |   #-----------+-----------+                                 |  
//  TOP_BORDER2 |    |   | 001 - 030 | 031 - 060 |                                 |
//             -+--  |   +-----------+-----------+-----------------------------+   |
//      BORDER2 |    |   |                                                     |   |
//             -+--  |   |   +---------------------------------------------+   |   |
//                   |   |   | 001            002            003           |   |   |
//                   |   |   | +----------+   +----------+   +----------+  |   |   |
//                   |   |   | |          |   |          |   |          |  |   |   |
//                   |   |   | |          |   |          |   |          |  |   |   |
//                   |   |   | +----------+   +----------+   +----------+  |   |   |
//                   |   |   | 004            005            006           |   |   |
//                   |   |   | +----------+   +----------+   +----------+  |   |   |
//                   |   |   | |          |   |          |   |          |  |   |   |
//                   |   |   | |          |   |          |   |          |  |   |   |
//                   |   |   | +----------+   +----------+   +----------+  |   |   |
//             -+--  |   |   +---------------------------------------------+   |   |
//      BORDER2 |    |   |                                                     |   |
//             -+--  |   +-----------------------------------------------------+   |
//      BORDER1 |    |                                                             |  
//             -+--  +-------------------------------------------------------------+
//                   |<1>|<2>| 
//
//  #  : (TABS_START_X, TABS_START_Y)
// <1> : BORDER1
// <2> : BORDER2
//
//
//               
//                        |<   3    >|                  |<4>|<4>|
//               -+-  +--------------------------------------------------------+ -+-
//    SLIDE_GAP_Y |   |   001            |   002            |   003            |  |
//               -+-  |   +----------+       +----------+       +----------+   |
//  SELECT_SIZE_Y |   |   |          |   |   |          |   |   |          |   |
//                |   |   |          |       |          |       |          |   |
//               -+-  |   +----------+   |   +----------+   |   +----------+   |
//   SLIDE_GAP_Y1 |   |                                                        |
//               -+-  | - - - - - - - -  | - - - - - - - -  | - - - - - - - -  | SLIDE_AREA_Y
//                    |   004                005                006            |
//                    |   +----------+   |   +----------+   |   +----------+   |
//                    |   |          |       |          |       |          |   |
//                    |   |          |   |   |          |   |   |          |   |
//                    |   +----------+       +----------+       +----------+   |
//                    |                  |                  |                  |  |
//                    +--------------------------------------------------------+ -+- 
//                    
//                    |<                       SLIDE_AREA_X                   >| 
//
//
// < 3 > : SELECT_SIZE_X
// < 4 > : SLIDE_GAP_X


function selectDialog(_titleName, _checkBitmap, _levelData, _activeLevel, _screenX1, _screenY1, 
					   _parentStage, _scale, _activeFun, _closeFun, _postFun)	
{
	var TITLE_TEXT_SIZE = 36 * _scale;
	var TABS_TEXT_SIZE = 20  * _scale;
	
	var TOP_BORDER1 = TITLE_TEXT_SIZE * 2 | 0; //new: *2, old: *3/2
	var TOP_BORDER2 = TABS_TEXT_SIZE * 3/2 | 0;
	var BORDER1 = 20 * _scale;
	var BORDER2 = 16 * _scale;
	var TABS_START_X = BORDER1;
	var TABS_START_Y = TOP_BORDER1;
	
	var MAP_SCALE = _scale * 0.2;
	var SELECT_SIZE_X = NO_OF_TILES_X*BASE_TILE_X*MAP_SCALE;
	var SELECT_SIZE_Y = NO_OF_TILES_Y*BASE_TILE_Y*MAP_SCALE;
	var SLIDE_PAGE_ITEMS = 3 * 10;
	var SLIDE_GAP_X = BASE_TILE_X * _scale * 3/5; //new: 3/5, old: 3/4
	var SLIDE_GAP_Y = BASE_TILE_Y * _scale * 3/4;
	var SLIDE_GAP_Y1 = BASE_TILE_Y * _scale * 2/4; //new: 2/4, old: 3/4 
	
	var SLIDE_ITEM_X = 3;
	var SLIDE_ITEM_Y = 3;
	var SLIDE_AREA_X = (SLIDE_GAP_X*2+SELECT_SIZE_X)*SLIDE_ITEM_X;
	var SLIDE_AREA_Y = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y)*SLIDE_ITEM_Y;
	
	var CANVAS_SIZE_X = (BORDER1+BORDER2)*2 + SLIDE_AREA_X;
	var CANVAS_SIZE_Y = TOP_BORDER1 + TOP_BORDER2 + BORDER2 + SLIDE_AREA_Y +BORDER1+BORDER2;

	var BACKGROUND_COLOR = "#ff5050";
	var BORDER1_COLOR = BACKGROUND_COLOR;
	var BORDER2_COLOR = "white";
	var TABS_ACTIVE_FILL_COLOR = BORDER2_COLOR;
	var TABS_ACTIVE_LINE_COLOR = BORDER2_COLOR;
	var TABS_ACTIVE_TEXT_COLOR = "black";	
	var TABS_INACTIVE_FILL_COLOR = "#ccc";
	var TABS_INACTIVE_LINE_COLOR = "#aaa";	
	var TABS_INACTIVE_TEXT_COLOR = "#888";	

	var SLIDE_BACKGROUND = "#EEEEFF";
	var SLIDE_BOUNDLINE_COLOR = "red";
	
	var SELECT_TEXT_COLOR = "black";
	var SELECT_TEXT_ACTIVE_COLOR = "red";
	var SELECT_TEXT_SIZE = 20  * _scale;
	
	var SELECT_MOUSE_OVER_COLOR = "gold";
	var SELECT_MAP_BACKGROUND_COLOR = "black";
	var SELECT_SCORE_COLOR = "white";
	var SELECT_SCORE_SHADOW = "black";
	var SELECT_CHECK_SHADOW_COLOR = "white";
	
	var TITLE_TEXT_COLOR = "white";
	var TITLE_TEXT_SHADOW_COLOR = "gold";
	
	var CLOSE_ICON_ACTIVE_COLOR = "#8080ff";
	
	//////////////////////////////////////////////////
	
	var canvas1;
	var coverBackgroundObj;
	var dialogStage;
	var slider;
	var boundLine1, boundLine2;

	var tabs = [], tabsLine;

	var maxPages, activePage; //0 - 
	var lastWheelFun = null;	

	var activeState = 0; //for edit mode only (1: active level shift, -1: active level deleted)
	var levelDeleted = 0; //for edit mode only
	var saveKeyStateObj;
	
	init();
	
	function init()
	{
		saveKeyState();
		createCanvas1();
		createDialogStage();
		setBackground();

		initVariable();
		drawCoverBackground();
		createSliderPage();
		createSliderBoundLine();
		createBorder1();
		createBorder2();
		createTabs(0);
		createTitle();
		new closeIconClass(CANVAS_SIZE_X, 0, dialogStage, _scale, CLOSE_ICON_ACTIVE_COLOR, closeBox, null);
		dialogStage.update();
	}

	function initVariable()
	{
		maxPages = Math.ceil(_levelData.length / SLIDE_PAGE_ITEMS); 

		if(playMode == PLAY_EDIT && _activeLevel <= 0) {
			_activeLevel = activePage = 0;
		} else {
			if(_activeLevel <= 0 || _activeLevel > _levelData.length) _activeLevel = 1;
			activePage = Math.ceil(_activeLevel / SLIDE_PAGE_ITEMS)-1;
		}
	}
	
	function drawCoverBackground()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill("black")
			.drawRect(0, 0, _parentStage.canvas.width, _parentStage.canvas.height).endFill();
		coverBackgroundObj.alpha = 0.6;
		_parentStage.addChild(coverBackgroundObj);	
		_parentStage.update();
	}		

	function removeCoverBackground()
	{
		_parentStage.removeChild(coverBackgroundObj);
	}		
	
	function createCanvas1()
	{
		canvas1 = document.createElement('canvas');
		canvas1.id     = "canvas1";
		canvas1.width  = CANVAS_SIZE_X;
		canvas1.height = CANVAS_SIZE_Y;
	
		var left = ((_screenX1 - canvas1.width)/2|0),
			top  = ((_screenY1 - canvas1.height)/2|0);
		canvas1.style.left = (left>0?left:0) + "px";
		canvas1.style.top =  (top>0?top:0) + "px";
		canvas1.style.position = "absolute";
		document.body.appendChild(canvas1);
	}
	
	function saveKeyState()
	{
		saveKeyStateObj = saveKeyHandler(handleEscKeyDown);
	}
	
	function restoreKeyState()
	{
		restoreKeyHandler(saveKeyStateObj);
	}
	
	function handleEscKeyDown(event) 
	{
		if(!event){ event = window.event; } //cross browser issues exist
	
		if(event.shiftKey || event.ctrlKey) return false;

		switch(event.keyCode) {
		case KEYCODE_ESC:
			closeBox();
			break;	
		default:
			//debug("keycode = " + code);	
			break;	
		}
		return false;
	}	
	
	function closeBox()
	{
		removeCanvas1();
		removeCoverBackground();
		restoreKeyState();
		if(_postFun) _postFun();
		if(_closeFun) _closeFun(levelDeleted, _activeLevel, activeState);		//for edit mode
	}
	
	function removeCanvas1()
	{
		dialogStage.removeAllChildren();
		dialogStage.enableMouseOver(0);
		dialogStage.cursor ="default";
		createjs.Ticker.removeEventListener(dialogStage);
		document.body.removeChild(canvas1);
	}		
	
	function createDialogStage()
	{
		dialogStage = new createjs.Stage(canvas1);
		dialogStage.enableMouseOver(60);
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", dialogStage);
	}
	
	function setBackground()
	{
		var background = new createjs.Shape();
		background.graphics.beginFill(BACKGROUND_COLOR).drawRoundRect(0, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y, 8*_scale)
		.endFill();
		dialogStage.addChild(background);
	}

	
	function createSliderPage()
	{
		slider = new createjs.Container();	
		dialogStage.addChild(slider);
	}
			
	function createSliderBoundLine()
	{
		boundLine1 = new createjs.Shape();
		boundLine2 = new createjs.Shape();
	
		boundLine1.graphics.setStrokeStyle(2).beginStroke(SLIDE_BOUNDLINE_COLOR)
			.moveTo(BORDER1+BORDER2, TOP_BORDER1+TOP_BORDER2+BORDER2+1)
			.lineTo(SLIDE_AREA_X+BORDER1+BORDER2, TOP_BORDER1+TOP_BORDER2+BORDER2+1).endStroke();
		boundLine1.alpha = 0;
	
		boundLine2.graphics.setStrokeStyle(2).beginStroke(SLIDE_BOUNDLINE_COLOR)
			.moveTo(BORDER1+BORDER2, CANVAS_SIZE_Y-BORDER1-BORDER2-1)
			.lineTo(SLIDE_AREA_X+BORDER1+BORDER2, CANVAS_SIZE_Y-BORDER1-BORDER2-1).endStroke();		
		boundLine2.alpha = 0;
	
		dialogStage.addChild(boundLine2, boundLine1);
	}
	
	function createBorder1()
	{
		var border1 = new createjs.Container();	
		var vBorder1 = new createjs.Shape();
		var vBorder2 = new createjs.Shape();
		
		vBorder1.graphics.beginFill(BORDER1_COLOR)
			      .drawRect(BORDER1+BORDER2-1, 0, SLIDE_AREA_X+2, TOP_BORDER1+TOP_BORDER2).endFill();
		
		vBorder2.graphics.beginFill(BORDER1_COLOR)
			      .drawRect(BORDER1+BORDER2-1, CANVAS_SIZE_Y-BORDER1, SLIDE_AREA_X+2, BORDER1).endFill();
		
		border1.addChild(vBorder1, vBorder2);
		border1.on("mouseover", function() { dialogStage.cursor ="default"; });
		dialogStage.addChild(border1);
	}
	
	function createBorder2()
	{
		var border2 = new createjs.Container();	
		var vBorder1 = new createjs.Shape();
		var vBorder2 = new createjs.Shape();
		var hBorder1 = new createjs.Shape(); 
		var hBorder2 = new createjs.Shape(); 
		
		
		vBorder1.graphics.beginFill(BORDER2_COLOR)
			.drawRect(BORDER1, TOP_BORDER1+TOP_BORDER2, 
			CANVAS_SIZE_X-2*BORDER1, BORDER2+1).endFill();
 	
		vBorder2.graphics.beginFill(BORDER2_COLOR)
			.drawRect(BORDER1, CANVAS_SIZE_Y-BORDER1-BORDER2-1, 
			CANVAS_SIZE_X-2*(BORDER1)-BORDER2,BORDER2+1).endFill();
 	
		hBorder1.graphics.beginFill(BORDER2_COLOR)
			.drawRect(BORDER1, TOP_BORDER1+TOP_BORDER2+BORDER2, 
			BORDER2+2, CANVAS_SIZE_Y-BORDER1-BORDER2-TOP_BORDER1-TOP_BORDER2).endFill();
 	
		hBorder2.graphics.beginFill(BORDER2_COLOR)
			.drawRect(CANVAS_SIZE_X-BORDER1-BORDER2-1, TOP_BORDER1+TOP_BORDER2+BORDER2, 
			BORDER2+1, CANVAS_SIZE_Y-BORDER1-BORDER2-TOP_BORDER1-TOP_BORDER2).endFill();
 	
		border2.addChild(vBorder1, vBorder2, hBorder1, hBorder2);
		dialogStage.addChild(border2);
	}	
	
	function clearTabs()
	{
		for(var i = 0; i < tabs.length; i++) {
			dialogStage.removeChild(tabs[i]);
		}
		dialogStage.removeChild(tabsLine);
	}
	
	function createTabs(tabsOnly)
	{
		var tabBackground, tabText;
		var textWidth, textHeight;
		var tabsStartX = BORDER1;
		
		for(var i = 0; i < maxPages; i++) {
			var tabsName = ("00" + (i * SLIDE_PAGE_ITEMS + 1)).slice(-3) + " - " + 
				           ("00" + (i==maxPages-1?_levelData.length:((i+1) * SLIDE_PAGE_ITEMS))).slice(-3);
			//debug(tabsName);
			
			tabs[i] = new createjs.Container();
			tabBackground = new createjs.Shape();
			tabText = new createjs.Text(tabsName, TABS_TEXT_SIZE +  "px Arial", TABS_INACTIVE_TEXT_COLOR);
			textHeight = tabText.getBounds().height+4*_scale;
			textWidth = tabText.getBounds().width+textHeight;
		
			tabText.x = textHeight;
			tabs[i].x = tabsStartX;
			tabs[i].y = TOP_BORDER1+TOP_BORDER2 - textHeight;
			tabsStartX += (textHeight/2+textWidth);
			tabs[i].addChild(tabBackground, tabText);
			tabsActive(i);
			dialogStage.addChild(tabs[i]);
			
			tabs[i].tabId = i;
			
			tabs[i].on("mouseover", function(){ dialogStage.cursor = 'pointer'; dialogStage.update();});
			tabs[i].on("mouseout", function() { dialogStage.cursor = 'default'; dialogStage.update();});
			
			tabs[i].on("click", tabMouseClick);					   
		}
		
		tabsLine = new createjs.Shape();
		tabsLine.graphics.setStrokeStyle(2).beginStroke(TABS_ACTIVE_LINE_COLOR)
			.moveTo(BORDER1, TOP_BORDER1+TOP_BORDER2)
			.lineTo(SLIDE_AREA_X+BORDER1+2*BORDER2, TOP_BORDER1+TOP_BORDER2).endStroke();
		dialogStage.addChild(tabsLine);
		
		tabsInActiveAll();
		tabsActive(activePage);
		if(!tabsOnly) setSlidePage(activePage);
		
		function tabsActive(id)
		{
			tabBackground = tabs[id].getChildAt(0);
			tabText = tabs[id].getChildAt(1);
		
			tabBackground.graphics.clear().setStrokeStyle(1)
				.beginStroke(TABS_ACTIVE_LINE_COLOR).beginFill(TABS_ACTIVE_FILL_COLOR)
				.moveTo(0, textHeight).lineTo(textHeight/2, 0)
				.lineTo(textHeight/2+textWidth, 0).lineTo(textHeight+textWidth, textHeight)
				.lineTo(0, textHeight).endFill();
			tabText.color = TABS_ACTIVE_TEXT_COLOR;
			moveChild2Top(dialogStage, tabs[id]);
			dialogStage.update();
		}
		
		function tabsInActive(id)
		{
			tabBackground = tabs[id].getChildAt(0);
			tabText = tabs[id].getChildAt(1);
		
			tabBackground.graphics.clear().setStrokeStyle(1)
				.beginStroke(TABS_INACTIVE_LINE_COLOR).beginFill(TABS_INACTIVE_FILL_COLOR)
				.moveTo(0, textHeight).lineTo(textHeight/2, 0)
				.lineTo(textHeight/2+textWidth, 0).lineTo(textHeight+textWidth, textHeight)
				.lineTo(0, textHeight).endFill();
			tabText.color = TABS_INACTIVE_TEXT_COLOR;
			moveChild2Top(dialogStage, tabs[id]);
		}
		
		function tabsInActiveAll()
		{
			for(var i = maxPages; i > 0; i--) {
				tabsInActive(i-1);
				moveChild2Top(dialogStage, tabs[i-1]);
			}
			moveChild2Top(dialogStage, tabsLine);
		}
		
		function tabMouseClick() {
			if(activePage != this.tabId) {
				tabsInActiveAll();
				tabsActive(this.tabId);
				setSlidePage(this.tabId);
				activePage = this.tabId;
			}
		}
	}
	
	function setSlidePage(pages)
	{
		var startLevel = SLIDE_PAGE_ITEMS * pages+1;
		var endLevel = (pages == maxPages-1)?_levelData.length:SLIDE_PAGE_ITEMS * (pages+1);
		
		var pageItems = endLevel - startLevel+1;
		var selectItemX = SLIDE_ITEM_X;
		var selectItemY = Math.ceil(pageItems/SLIDE_ITEM_X);
		
		var slideX = SLIDE_AREA_X;
		var slideY = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y) * (selectItemY < SLIDE_ITEM_Y?SLIDE_ITEM_Y:selectItemY);
		var slideStartX = BORDER1 + BORDER2;
		var slideStartY = TOP_BORDER1 + TOP_BORDER2 + BORDER2;
		
		var maxSliderY = slideStartY;
		var minSliderY = slideStartY + SLIDE_AREA_Y - slideY;
		
		var background = new createjs.Shape();
		var selectRect = [], selectText = [];
		var delSelectObj = [];
		
		var sliderMoved = 0; //while move ths silder don't active mouse click
		var firstPressMoveY = 0; //keep  Y position while first press move
		var closeClicked = 0, closeOver = 0;
		
		var activeItemY = -1; //for scroll to active Item
		
		
		init();
		
		function init() 
		{
			var diffY;
			
			slider.removeAllChildren();
			slider.removeAllEventListeners();
			
			background.graphics.beginFill(SLIDE_BACKGROUND).drawRect(0, 0, slideX, slideY);
			slider.addChild(background);
		
			var id = -1;
			
			levelLoop:
			for(var y = 0; y < selectItemY; y++) {
				for(var x = 0; x < selectItemX; x++) {
					if(++id >= pageItems) break levelLoop;
					createSelectLevel(x, y);
				}
			}
			background.on("mouseover", function() {
				dialogStage.cursor =  "url('cursor/openhand.cur'), auto";}
			);
			background.on("mouseout", function() { 
				dialogStage.cursor =  "default";}
			);
			
			slider.on("mousedown", function(evt) {
				diffY = evt.currentTarget.y - evt.stageY;
			});

			slider.on("pressmove",function(evt) {
				debug("pressmove (1) x=" + evt.stageX + ", y=" + evt.stageY); 
				if(sliderMoved++ <= 0) firstPressMoveY = evt.stageY;
				
				boundLine1.alpha = boundLine2.alpha = 0;
				dialogStage.cursor =  "url('cursor/closedhand.cur'), auto";
			
				evt.currentTarget.y = evt.stageY + diffY;
				if(evt.currentTarget.y > maxSliderY) {
					evt.currentTarget.y = maxSliderY;
					boundLine1.alpha = 1; 
				} else
				if(evt.currentTarget.y < minSliderY ) {
					evt.currentTarget.y = minSliderY;
					boundLine2.alpha = 1; 
				}
				dialogStage.update();   
			});
		
			slider.on("pressup", function(evt) {
				debug("press-up (0)");
				sliderMoved = firstPressMoveY = 0;
				dialogStage.cursor =  "url('cursor/openhand.cur'), auto";
				boundLine1.alpha = boundLine2.alpha = 0;
				
				//---------------------
				// move to block bound
				//---------------------
				var blockSizeY = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y);
				var startY = maxSliderY
				var mod = (maxSliderY - slider.y) % blockSizeY; //division remainder value to block bound
				
				if(blockSizeY/2 > mod) {
					evt.currentTarget.y += mod; //shift down
				} else {
					evt.currentTarget.y -= (blockSizeY - mod); //shift up
				}
				
				dialogStage.update();
			});		
		
			slider.x = slideStartX;
			slider.y = slideStartY;
			if(activeItemY > 0) { //scroll to active level 
				slider.y -= activeItemY*(SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y);
			}
			
			dialogStage.update();
			enableMouseWheel();
		}
		
		function createSelectLevel(x, y)
		{
			var id = y*selectItemX+x;
			var textColor = SELECT_TEXT_COLOR, level = startLevel+id;;
			
			if(_activeLevel == level) {
				activeItemY = y;
				if(activeItemY + SLIDE_ITEM_Y > selectItemY) {
					activeItemY = selectItemY - SLIDE_ITEM_Y;
				}
				textColor = SELECT_TEXT_ACTIVE_COLOR;
			}
					
			selectText[id] = new createjs.Text(("00"+level).slice(-3), SELECT_TEXT_SIZE + "px Arial",
				textColor);
					
			selectText[id].x = (SLIDE_GAP_X*2+SELECT_SIZE_X) * x + SLIDE_GAP_X;
			selectText[id].y = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y) * y + SLIDE_GAP_Y - SELECT_TEXT_SIZE*4/3;
			slider.addChild(selectText[id]);
					
			selectRect[id] = buildSelectMap(level, id);
			selectRect[id].x = (SLIDE_GAP_X*2+SELECT_SIZE_X) * x + SLIDE_GAP_X;
			selectRect[id].y = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y) * y + SLIDE_GAP_Y;
			slider.addChild(selectRect[id]);
			
			if(playMode != PLAY_DEMO || (playMode == PLAY_DEMO && (typeof demoData[level-1] != "undefined"))) {
				selectRect[id].on('click', selectClick);
				selectRect[id].on('mouseover', selectMouseOver);
				selectRect[id].on('mouseout', selectMouseOut);
			}
			
			selectRect[id].myId = id;
			selectRect[id].myLevel = level;
		}

		function delSelectLevel(level)
		{
			var id = level - startLevel;  //level = startLevel + id
			var x, y;
			var tabsOnly = 1;

			//(1) remove deleted level
			slider.removeChild(selectText[id]);
			slider.removeChild(selectRect[id]);

			//(2) remove close icon object
			delSelectObj.splice(id,1);

			//(3) shift level+1 - endLevel
			while(level < endLevel) {	
				id = level - startLevel;
				y = id /selectItemX|0;
				x = id - y * selectItemX;
				selectText[id] = selectText[id+1];
				selectText[id].text = ("00"+level).slice(-3);
				selectText[id].color = (_activeLevel == level)?SELECT_TEXT_ACTIVE_COLOR:SELECT_TEXT_COLOR; 
				selectText[id].x = (SLIDE_GAP_X*2+SELECT_SIZE_X) * x + SLIDE_GAP_X;
				selectText[id].y = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y) * y + SLIDE_GAP_Y - SELECT_TEXT_SIZE*4/3;
					
				selectRect[id] = selectRect[id+1];
				selectRect[id].x = (SLIDE_GAP_X*2+SELECT_SIZE_X) * x + SLIDE_GAP_X;
				selectRect[id].y = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y) * y + SLIDE_GAP_Y;
				selectRect[id].myLevel = level;
				selectRect[id].myId = level - startLevel;
				
				level++;
			}
			
			//(3) add one if could add
			if(level <= editLevels) {
				// add new level 
				id = level - startLevel;
				y = id /selectItemX|0;
				x = id - y * selectItemX;
				createSelectLevel(x,y);
				maxPages = Math.ceil(_levelData.length / SLIDE_PAGE_ITEMS); 
			} else {
				// no more level (remove last level)
				if(level == startLevel) { //end pages and no more levels in this pages
					maxPages--;
					if(maxPages > 0) {
						tabsOnly = 0;
						activePage = maxPages-1;
						//move to previous page
					} else {
						//no any level in select menu !!! ==> close it (maxPages < 0)
					}
				}
				endLevel--;
				
				pageItems = endLevel - startLevel+1;
				selectItemY = Math.ceil(pageItems/SLIDE_ITEM_X);
				slideY = (SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y) * (selectItemY < SLIDE_ITEM_Y?SLIDE_ITEM_Y:selectItemY);
				minSliderY = slideStartY + SLIDE_AREA_Y - slideY;
				if(slider.y < minSliderY) slider.y = minSliderY; //shift slider 
			}

			//(3) redraw tabs page	
			clearTabs()
			createTabs(tabsOnly);
			
			if(maxPages <= 0) closeBox();
		}
		
		
		function buildSelectMap(level, id) 
		{
			var levelMap = _levelData[level-1];
			var selectMap = new createjs.Container();	
			var border = new createjs.Shape();
			var background = new createjs.Shape();
	
			var borderSize = _scale*4+2;
	
			border.graphics.beginFill(SELECT_MOUSE_OVER_COLOR)
			      .drawRoundRect(-borderSize, -borderSize, SELECT_SIZE_X+2*borderSize, SELECT_SIZE_Y+2*borderSize, borderSize);
			border.alpha = 0;
			background.graphics.beginFill(SELECT_MAP_BACKGROUND_COLOR).drawRect(0, 0, SELECT_SIZE_X, SELECT_SIZE_Y);
	
			selectMap.addChild(border, background);
			selectMap.addChild(level2Bitmap(levelMap));
			
			switch(playMode) {
			case PLAY_EDIT:		
				if(editLevelData == _levelData) {	//del box only for "custom levels", NOT for "LOAD" button
					delSelectObj[id] = new delIcon();
					selectMap.addChild(delSelectObj[id].getCloseObj());
				}
				break;
			case PLAY_DEMO:
				setDemoLevelInfo(selectMap, level);	
				break;
			default:		
				setLevelInfo(selectMap, level);
				break;	
			}
			
			return selectMap;
		}	
		
		function level2Bitmap(levelMap)
		{
			var container = new createjs.Container();	
			var guardCount = 0, runner = 0;
			var bitmap;
	
			//--------------------------------------------
			// Parser map from right-bottom to left-top
			// for drop guards if too manys	
			//--------------------------------------------
			var index = NO_OF_TILES_Y * NO_OF_TILES_X - 1;
			for(var y = NO_OF_TILES_Y-1; y >= 0; y--) {
				for(var x = NO_OF_TILES_X-1; x >= 0; x--) {
					var id = levelMap.charAt(index--);		

					var curTile;	
					switch(id) {
					default:		
					case ' ': //empty
						continue;
					case '#': //Normal Brick
						curTile = getThemeBitmap("brick");
						break;	
					case '@': //Solid Brick
						curTile = getThemeBitmap("solid");
						break;	
					case 'H': //Ladder
						curTile = getThemeBitmap("ladder");
						break;	
					case '-': //Line of rope
						curTile = getThemeBitmap("rope");
						break;	
					case 'X': //False brick
						curTile = getThemeBitmap("brick");
						break;
					case 'S': //Ladder appears at end of level
						continue;
					case '$': //Gold chest
						curTile = getThemeBitmap("gold");
						break;	
					case '0': //Guard
						if(++guardCount > MAX_NEW_GUARD) { 
							continue;  //too many guard , set this tile as empty
						}
						curTile = new createjs.Sprite(guardData, "runLeft");
						curTile.stop();	
						break;	
					case '&': //Player
						if(++runner > 1) {
							continue;  //too many runner, set this tile as empty
						}
						curTile = new createjs.Sprite(runnerData, "runRight");
						curTile.stop();	
						break;	
					}
					curTile.setTransform(x * BASE_TILE_X*MAP_SCALE, y * BASE_TILE_Y*MAP_SCALE,MAP_SCALE, MAP_SCALE);
					container.addChild(curTile); 
				}
			}	
			container.cache(0, 0, SELECT_SIZE_X, SELECT_SIZE_Y);
			bitmap = new createjs.Bitmap( container.cacheCanvas); //change "cont.getCacheDataURL()" to "cont.cacheCanvas"
			container.removeAllChildren();
			return bitmap;
		}
		
		//for demo mode
		function setDemoLevelInfo(selectObj, level) 
		{
			if(	typeof demoData[level-1] != "undefined") {
				var bitmap = _checkBitmap.clone();
				var startX = (SELECT_SIZE_X - _checkBitmap.getBounds().width*_scale)/2|0;
				var startY = (SELECT_SIZE_Y - _checkBitmap.getBounds().height*_scale)/4|0;
			
				bitmap.setTransform(startX, startY, _scale, _scale);
				bitmap.set({alpha:0.9});
				bitmap.shadow = new  createjs.Shadow(SELECT_CHECK_SHADOW_COLOR, 2, 2, 5);
				selectObj.addChild(bitmap);
			}
		}
		
		function setLevelInfo(selectObj, level)
		{
			if(modernScoreInfo[level-1] >= 0) {
				var bitmap = _checkBitmap.clone();
				var scoreText = new createjs.Text(modernScoreInfo[level-1],
								"bold "+SELECT_TEXT_SIZE +"px Helvetica",SELECT_SCORE_COLOR);
				var startX = (SELECT_SIZE_X - _checkBitmap.getBounds().width*_scale)/2|0;
				var startY = (SELECT_SIZE_Y - _checkBitmap.getBounds().height*_scale)/4|0;
			
				bitmap.setTransform(startX, startY, _scale, _scale);
				bitmap.set({alpha:0.9});
				bitmap.shadow = new  createjs.Shadow(SELECT_CHECK_SHADOW_COLOR, 2, 2, 5);
				selectObj.addChild(bitmap);
				
				scoreText.x = (SELECT_SIZE_X - scoreText.getBounds().width)/2|0;
				scoreText.y = SELECT_SIZE_Y - scoreText.getBounds().height;
				scoreText.shadow = new createjs.Shadow( SELECT_SCORE_SHADOW, 2, 2, 3);
				selectObj.addChild(scoreText);
			}
		}
		
		function selectClick(evt)
		{
			debug("selectClick(0) x=" + evt.stageX + ", y=" + evt.stageY + "(" +  Math.abs(firstPressMoveY-evt.stageY) +")"); 

			//=============================================================================================================
			// BUG FIX: This is not a root solution !!! 6/16/2014
			// sometime when click on slect map level, also will do "pressmove" command
			// (1) pressmove => (2) select click ==> (3) pressup
			// so currently use sliderMoved count > 10 or (click Y-pos not equal to pressmove Y-pos ) acts as move slider
			// otherwise acts as click the selection!	
			//=============================================================================================================
			if(sliderMoved > 10 || (sliderMoved && firstPressMoveY != evt.stageY) || closeClicked) { 
				//while move the silder or click on delete level icon don't active mouse click 
				debug("sliderMoved = " + sliderMoved + " closeClicked = " + closeClicked);
				sliderMoved = firstPressMoveY = closeClicked = 0;
				return; 
			}
			debug("selectClick");
			removeCanvas1();
			removeCoverBackground();
			restoreKeyState();
			if(_postFun) _postFun();
			_activeFun(this.myLevel);
		}
		
		function selectMouseOver()
		{
			var border = this.getChildAt(0);
	
			if(playMode == PLAY_EDIT && editLevelData == _levelData) { //del box only for "custom levels", NOT for "LOAD"
				delSelectObj[this.myId].selectOver();	
			}
			
			border.alpha = 1;
			dialogStage.cursor = 'pointer';
			dialogStage.update();
		}
		
		function selectMouseOut()
		{
			var border = this.getChildAt(0);
			
			if(playMode == PLAY_EDIT && editLevelData == _levelData) { //del box only for "custom levels", NOT for "LOAD"
				if(this.myId < delSelectObj.length)	delSelectObj[this.myId].selectOut();	
				////else debug("mouse out: select deleted");
			}
			
			border.alpha = 0;
			dialogStage.cursor =  "url('cursor/openhand.cur'), auto";
			dialogStage.update();
		}
		
		function wheelScroll(e)
		{
			var direction = e.detail?-e.detail:e.wheelDelta; //e.detail: for fireFox, e.wheelDelta: for chrome, IE
			direction = (direction>0)?1: -1;	
	
			
			slider.y += ((SLIDE_GAP_Y+SLIDE_GAP_Y1+SELECT_SIZE_Y)) * direction;
			//boundLine1.alpha = boundLine2.alpha = 0;
			if(slider.y > maxSliderY) {
				slider.y = maxSliderY;
				//boundLine1.alpha = 1; 
			} else if(slider.y < minSliderY ) {
				slider.y = minSliderY;
				//boundLine2.alpha = 1; 
			}
			dialogStage.update();
		}	
	
		function enableMouseWheel()
		{
			if(lastWheelFun) {
				canvas1.removeEventListener("mousewheel", lastWheelFun, false);
				canvas1.removeEventListener('DOMMouseScroll', lastWheelFun, false);
			}
			lastWheelFun = wheelScroll;
			//for chrome
			canvas1.addEventListener("mousewheel", wheelScroll, false);
			//for firefox
			canvas1.addEventListener('DOMMouseScroll', wheelScroll, false);
		}	
		
		function delIcon()
		{
			var closeBoxSize = 12*_scale+1;
			var cross, cycle, delIconObj;
			
			createCloseIcon();
			
			this.getCloseObj = function ()
			{
				return delIconObj;
			}


			this.selectOver = function ()
			{
				////debug("select over");
				if(closeOver) return;
				drawIcon(1);	
			}
			
			this.selectOut = function ()
			{
				////debug("select out");
				drawIcon(0);	
			}
			
			function createCloseIcon()
			{
				cross = new createjs.Shape();
				cycle = new createjs.Shape();
				delIconObj = new createjs.Container();
				delIconObj.addChild(cycle, cross);
				delIconObj.on("mouseover", handleMouseOver);
				delIconObj.on("mouseout", handleMouseOut);
				delIconObj.on("click", handleMouseClick);
				delIconObj.x = SELECT_SIZE_X  - closeBoxSize*2;
				delIconObj.y = closeBoxSize;
			
				drawIcon(0);
			}
		
			function drawIcon(state) 
			{
				var cycAlpha, crosAlpha, cycColor, crosColor;
			
				crosColor = "white";	

				switch(state) {
				case 0:
					cycColor = "#888";
					cycAlpha = crosAplha = 0;	
					break;
				case 1:
					cycColor = "#888";
					crosAlpha = 1;	
					cycAlpha = 	0.7;
					break;
				case 2: 
					cycColor = "red";
					crosAlpha = cycAlpha = 1;
					break;
				}
			
				var g = cycle.graphics; 
				g.clear();
				cycle.alpha = cycAlpha;	
				g.beginFill(cycColor).dc(closeBoxSize/2, closeBoxSize/2, closeBoxSize*7/6);
				//g.beginFill(cycColor).dr(-closeBoxSize/2, - closeBoxSize/2, closeBoxSize*2, closeBoxSize*2);
				
				g = cross.graphics;
				g.clear();
				cross.alpha = crosAlpha;	
				g.setStrokeStyle(closeBoxSize/4).beginStroke(crosColor).moveTo(0,0)
		 	 	 .lineTo(closeBoxSize,closeBoxSize).closePath();
		
				g.moveTo(closeBoxSize,0).lineTo(0,closeBoxSize).closePath();			
			}
			
			function handleMouseOver(event) 
			{
				////debug("close over");
				closeOver = 1;
				drawIcon(2);
			}

			function handleMouseOut(event) 
			{
				////debug("close out");
				closeOver = 0;
				drawIcon(1);
			}
	
			function handleMouseClick(event) 
			{
				closeClicked = 1;
				////debug("delete level = " + delIconObj.parent.myLevel);
				delLevel(delIconObj.parent.myLevel); //get level from parent's property
			}
		}
		
		//-------------------------------
		// for edit mode to delete level 
		//-------------------------------
		
		function delLevel(level)
		{
			//(1) remove from local storage & variable
			delEditLevel(level);
			levelDeleted = 1; 
			
			//(2) shift or delete active level
			if(_activeLevel == level) {
				_activeLevel = 0;
				activeState = -1; //active level deleted
				
				clearTestLevel(); //test level deleted
				
			} else if( _activeLevel > level) {
				_activeLevel--; 
				activeState = 1; //active level shift

				getTestLevel(testLevelInfo);
				testLevelInfo.level = _activeLevel; // change level no
				setTestLevel(testLevelInfo);
				
			} else if (_activeLevel == 0) { //0 meaings test level is new level
				
				if(testLevelInfo.modified == 1) {	
					testLevelInfo.level = editLevels+1;
					setTestLevel(testLevelInfo);
				} 
			}
			
			//(3) shift or delete playInfo of user created
			playData = PLAY_DATA_USERDEF;
			if(editLevels > 0) {
				getModernInfo();
				if(curLevel == level) {  //play level deleted
					curLevel = 1;
					setModernInfo();
				} else if ( curLevel > level) { //level shift
					curLevel--;
					setModernInfo();
				}
			} else {
				clearModernInfo();
			}
			
			//(4) remove from slider
			delSelectLevel(level);
			
			////debug("delete level = " + level);
		}
	}
	
	function createTitle()
	{
		var titleText = new createjs.Text(_titleName, 
					"italic bold " + TITLE_TEXT_SIZE + "px Helvetica",TITLE_TEXT_COLOR);
		titleText.x = (CANVAS_SIZE_X - titleText.getBounds().width)/2|0;
		titleText.y = (TOP_BORDER1 - titleText.getBounds().height)/2|0;
		titleText.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 2, 2, 10 );
		dialogStage.addChild(titleText);
	}
	
}

function handleMenuKeyDown(event) 
{
	if(!event){ event = window.event; } //cross browser issues exist
	
	if(event.shiftKey || event.ctrlKey) return false;

	switch(event.keyCode) {
	case KEYCODE_UP: 
		keyAction = ACT_UP;
		break;
	case KEYCODE_DOWN: 
		keyAction = ACT_DOWN;
		break;
	case KEYCODE_ENTER:
		break;	
	case KEYCODE_ESC:
		break;	
	default:
		keyAction = ACT_UNKNOWN;
		//debug("keycode = " + code);	
		break;	
	}
	return false;
}	

//==============
// select menu
//==============
function menuDialog(_titleName, _itemList, _stage, _scale, _closeIconEnable, _closeCallBack, _args)
{
	var TITLE_TEXT_SIZE = 48 * _scale;
	var ITEM_TEXT_SIZE = 40 * _scale;
	
	var TITLE_TEXT_COLOR = "white";
	var TITLE_TEXT_SHADOW_COLOR = "gold";
	
	var ITEM_TEXT_COLOR = "white";
	var ITEM_TEXT_SHADOW_COLOR = "gold";
	
	var TITLE_AREA_Y = TITLE_TEXT_SIZE * 2.5 | 0;
	
	var ITEM_AREA_Y = ITEM_TEXT_SIZE * 3/2 | 0;
	var ITEM_GAP_Y = ITEM_TEXT_SIZE * 2/3 | 0;
	
	var BOTTOM_AREA_Y = ITEM_AREA_Y/2|0; 
	
	var BUTTON_BORDER_SIZE = 8 * _scale;
	var BUTTON_ROUND_RADIUD = 2+ 4 * _scale; 

	var COVER_BACKGROUND_COLOR = "black";
	
	var BUTTON_BACKGROUND_BORDER_COLOR = "white";
	var BUTTON_BACKGROUND_COLOR = "#5b0680"; //"#890ee0";
	var BUTTON_BACKGROUND_SHADOW = "gold";
	var BUTTON_BACKGROUND_BORDER_SIZE = 8 * _scale;;
	
	var BUTTON_BORDER_COLOR = "gold";
	var BUTTON_COLOR = "#5d7cff";
	
	var CLOSE_ICON_ACTIVE_COLOR = "#ff5050";
	
	var screenX1 = _stage.canvas.width;
	var screenY1 = _stage.canvas.height;
	
	var titleTextObj, titleWidth, titleHeight;
	var	itemText = [], maxItemTextWidth, itemTextHeight;
	var menuX, menuY;
	var startX, startY;
	
	var coverBackgroundObj, background1Obj, background2Obj, menuButtonObj; 
	var closeIconObj = null;
	var saveKeyStateObj;
	var activeItemBackup = _itemList[0].activeItem; //recover menu active item if press ESC or close 
	
	init();

	function init()
	{
		createText();
		coverParentStage();
		creatBackground();
		createTitle();
		createItemList();
		if(_closeIconEnable) {
			closeIconObj = new closeIconClass(startX+menuX, startY, _stage, _scale, CLOSE_ICON_ACTIVE_COLOR, closeBox, null);
		}

		_stage.enableMouseOver(120);
		_stage.update();
		
		saveKeyStateObj = saveKeyHandler(handleMenuKeyDown);
	}
	
	function coverParentStage()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill(COVER_BACKGROUND_COLOR).drawRect(0, 0, screenX1, screenY1).endFill();
		coverBackgroundObj.alpha = 0.6;
		_stage.addChild(coverBackgroundObj);		
	}
	
	function createText()
	{
		var textLength;
		
		titleTextObj = new createjs.Text(_titleName, 
			"bold " + TITLE_TEXT_SIZE + "px Helvetica",TITLE_TEXT_COLOR);
		titleWidth = titleTextObj.getBounds().width;
		titleHeight = titleTextObj.getBounds().height;
		
		maxItemTextWidth =0;
		for(var i = 1; i < _itemList.length; i++) {
			itemText[i-1] = new createjs.Text(_itemList[i].name, 
				"bold " + ITEM_TEXT_SIZE + "px Helvetica",ITEM_TEXT_COLOR);
			textLength = itemText[i-1].getBounds().width;
			if(maxItemTextWidth < textLength) maxItemTextWidth = textLength;
		}
		maxItemTextWidth += ITEM_TEXT_SIZE;
		menuX = (maxItemTextWidth > titleWidth? maxItemTextWidth: titleWidth) + TITLE_TEXT_SIZE * 2;
		menuY = TITLE_AREA_Y + BOTTOM_AREA_Y + (ITEM_AREA_Y+ITEM_GAP_Y)*(_itemList.length-1); 
		
		startX = (screenX1-menuX)/2|0;
		startY = (screenY1-menuY)/2|0;
	}
	
	function creatBackground()
	{
		background1Obj = new createjs.Shape();
		background1Obj.graphics.beginFill(BUTTON_BACKGROUND_BORDER_COLOR)
			.drawRoundRect(startX, startY, menuX, menuY, 8*_scale).endFill();
		background1Obj.shadow = new createjs.Shadow(BUTTON_BACKGROUND_SHADOW, 3, 3, 5 );

		background2Obj = new createjs.Shape();
		background2Obj.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
			.drawRoundRect(startX+BUTTON_BACKGROUND_BORDER_SIZE, startY+BUTTON_BACKGROUND_BORDER_SIZE, 
						   menuX-BUTTON_BACKGROUND_BORDER_SIZE*2, menuY-BUTTON_BACKGROUND_BORDER_SIZE*2, 8*_scale).endFill();
		_stage.addChild(background1Obj, background2Obj);
	}	
	
	function createTitle()
	{
		titleTextObj.x = startX + (menuX - titleWidth)/2|0;
		titleTextObj.y = startY + (TITLE_AREA_Y - titleHeight)/2|0;
		titleTextObj.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 0, 0, 10 );
		_stage.addChild(titleTextObj);
	}
	
	function createItemList()
	{
		menuButtonObj = []
		for(var i = 0; i < itemText.length; i++) {
			menuButtonObj[i] = new createjs.Container();
			
			//child id = 0
			var border = new createjs.Shape();
			border.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
				.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, 
				maxItemTextWidth+BUTTON_BORDER_SIZE*2, ITEM_AREA_Y+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();
			
			//child id = 1
			var button = new createjs.Shape();
			button.graphics.beginFill(BUTTON_COLOR).drawRoundRect(0, 0, 
				maxItemTextWidth, ITEM_AREA_Y,BUTTON_ROUND_RADIUD).endFill();
			
			//child id = 2
			itemText[i].textAlign = "center";
			itemText[i].x = maxItemTextWidth/2|0;
			itemText[i].y = (ITEM_AREA_Y - itemText[i].getBounds().height)/2|0;
			
			menuButtonObj[i].addChild(border, button,itemText[i]);
			menuButtonObj[i].x = startX+(menuX - maxItemTextWidth)/2|0;
			menuButtonObj[i].y = startY+TITLE_AREA_Y+(ITEM_AREA_Y+ITEM_GAP_Y) * i;
			menuButtonObj[i].myId = i;

			menuButtonObj[i].on('click', buttonClick);
			menuButtonObj[i].on('mouseover', buttonMouseOver);
			menuButtonObj[i].on('mouseout', buttonMouseOut);			
			_stage.addChild(menuButtonObj[i]);
		}
		buttonActive(menuButtonObj[_itemList[0].activeItem]);
	}

	function closeBox()
	{
		 _itemList[0].activeItem = activeItemBackup; //recover menu active item
		restoreKeyHandler(saveKeyStateObj);
		removeAllObj();
		_stage.cursor = 'default';
		_stage.enableMouseOver(0);
		if(_closeCallBack) _closeCallBack(_args);
	}
	
	function removeAllObj()
	{
		_stage.removeChild(coverBackgroundObj, titleTextObj, background1Obj, background2Obj);
		for(var i = 0; i < itemText.length; i++) {
			_stage.removeChild(menuButtonObj[i]);
		}
		if(closeIconObj) _stage.removeChild(closeIconObj);
		_stage.update();
	}
	
	function buttonClick()
	{
		restoreKeyHandler(saveKeyStateObj);
		removeAllObj();
		_stage.cursor = 'default';
		_stage.enableMouseOver(0);
		if(_itemList[_itemList[0].activeItem+1].activeFun) {
			_itemList[_itemList[0].activeItem+1].activeFun(_itemList[0].activeItem, _args);
		}
	}
	
	function buttonActive(buttonObj) 
	{
		var border = buttonObj.getChildAt(0);
		var text = buttonObj.getChildAt(2);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, 
			maxItemTextWidth+BUTTON_BORDER_SIZE*2, ITEM_AREA_Y+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();

		text.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 2, 2, 10 );
	}
	
	function buttonInactive(buttonObj) 
	{
		var border = buttonObj.getChildAt(0);
		var text = buttonObj.getChildAt(2);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, 
			maxItemTextWidth+BUTTON_BORDER_SIZE*2, ITEM_AREA_Y+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();
		
		text.shadow = null;
	}
	
	function buttonMouseOver()
	{
		if(this.myId != _itemList[0].activeItem) {
			buttonInactive(menuButtonObj[_itemList[0].activeItem]);
			buttonActive(this);
			_itemList[0].activeItem = this.myId;
		}
		_stage.cursor = 'pointer';
		_stage.update();
	}
	
	function buttonMouseOut()
	{
		_stage.cursor = 'default';
		_stage.update();
	}
	
	function handleMenuKeyDown(event) 
	{
		if(!event){ event = window.event; } //cross browser issues exist
	
		if(event.shiftKey || event.ctrlKey) return false;

		switch(event.keyCode) {
		case KEYCODE_UP: 
			buttonInactive(menuButtonObj[_itemList[0].activeItem]);
			if(--_itemList[0].activeItem < 0) _itemList[0].activeItem = menuButtonObj.length-1;
			buttonActive(menuButtonObj[_itemList[0].activeItem]);
			_stage.update();
			break;
		case KEYCODE_DOWN: 
			buttonInactive(menuButtonObj[_itemList[0].activeItem]);
			if(++_itemList[0].activeItem > (menuButtonObj.length-1)) _itemList[0].activeItem = 0;
			buttonActive(menuButtonObj[_itemList[0].activeItem]);
			_stage.update();
			break;
		case KEYCODE_ENTER:
			buttonClick();	
			break;	
		case KEYCODE_ESC:
			if(closeIconObj != null) closeBox();
			break;	
		default:
			//debug("keycode = " + code);	
			break;	
		}
		return false;
	}	
}

function mainMenuClose(callbackFun)
{
	if(callbackFun) callbackFun();
}

var playVersionInfo = [
	{ id:1, verData: classicData,  name: gameVersionName[0], info: classicInfo },
	{ id:3, verData: proData,      name: gameVersionName[2], info: proInfo },
	{ id:4, verData: revengeData,  name: gameVersionName[3], info: revengeInfo },
	{ id:5, verData: fanBookData,  name: gameVersionName[4], info: fanBookInfo },
	{ id:2, verData: championData, name: gameVersionName[1], info: championInfo }
];

//var customItemInfo = { id:999, name:" Custom Levels " };
var customItemIdx = -1;
var maxPlayId;

var gameVersionMenuList = [
	{ activeItem: 0 } //game version menu ID
];

function getCustomItemInfo(withLevel)
{
	var customItemName = " Custom Levels ";
	if(withLevel) {
		if (editLevels == 1) {
			return customItemName + "(1 Level)";
		} else if(editLevels > 1) {
			return customItemName + "(" + editLevels + " Levels)";
		}
	}
	return customItemName;
}

function initMenuVariable()
{
	maxPlayId = 0;
	
	for(var i = 0; i < playVersionInfo.length; i++) {
		//ex: { name: "Classic Lode Runner (150 Levels) ", activeFun: subGameMenu },
		gameVersionMenuList.push( 
			{ name: playVersionInfo[i].name + " (" + playVersionInfo[i].verData.length + " Levels) ", 
			  activeFun: subGameMenu 
			}
		);
		if(maxPlayId < playVersionInfo[i].id) maxPlayId = playVersionInfo[i].id;
	}
	var customItemName = getCustomItemInfo(1);
	gameVersionMenuList.push({name: customItemName, activeFun: subEditMenu});
	customItemIdx = gameVersionMenuList.length-1;
}

function getPlayVerData(id) 
{
	for(var i = 0; i < playVersionInfo.length; i++) {
		if(playVersionInfo[i].id == id) return playVersionInfo[i].verData;
	}
	
	error("Error: versionData can not find, id = " + id );
	return playVersionInfo[0].verData;
}

function getPlayVerInfo(id) 
{
	for(var i = 0; i < playVersionInfo.length; i++) {
		if(playVersionInfo[i].id == id) return playVersionInfo[i].info;
	}
	
	error("Error: version info can not find, id = " + id );
	return playVersionInfo[0].info;
}

function defaultLevelData()
{
	return playVersionInfo[0].verData;
}

function menuIdToPlayData(menuId)
{
	if(menuId == playVersionInfo.length) return PLAY_DATA_USERDEF; //user created
	else if (menuId < playVersionInfo.length) return playVersionInfo[menuId].id;
	
	error("design error, menuId =" + menuId );
	
	return playVersionInfo[0].id;
}

var playDataNameUserDef = "Custom Levels";
function playDataToTitleName(verId)
{
	if(verId == PLAY_DATA_USERDEF) return playDataNameUserDef;
	
	for(var i = 0; i < playVersionInfo.length; i++) {
		if(playVersionInfo[i].id == verId) return playVersionInfo[i].name;
	}
	
	error("design error, id =" + verId );
	return "Unknown";
}

function mainMenu(callbackFun)
{	
	gameVersionMenuList[customItemIdx].name = getCustomItemInfo(1);
	menuDialog(" Select Game Version ", gameVersionMenuList, mainStage, tileScale, 0, mainMenuClose, callbackFun);
}

function gameVersionMenu(id, callbackFun)
{
	gameVersionMenuList[customItemIdx].name = getCustomItemInfo(1);
	menuDialog(" Select Game Version ", gameVersionMenuList, mainStage, tileScale, 1, mainMenuClose, callbackFun);
}

//set main menu id from playData
function playData2GameVersionMenuId()
{
	if(playData == PLAY_DATA_USERDEF) {
		gameVersionMenuList[0].activeItem = playVersionInfo.length;
		return gameVersionMenuList[0].activeItem;
	} else {
		for(var i = 0; i < playVersionInfo.length; i++) {
			if(playVersionInfo[i].id == playData) {
				gameVersionMenuList[0].activeItem = i;
				return i;
			}
		}
	}
	
	error("design error, value =" + playData );
	gameVersionMenuList[0].activeItem = 0;
	return 0;
}
	
//=========================================
// Add menu item if the item is not exist 
//=========================================
function addMenuItem(menuList, addItemObj, addPosition) 
{
	if(addPosition >= 0) { 
		menuList.splice(addPosition, 0, addItemObj); //add item to position 
	} else {
		menuList.push(addItemObj); //append 
	}
}

function gameMenu(callbackFun)
{
	var titleName;
	
	var demoItemObj =        { name: " Demo Mode ",  activeFun: demoPlay };
	var editPlayItemObj =    { name: " Play Mode ",  activeFun: editPlay };
	var editBackupItemObj =  { name: " Backup ",     activeFun: backupDialog };
	var	editRestoreItemObj = { name: " Restore ",    activeFun: restoreDialog };

	var gameMenuList = [
		{ activeItem: 0 },
		{ name: " Challenge Mode ", activeFun: classicPlay },
		{ name: " Training Mode ",  activeFun: modernPlay }, 
//		{ name: " Demo Mode ",      activeFun: demoPlay }, 
		{ name: " Change Game Version ",      activeFun: gameVersionMenu } 
	];

	var editMenuList = [
		{ activeItem: 0 },  //[0]
		{ name: " Edit Mode",            activeFun: editEdit }, //[1]
//		{ name: " Play ",                activeFun: editPlay }, 
		{ name: " Change Game Version ", activeFun: gameVersionMenu } //[2]    
	];	
	
	switch(true) {
	case (gameVersionMenuList[0].activeItem == playVersionInfo.length):
		titleName = getCustomItemInfo(0);
		if(playMode == PLAY_EDIT || playMode == PLAY_TEST) {
			editMenuList[0].activeItem = 0; //edit.edit
		} else 
			editMenuList[0].activeItem = 1; // edit.play

		addMenuItem(editMenuList,  editRestoreItemObj, 2);
			
		if(editLevels > 0) { 
			addMenuItem(editMenuList,  editBackupItemObj, 2);
			addMenuItem(editMenuList,  editPlayItemObj, 2);
		}
		menuDialog(titleName, editMenuList, mainStage, tileScale, 1, mainMenuClose, callbackFun);	
		return;
	case (gameVersionMenuList[0].activeItem < playVersionInfo.length):
		titleName = playVersionInfo[gameVersionMenuList[0].activeItem].name;
		if(playerDemoData.length > 0) addMenuItem(gameMenuList,  demoItemObj, 3);
		break
	default:
		error("design error, value =" + gameVersionMenuList[0].activeItem );
		return;	
	}
	
	//set active menu id for play mode
	switch(playMode) {
	case PLAY_CLASSIC:
		gameMenuList[0].activeItem = 0;	
		break;	
	case PLAY_MODERN:
	case PLAY_DEMO_ONCE:
		gameMenuList[0].activeItem = 1;	
		break;	
	case PLAY_DEMO:
		gameMenuList[0].activeItem = 2;	
		break;	
	}

	menuDialog("  " + titleName + "  ", gameMenuList, mainStage, tileScale, 1, mainMenuClose, callbackFun);
	return;
}

function subGameMenu(id, callbackFun)	
{
	gameVersionMenuList[0].activeItem = id;

	playData = menuIdToPlayData(gameVersionMenuList[0].activeItem);
	
	//================================================
	// get demo data for current playData from server
	//------------------------------------------------
	if(demoPlayData != playData) initDemoData();
	//================================================
	
	classicPlay(id, callbackFun); //set as classic mode
}

function subEditMenu(id, callbackFun)	
{
	gameVersionMenuList[0].activeItem = id;
	//menuDialog("  Your Own Levels  ", editMenuList, mainStage, tileScale, 1, mainMenu, callbackFun);
	editEdit(id, callbackFun); //set as edit mode 
}

function classicPlay(id, callbackFun)
{
	if(callbackFun != null) callbackFun();
	if(playMode == PLAY_EDIT) canvasReSize();
	playMode = PLAY_CLASSIC;

	soundStop(soundDig);
	soundStop(soundFall);
	disableStageClickEvent();
	document.onkeydown = handleKeyDown;
	setLastPlayMode();
	selectIconObj.disable(1);
	demoIconObj.disable(1);
	pasteIconObj.disable();
	initShowDataMsg();
	startGame();
}

function modernPlay(id, callbackFun)
{
	if(callbackFun != null) callbackFun();
	if(playMode == PLAY_EDIT) canvasReSize();
	playMode = PLAY_MODERN;
	
	soundStop(soundDig);
	soundStop(soundFall);
	disableStageClickEvent();
	document.onkeydown = handleKeyDown;
	pasteIconObj.disable();
	setLastPlayMode();
	initShowDataMsg();
	startGame();
}

function demoPlay(id, callbackFun)
{
	if(callbackFun != null) callbackFun();
	if(playMode == PLAY_EDIT) canvasReSize();
	
	playMode = PLAY_DEMO;
	
	soundStop(soundDig);
	soundStop(soundFall);
	demoSoundOff = 1; //always sound off when start demo 
	anyKeyStopDemo();
	initShowDataMsg();
	demoIconObj.disable(1);
	pasteIconObj.disable();
	startGame();
}

function editPlay(id, callbackFun)
{
	if(callbackFun != null) callbackFun();
	if(playMode == PLAY_EDIT) canvasReSize();
	playMode = PLAY_MODERN;
	playData = PLAY_DATA_USERDEF;
	
	disableStageClickEvent();
	document.onkeydown = handleKeyDown;
	setLastPlayMode();
	//selectIconObj.disable(1);
	demoIconObj.disable(1);
	pasteIconObj.disable();
	if (id < 0) { //id < 0 ==> means call from restore custom levels
		initShowDataMsg(0); //no tips message
		setTimeout(function() { showTipsText("RESTORE COMPLETE", 2500);}, 50);
		startGame(1); // no cycle
	} else {
		initShowDataMsg();
		startGame();
	}
}

function editEdit(id, callbackFun)
{
	if(callbackFun != null) callbackFun();
	disableStageClickEvent();
	demoIconObj.disable(1);
	pasteIconObj.disable();
	if (id < 0) { //id < 0 ==> means call from restore custom levels
		initShowDataMsg(0);
		setTimeout(function() { showTipsText("RESTORE COMPLETE", 2500);}, 50);
	} else {
		initShowDataMsg();
	}
	startEditMode();
}

function helpMenu(callbackFun)
{
	var id = 0;
	if(playMode == PLAY_EDIT) id = 1;
	
	if(playMode == PLAY_DEMO || playMode == PLAY_DEMO_ONCE) {
		infoObj.showInfo(demoHelp, callbackFun, null);	
	} else {
		helpObj.showHelp(id, callbackFun, tileScale, null);
	}
}

function activeSelectMenu(activeFun, postFun)
{
	if(playMode == PLAY_EDIT) {
		var editLevel = testLevelInfo.level> editLevels?0:testLevelInfo.level;
		
		selectDialog(playDataNameUserDef, checkBitmap, editLevelData, editLevel, screenX1, screenY1, 
				mainStage, tileScale, activeFun, editSelectMenuClose, postFun)		
	} else {

		var titleName = playDataToTitleName(playData);
		
		if(playMode == PLAY_DEMO) titleName = "DEMO: " + titleName;
		
		selectDialog(titleName, checkBitmap, levelData, curLevel, screenX1, screenY1, 
				mainStage, tileScale, activeFun, null, postFun)		
	}
}		

// if _level < 0 means "share level" pass dialog
function levelPassDialog(_level, _getGold, _guardDead, _time, _hiScore, 
						  _button1Bitmap, _button2Bitmap, _button3Bitmap,
						  _stage, _scale, _callBack)
{
	var TITLE_TEXT_SIZE = 48 * _scale;
	var ITEM_TEXT_SIZE = 40 * _scale;
	var GOLD_X = 32 * _scale;
	
	var TITLE_TEXT_COLOR = "white";
	var TITLE_SHADOW_COLOR = "yellow";
	
	var ITEM_TEXT_COLOR = "white";
	var TIME_NAME_COLOR = "#fad292";
	var SCORE_NAME_COLOR = TIME_NAME_COLOR;
	var HISCORE_NAME_COLOR = TIME_NAME_COLOR;
	
	var TEXT_GAP_Y = ITEM_TEXT_SIZE * 2/3 | 0;

	var COVER_BACKGROUND_COLOR = "black";	

	var BACKGROUND_BORDER_COLOR = "white"
	var BACKGROUND_COLOR = "#5b0680";
	var BACKGROUND_SHADOW = "gold";
	var BACKGROUND_BORDER_SIZE = 8 * _scale;

	var BUTTON_BORDER_SIZE = 8 * _scale;
	var BUTTON_ROUND_RADIUD = 2+ 4 * _scale; 
	var BUTTON_BORDER_COLOR = "gold";
	var BUTTON_COLOR = "#eeffff"
	var BUTTON_BACKGROUND_COLOR = BACKGROUND_COLOR;

	var buttonX = _button1Bitmap.getBounds().width * _scale,
	   	buttonY = _button1Bitmap.getBounds().height * _scale;
	
	var titleTextObj, goldTextObj, guardTextObj, timeTextObj;
	var goldObj, guardObj, timeNameObj;
	var scoreNameObj, scoreTextObj, 
		hiScoreNameObj, hiScoreTextObj;
	
	var coverBackgroundObj, background1Obj, background2Obj, menuButtonObj;
	var screenX1 = _stage.canvas.width;
	var screenY1 = _stage.canvas.height;
	
	var menuX, menuY, startX, startY
	var timeNameX, maxTextSize;
	var menuButton = [];
	var bitmap = [ _button1Bitmap, _button2Bitmap, _button3Bitmap ];

	var centerX, xOffset, yOffset;

	var levelScore = 0, goldPoint = 0, guardPoint = 0, timePoint = MAX_TIME_COUNT;
	var countTime = 85, onePointValue = 100, countAddValue = 47;
	
	init();
	
	function init()
	{
		initContent();
		coverParentStage();
		creatBackground();
		createContent();
		_stage.enableMouseOver(120);
		_stage.update();
		setTimeout(function() { goldScoreCounting(1);}, 200);
	}
	
	function initContent()
	{
		titleTextObj = new createjs.Text("LEVEL " + ("00"+_level).slice(-3), 
										 "bold "+TITLE_TEXT_SIZE + "px Helvetica",TITLE_TEXT_COLOR);
		titleTextObj.shadow = new createjs.Shadow(TITLE_SHADOW_COLOR, 0, 0, 10 );
		
		goldTextObj = new createjs.Text("000", ITEM_TEXT_SIZE + "px Helvetica",ITEM_TEXT_COLOR);
		
		guardTextObj = new createjs.Text("000", ITEM_TEXT_SIZE + "px Helvetica",ITEM_TEXT_COLOR);
		
		timeTextObj = new createjs.Text(("00"+MAX_TIME_COUNT).slice(-3), ITEM_TEXT_SIZE + "px Helvetica",ITEM_TEXT_COLOR);
		
		timeNameObj = new createjs.Text("TIME", "bold " + ITEM_TEXT_SIZE + "px Helvetica", TIME_NAME_COLOR);
		
		scoreNameObj = new createjs.Text("SCORE", "bold " + ITEM_TEXT_SIZE + "px Helvetica", SCORE_NAME_COLOR);
		scoreTextObj = new createjs.Text("000000", ITEM_TEXT_SIZE + "px Helvetica",ITEM_TEXT_COLOR);
		
		hiScoreNameObj = new createjs.Text("HI-SCORE", "bold " + ITEM_TEXT_SIZE + "px Helvetica", HISCORE_NAME_COLOR);
		hiScoreTextObj = new createjs.Text( ("00000"+_hiScore).slice(-6), 
										ITEM_TEXT_SIZE + "px Helvetica",ITEM_TEXT_COLOR);
		
		timeNameX = timeNameObj.getBounds().width;
		maxTextSize = hiScoreNameObj.getBounds().width + hiScoreTextObj.getBounds().width;
		menuX = maxTextSize + TITLE_TEXT_SIZE * 5;
		menuY = TITLE_TEXT_SIZE * 2 + (ITEM_TEXT_SIZE+TEXT_GAP_Y) * 5 + buttonY*3;

		startX = (screenX1-menuX)/2|0;
		startY = (screenY1-menuY)/2|0;
	}
	
	function coverParentStage()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill(COVER_BACKGROUND_COLOR).drawRect(0, 0, screenX1, screenY1).endFill();
		coverBackgroundObj.alpha = 0.6;
		_stage.addChild(coverBackgroundObj);		
	}
	
	function creatBackground()
	{
		background1Obj = new createjs.Shape();
		background1Obj.graphics.beginFill(BACKGROUND_BORDER_COLOR)
			.drawRoundRect(startX, startY, menuX, menuY, 8*_scale).endFill();
		background1Obj.shadow = new createjs.Shadow(BACKGROUND_SHADOW, 3, 3, 5 );

		background2Obj = new createjs.Shape();
		background2Obj.graphics.beginFill(BACKGROUND_COLOR)
			.drawRoundRect(startX+BACKGROUND_BORDER_SIZE, startY+BACKGROUND_BORDER_SIZE, 
						   menuX-BACKGROUND_BORDER_SIZE*2, menuY-BACKGROUND_BORDER_SIZE*2, 8*_scale).endFill();
		_stage.addChild(background1Obj, background2Obj);
	}
	
	function createContent()
	{
		titleTextObj.x = startX + (menuX - titleTextObj.getBounds().width)/2|0;
		titleTextObj.y = startY + TITLE_TEXT_SIZE;
		_stage.addChild(titleTextObj);
		
		var centerGap = 8*_scale;
		
		centerX = startX+ menuX/2|0;
		xOffset = centerX;
		yOffset = startY+TITLE_TEXT_SIZE*3;
		
		goldObj = drawText(xOffset, yOffset-TEXT_GAP_Y/3, "@", _stage); //@: gold
		var xOffset = centerX - GOLD_X  - centerGap;
		goldObj[0].x = xOffset;
		goldObj[0].alpha = 0;
		
		goldTextObj.x = centerX + centerGap;
		goldTextObj.y = yOffset;
		goldTextObj.alpha = 0;
		_stage.addChild(goldTextObj);
		
		yOffset += (ITEM_TEXT_SIZE + TEXT_GAP_Y);
		guardObj = drawText(xOffset, yOffset-TEXT_GAP_Y/3, "#", _stage); //#: trap (陷井)
		guardObj[0].alpha = 0;
		
		guardTextObj.x =centerX + centerGap;
		guardTextObj.y = yOffset;
		guardTextObj.alpha = 0;
		_stage.addChild(guardTextObj);
		
		var xOffset = centerX - timeNameX - centerGap;
		yOffset += (ITEM_TEXT_SIZE + TEXT_GAP_Y);
		timeNameObj.x = xOffset;
		timeNameObj.y = yOffset;
		timeNameObj.alpha = 0;
		
		timeTextObj.x = centerX + centerGap;
		timeTextObj.y = yOffset;
		timeTextObj.alpha = 0;
		_stage.addChild(timeNameObj, timeTextObj);
		
		xOffset = centerX - scoreNameObj.getBounds().width - centerGap;
		yOffset += (ITEM_TEXT_SIZE + TEXT_GAP_Y);
		scoreNameObj.x = xOffset;
		scoreNameObj.y = yOffset;
		scoreTextObj.x = centerX + centerGap; 
		scoreTextObj.y = yOffset;
		_stage.addChild(scoreNameObj, scoreTextObj);
		
		xOffset = centerX - hiScoreNameObj.getBounds().width - centerGap;
		yOffset += (ITEM_TEXT_SIZE+ TEXT_GAP_Y/3);
		hiScoreNameObj.x = xOffset;
		hiScoreNameObj.y = yOffset;
		hiScoreTextObj.x = centerX + centerGap; 
		hiScoreTextObj.y = yOffset;
		_stage.addChild(hiScoreNameObj, hiScoreTextObj);
		
		yOffset += (ITEM_TEXT_SIZE + buttonY); //yOffset for menu button
	}
 	
	function updateHiScore()
	{
		if(_hiScore < levelScore) {
			hiScoreTextObj.text = ("00000" + (levelScore)).slice(-6);
			hiScoreTextObj.color = "gold";
		}		
	}
	
	function goldScoreCounting(firstTime)
	{
		var endCount = 0;
		if(firstTime) {
			goldObj[0].alpha = 1;
			goldTextObj.alpha = 1;
			soundPlay("scoreBell");
			if(_getGold <= 0) {
				endCount = 1;
			} else {
				setTimeout(function() { goldScoreCounting(0); }, countTime );
			}
		} else {
			var addCount = countAddValue, endCount = 0;		   
			if(goldPoint + addCount >= _getGold) {
				endCount = 1;
				addCount = _getGold - goldPoint;
			}
			soundPlay("scoreCount");
			goldPoint += addCount;
			levelScore += (addCount * onePointValue);
			goldTextObj.text = ("00" + (goldPoint)).slice(-3);
			scoreTextObj.text = ("00000" + (levelScore)).slice(-6);
			updateHiScore();
			
			if(!endCount) {
				setTimeout(function() { goldScoreCounting(0); }, countTime );
			}
		}

		if(endCount) {
			setTimeout(function() { guardScoreCounting(1); }, countTime*4);
		}
		_stage.update();
	}
	
 	function guardScoreCounting(firstTime)
	{
		var endCount = 0;
		if(firstTime) {
			guardObj[0].alpha = 1;
			guardTextObj.alpha = 1;
			soundPlay("scoreBell");
			if(_guardDead <= 0) {
				endCount = 1;
			} else {
				setTimeout(function() { guardScoreCounting(0); }, countTime );
			}
		} else {
			var addCount = countAddValue, endCount = 0;		   
			if(guardPoint + addCount >= _guardDead) {
				endCount = 1;
				addCount = _guardDead - guardPoint;
			}
			soundPlay("scoreCount");
			guardPoint += addCount;
			levelScore += (addCount * onePointValue);
			guardTextObj.text = ("00" + (guardPoint)).slice(-3);
			scoreTextObj.text = ("00000" + (levelScore)).slice(-6);
			updateHiScore();

			if(!endCount) {
				setTimeout(function() { guardScoreCounting(0); }, countTime );
			}
		}

		if(endCount) {
			setTimeout(function() { timeScoreCounting(1); }, countTime*4 );
		}
		_stage.update();
	}
	
 	function timeScoreCounting(firstTime)
	{
		var endCount = 0;
		if(firstTime) {
			timeNameObj.alpha = 1;
			timeTextObj.alpha = 1;
			soundPlay("scoreBell");
			if(_time >= MAX_TIME_COUNT) {
				endCount = 1;
			} else {
				setTimeout(function() { timeScoreCounting(0); }, countTime );
			}
		} else {
			var addCount = countAddValue, endCount = 0;		   
			if(timePoint - addCount <= _time) {
				endCount = 1;
				addCount = timePoint - _time;
			}
			soundPlay("scoreCount");
			timePoint -= addCount;
			levelScore += (addCount * onePointValue);
			timeTextObj.text = ("00" + (timePoint)).slice(-3);
			scoreTextObj.text = ("00000" + (levelScore)).slice(-6);
			updateHiScore();

			if(!endCount) {
				setTimeout(function() { timeScoreCounting(0); }, countTime );
			}
		}
		
		if(endCount) {
			soundPlay("scoreEnding");
			setTimeout(function() { createButton(); }, 100 );
		}
		_stage.update();
	}
	
	function createButton()
	{
		var border, button;

		for(var i = 0; i < 3; i++ ) {
			menuButton[i] = new createjs.Container();
			border = new createjs.Shape();	
			button = new createjs.Shape();		
		
			xOffset = centerX - buttonX*3 + (buttonX *5/2*i)|0;
	
			//id = 0
			border.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
				.drawRoundRect(-BUTTON_BORDER_SIZE*2, -BUTTON_BORDER_SIZE*2, 
							   buttonX+4*BUTTON_BORDER_SIZE, buttonY+4*BUTTON_BORDER_SIZE,BUTTON_ROUND_RADIUD).endFill();
			//id = 1
			button.graphics.beginFill(BUTTON_COLOR)
				.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, 
							   buttonX+BUTTON_BORDER_SIZE*2, buttonY+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();

			//id = 2
			bitmap[i].setTransform(0, 0, _scale, _scale);
			
			menuButton[i].x = xOffset;
			menuButton[i].y = yOffset;
			menuButton[i].addChild(border, button, bitmap[i]);
			
			menuButton[i].on('click', buttonClick);
			menuButton[i].on('mouseover', buttonMouseOver);
			menuButton[i].on('mouseout', buttonMouseOut);	
			menuButton[i].myId = i;
			_stage.addChild(menuButton[i]);

		}
		_stage.update();
	}
	
	function buttonClick()
	{
		removeAllObj();
		_stage.cursor = 'default';
		_stage.enableMouseOver(0);
		if(_callBack) _callBack(this.myId);
		//debug(this.myId);
	}
	
	function buttonMouseOver()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE*2, -BUTTON_BORDER_SIZE*2, 
						   buttonX+BUTTON_BORDER_SIZE*4, buttonY+BUTTON_BORDER_SIZE*4,BUTTON_ROUND_RADIUD).endFill();

		_stage.cursor = 'pointer';
		_stage.update();
	}
	
	function buttonMouseOut()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE*2, -BUTTON_BORDER_SIZE*2, 
						   buttonX+BUTTON_BORDER_SIZE*4, buttonY+BUTTON_BORDER_SIZE*4,BUTTON_ROUND_RADIUD).endFill();
		
		_stage.cursor = 'default';
		_stage.update();
	}	
	
	function removeAllObj()
	{
		_stage.removeChild(coverBackgroundObj, background1Obj, background2Obj, titleTextObj);
		
		_stage.removeChild(goldObj[0], goldTextObj);
		_stage.removeChild(guardObj[0], guardTextObj);
		_stage.removeChild(timeNameObj, timeTextObj);
		_stage.removeChild(scoreNameObj, scoreTextObj);
		_stage.removeChild(hiScoreNameObj, hiScoreTextObj);
		
		for(var i = 0; i < 3; i++) {
			_stage.removeChild(menuButton[i]);
		}
		_stage.update();
	}
	
}

function yesNoDialog(_txtMsg, _yesBitmap, _noBitmap, _stage, _scale, _callBack)
{
	var TEXT_MSG_SIZE = 48 * _scale;
	var TEXT_GAP_Y = TEXT_MSG_SIZE * 3/4 | 0;
	
	var TEXT_MSG_COLOR = "white";
	var TEXT_MSG_SHADOW_COLOR = "yellow";

	var COVER_BACKGROUND_COLOR = "black";	
	
	var BACKGROUND_BORDER_COLOR = "white"
	var BACKGROUND_COLOR = "#5b0680";
	var BACKGROUND_SHADOW = "gold";
	var BACKGROUND_BORDER_SIZE = 8 * _scale;
	
	var BUTTON_BORDER_SIZE = 8 * _scale;
	var BUTTON_ROUND_RADIUD = 2+ 4 * _scale; 
	var BUTTON_BORDER_COLOR = "gold";
	var BUTTON_COLOR = "#eeffff"
	var BUTTON_BACKGROUND_COLOR = BACKGROUND_COLOR;

	var saveStateObj;
	var textObj;
	
	var coverBackgroundObj, background1Obj, background2Obj;
	var screenX1 = _stage.canvas.width;
	var screenY1 = _stage.canvas.height;
	
	var buttonX = _yesBitmap.getBounds().width * _scale,
	   	buttonY = _yesBitmap.getBounds().height * _scale;
	
	var menuX, menuY, startX, startY
	var menuButton = [];
	var bitmap = [ _yesBitmap, _noBitmap ];
	
	init();
	
	function init()
	{
		saveKeyState();
		initTxtMsg();
		coverParentStage();
		creatBackground();
		createTxtMsg();
		createButton();
		
		_stage.enableMouseOver(60);
		_stage.update();
	}
	
	function saveKeyState()
	{
		saveStateObj = saveKeyHandler(noKeyDown);
	}
	
	function restoreKeyState()
	{
		restoreKeyHandler(saveStateObj);
	}
	
	function initTxtMsg()
	{
		var maxTextSize = 0, tmpTextSize;
		
		textObj = [];
		for(var i = 0; i < _txtMsg.length; i++) {
			textObj[i] = new createjs.Text(_txtMsg[i], "bold " + TEXT_MSG_SIZE + "px Helvetica",TEXT_MSG_COLOR);
			if( i == 0 ) //only first line message has shadow 
				textObj[i].shadow = new createjs.Shadow(TEXT_MSG_SHADOW_COLOR, 0, 0, 10 );
			tmpTextSize = textObj[i].getBounds().width;
			if(maxTextSize < tmpTextSize) maxTextSize = tmpTextSize;
		}
		if(maxTextSize < buttonX * 4) maxTextSize = buttonX * 4;
		
		menuY = (TEXT_GAP_Y + TEXT_MSG_SIZE) * _txtMsg.length + TEXT_MSG_SIZE * 2 + buttonY;
		menuX =	maxTextSize + TEXT_MSG_SIZE * 2;
		
		startX = (screenX1-menuX)/2|0;
		startY = (screenY1-menuY)/2|0;
	}
	
	function coverParentStage()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill(COVER_BACKGROUND_COLOR).drawRect(0, 0, screenX1, screenY1).endFill();
		coverBackgroundObj.alpha = 0.6;
		_stage.addChild(coverBackgroundObj);		
	}	

	function creatBackground()
	{
		background1Obj = new createjs.Shape();
		background1Obj.graphics.beginFill(BACKGROUND_BORDER_COLOR)
			.drawRoundRect(startX, startY, menuX, menuY, 8*_scale).endFill();
		background1Obj.shadow = new createjs.Shadow(BACKGROUND_SHADOW, 3, 3, 5 );

		background2Obj = new createjs.Shape();
		background2Obj.graphics.beginFill(BACKGROUND_COLOR)
			.drawRoundRect(startX+BACKGROUND_BORDER_SIZE, startY+BACKGROUND_BORDER_SIZE, 
						   menuX-BACKGROUND_BORDER_SIZE*2, menuY-BACKGROUND_BORDER_SIZE*2, 8*_scale).endFill();
		_stage.addChild(background1Obj, background2Obj);
	}	
	
	function createTxtMsg()
	{
		for(var i = 0; i < textObj.length; i++) {
			textObj[i].x = startX + (menuX - textObj[i].getBounds().width)/2|0
			textObj[i].y = startY + (TEXT_GAP_Y + TEXT_MSG_SIZE) * i + TEXT_GAP_Y;
			_stage.addChild(textObj[i]);
		}
	}
	
	function createButton()
	{
		var border, button;
		var centerX = startX+ menuX/2|0;

		for(var i = 0; i < 2; i++ ) {
			menuButton[i] = new createjs.Container();
			border = new createjs.Shape();	
			button = new createjs.Shape();		
		
			//id = 0
			border.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
				.drawRoundRect(-BUTTON_BORDER_SIZE*2, -BUTTON_BORDER_SIZE*2, 
							   buttonX+4*BUTTON_BORDER_SIZE, buttonY+4*BUTTON_BORDER_SIZE,BUTTON_ROUND_RADIUD).endFill();
			//id = 1
			button.graphics.beginFill(BUTTON_COLOR)
				.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, 
							   buttonX+BUTTON_BORDER_SIZE*2, buttonY+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();

			//id = 2
			bitmap[i].setTransform(0, 0, _scale, _scale);
			
			menuButton[i].x = centerX - buttonX*2.5 + (buttonX*4*i);
			menuButton[i].y = textObj[textObj.length-1].y + TEXT_MSG_SIZE*2;
			menuButton[i].addChild(border, button, bitmap[i]);
			
			menuButton[i].on('click', buttonClick);
			menuButton[i].on('mouseover', buttonMouseOver);
			menuButton[i].on('mouseout', buttonMouseOut);	
			menuButton[i].myId = i;
			_stage.addChild(menuButton[i]);

		}
		_stage.update();
	}
	
	function buttonClick()
	{
		restoreKeyState();
		removeAllObj();
		_stage.cursor = 'default';
		_stage.enableMouseOver(0);
		if(_callBack) _callBack(!this.myId+0);
		//debug(this.myId);
	}
	
	function buttonMouseOver()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE*2, -BUTTON_BORDER_SIZE*2, 
						   buttonX+BUTTON_BORDER_SIZE*4, buttonY+BUTTON_BORDER_SIZE*4,BUTTON_ROUND_RADIUD).endFill();

		_stage.cursor = 'pointer';
		_stage.update();
	}
	
	function buttonMouseOut()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE*2, -BUTTON_BORDER_SIZE*2, 
						   buttonX+BUTTON_BORDER_SIZE*4, buttonY+BUTTON_BORDER_SIZE*4,BUTTON_ROUND_RADIUD).endFill();
		
		_stage.cursor = 'default';
		_stage.update();
	}	
	
	function removeAllObj()
	{
		_stage.removeChild(coverBackgroundObj, background1Obj, background2Obj);
		
		for(var i = 0; i < textObj.length; i++) {
			_stage.removeChild(textObj[i]);
		}
		
		for(var i = 0; i < menuButton.length; i++) {
			_stage.removeChild(menuButton[i]);
		}
		
		_stage.update();
	}	
}


function backupDialog(id, _callBackFun)
{
	var _stage = mainStage;
	var _scale = tileScale;
	
	var TITLE_TEXT_SIZE = 48 * _scale;
	var MSG_TEXT_SIZE = 40 * _scale;
	var BUTTON_TEXT_SIZE = 40 * _scale;
	
	var BUTTON_BORDER_SIZE = 8 * _scale;
	var BUTTON_ROUND_RADIUD = 2+ 4 * _scale; 

	var COVER_BACKGROUND_COLOR = "black";

	var BUTTON_BACKGROUND_BORDER_COLOR = "white";
	var BUTTON_BACKGROUND_SHADOW = "gold";
	var BUTTON_BACKGROUND_COLOR = "#5b0680"; //"#890ee0";
	var BUTTON_BACKGROUND_BORDER_SIZE = 8 * _scale;;
	
	var TITLE_TEXT_COLOR = "white";
	var TITLE_TEXT_SHADOW_COLOR = "gold";
	
	var MSG_TEXT_COLOR = "white";

	var BUTTON_TEXT_COLOR = "white"
	var BUTTON_TEXT_SHADOW_COLOR = "gold";

	var BUTTON_BORDER0_COLOR = "white"; //"#890ee0";
	var BUTTON_COLOR = "#5d7cff";
	var BUTTON_BORDER1_COLOR = "gold";

	var CLOSE_ICON_ACTIVE_COLOR = "#ff5050";

	var MSG_AREA_Y = MSG_TEXT_SIZE * 3/2 | 0;
	var MSG_GAP_Y = MSG_TEXT_SIZE * 2/3 | 0;

	var coverBackgroundObj;
	var background1Obj, background2Obj;
	var titleTextObj, msgTextObj;
	
	var buttonTextObj, buttonObj;
	
	var closeIconObj;
	var saveKeyStateObj;

	var buttonSizeX;
	var menuX, menuY;
	var startX, startY;

	var screenX1 = _stage.canvas.width;
	var screenY1 = _stage.canvas.height;

	init();
	
	function init()
	{
		saveKeyState();
		coverParentStage();
		initContent();
		creatBackground();
		createContent();
		closeIconObj = new closeIconClass(startX+menuX, startY, _stage, _scale, CLOSE_ICON_ACTIVE_COLOR, closeDialog, null);
		
		_stage.enableMouseOver(120);
		_stage.update();
	}
	
	function saveKeyState()
	{
		saveKeyStateObj = saveKeyHandler(handleEscKeyDown);
	}
	
	function restoreKeyState()
	{
		restoreKeyHandler(saveKeyStateObj);
	}
	
	function coverParentStage()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill(COVER_BACKGROUND_COLOR).drawRect(0, 0, screenX1, screenY1).endFill();
		coverBackgroundObj.alpha = 0.6;
		_stage.addChild(coverBackgroundObj);		
	}
	
	function initContent()
	{
		titleTextObj = new createjs.Text("   Backup   ", "bold "+TITLE_TEXT_SIZE + "px Helvetica",TITLE_TEXT_COLOR);
		titleTextObj.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 0, 0, 10 );
		
		msgTextObj = new createjs.Text("Back up all custom levels to a file", "bold " + MSG_TEXT_SIZE + "px Helvetica", MSG_TEXT_COLOR);
		
		buttonTextObj = new createjs.Text("Backup", "bold " + BUTTON_TEXT_SIZE + "px Helvetica", BUTTON_TEXT_COLOR);

		buttonSizeX = buttonTextObj.getBounds().width + BUTTON_TEXT_SIZE; 
		menuX = msgTextObj.getBounds().width + TITLE_TEXT_SIZE * 2;
		menuY = TITLE_TEXT_SIZE * 2.5 + (MSG_TEXT_SIZE *2) + MSG_GAP_Y * 4|0;

		startX = (screenX1-menuX)/2|0;
		startY = (screenY1-menuY)/2|0;
	}
	
	function creatBackground()
	{
		background1Obj = new createjs.Shape();
		background1Obj.graphics.beginFill(BUTTON_BACKGROUND_BORDER_COLOR)
			.drawRoundRect(startX, startY, menuX, menuY, 8*_scale).endFill();
		background1Obj.shadow = new createjs.Shadow(BUTTON_BACKGROUND_SHADOW, 3, 3, 5 );

		background2Obj = new createjs.Shape();
		background2Obj.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
			.drawRoundRect(startX+BUTTON_BACKGROUND_BORDER_SIZE, startY+BUTTON_BACKGROUND_BORDER_SIZE, 
						   menuX-BUTTON_BACKGROUND_BORDER_SIZE*2, menuY-BUTTON_BACKGROUND_BORDER_SIZE*2, 8*_scale).endFill();
		_stage.addChild(background1Obj, background2Obj);
	}
	
	function createContent()
	{
		titleTextObj.x = startX + (menuX - titleTextObj.getBounds().width)/2|0;
		titleTextObj.y = startY + TITLE_TEXT_SIZE*3/4;
		_stage.addChild(titleTextObj);
		
		var yOffset = (TITLE_TEXT_SIZE*2.2)|0;
		
		msgTextObj.x = startX + (menuX - msgTextObj.getBounds().width)/2|0;
		msgTextObj.y = startY + yOffset;
		_stage.addChild(msgTextObj);

		buttonObj = new createjs.Container();
		
		//child id = 0
		var border = new createjs.Shape();
		border.graphics.beginFill(BUTTON_BORDER0_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE/2, -BUTTON_BORDER_SIZE/2, buttonSizeX+BUTTON_BORDER_SIZE, MSG_AREA_Y+BUTTON_BORDER_SIZE ,BUTTON_ROUND_RADIUD).endFill();
			
		//child id = 1
		var button = new createjs.Shape();
		button.graphics.beginFill(BUTTON_COLOR).drawRoundRect(0, 0, buttonSizeX, MSG_AREA_Y,BUTTON_ROUND_RADIUD).endFill();
			
		//child id = 2
		buttonTextObj.textAlign = "center";
		buttonTextObj.x = buttonSizeX/2|0;
		buttonTextObj.y = (MSG_AREA_Y - msgTextObj.getBounds().height)/2|0;
		
		yOffset += (MSG_GAP_Y*2 + TITLE_TEXT_SIZE/2)|0;
		buttonObj.addChild(border, button, buttonTextObj);
		buttonObj.x = startX + (menuX - buttonSizeX)/2|0;
		buttonObj.y = startY+ yOffset;

		buttonObj.on('click', buttonClick);
		buttonObj.on('mouseover', buttonMouseOver);
		buttonObj.on('mouseout', buttonMouseOut);			
		_stage.addChild(buttonObj);
	}
	
	function buttonClick()
	{
		var downloadfileName = downloadCustomLevelData();
		restoreKeyState();
		removeAllObj();
		_stage.cursor = 'default';
		_stage.enableMouseOver(0);
		if(_callBackFun) _callBackFun();
		
		setTimeout(function() { showTipsText("BACKUP IS COMPLETE", 2500);}, 50);
	}

	function removeAllObj()
	{
		_stage.removeChild(coverBackgroundObj, background1Obj, background2Obj);
		_stage.removeChild(titleTextObj, msgTextObj, buttonObj);
		_stage.removeChild(closeIconObj);
		_stage.update();
	}	
	
	function buttonMouseOver()
	{
		var border = buttonObj.getChildAt(0);

		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER1_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, buttonSizeX+BUTTON_BORDER_SIZE*2, MSG_AREA_Y+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();

		buttonTextObj.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 2, 2, 10 );
		_stage.cursor = 'pointer';
		_stage.update();
	}
	
	function buttonMouseOut()
	{
		var border = buttonObj.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER0_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE/2, -BUTTON_BORDER_SIZE/2, buttonSizeX+BUTTON_BORDER_SIZE, MSG_AREA_Y+BUTTON_BORDER_SIZE, BUTTON_ROUND_RADIUD).endFill();
		
		buttonTextObj.shadow = null;
		_stage.cursor = 'default';
		_stage.update();
	}	
	
	function closeDialog()
	{
		restoreKeyState();
		removeAllObj();
		_stage.cursor = 'default';
		_stage.enableMouseOver(0);
		if(_callBackFun) _callBackFun();
	}

	function getBackupFileName(d)
	{
		//var d = new Date();

		//LR-05.10.21.141804.lrwg
		return 'LR'+ ('0'+(d.getMonth()+1)).slice(-2) + ('0'+d.getDate()).slice(-2) + ('0'+d.getFullYear()).slice(-2) + '-'+ ('0'+d.getHours()).slice(-2) + ('0'+d.getMinutes()).slice(-2) + ('0'+d.getSeconds()).slice(-2) + '-' + ('00'+editLevels).slice(-3) + '.lrwg';
	}
	
	function downloadCustomLevelData()
	{
		var date = new Date();
		var fileName = getBackupFileName(date);
		
		download(fileName, backupCustomLevelData(date));
		
		return fileName;
		
		function download(filename, text) {
			//reference: https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
			var element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
			element.setAttribute('download', filename);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		}
		
	}
	
	function handleEscKeyDown(event) 
	{
		if(!event){ event = window.event; } //cross browser issues exist
	
		if(event.shiftKey || event.ctrlKey) return false;

		switch(event.keyCode) {
		case KEYCODE_ESC:
			closeDialog();
			break;	
		default:
			//debug("keycode = " + code);	
			break;	
		}
		return false;
	}	
	
}

function restoreDialog(id, _callBackFun)
{
	//LODE RUNNER WEB GAME.Wed May 12 2021 19:04:16 GMT+0800 (台北標準時間).PLAYER.XXXXX\n

	var _scale = tileScale;

	var MAX_DISPLAY_FILENAME_LEN = 26; 

	var TITLE_TEXT_SIZE = 48 * _scale;
	var MSG_TEXT_SIZE = 40 * _scale;
	var BUTTON_TEXT_SIZE = 40 * _scale;
	var FILEINFO_TEXT_SIZE = 36 * _scale;
	var MAPNO_TEXT_SIZE = 20 * _scale;
	var TOTALLEVEL_TEXT_SIZE = 28 * _scale;
	
	var BUTTON_BORDER_SIZE = 8 * _scale;
	var BUTTON_ROUND_RADIUD = 2+ 4 * _scale; 

	var COVER_BACKGROUND_COLOR = "black";

	var BUTTON_BACKGROUND_BORDER_COLOR = "white";
	var BUTTON_BACKGROUND_SHADOW = "gold";
	var BUTTON_BACKGROUND_COLOR = "#5b0680"; //"#890ee0";
	var BUTTON_BACKGROUND_BORDER_SIZE = 8 * _scale;
	
	var PREVIEWMAP_BUTTON_COLOR = "white";
	var PREVIEWMAP_BUTTON_BORDER_SIZE = 4 * _scale;
	var PREVIEWMAP_BUTTON_GRAY_ALPHA = 0.2;
	
	var TITLE_TEXT_COLOR = "white";
	var TITLE_TEXT_SHADOW_COLOR = "gold";
	
	var MSG_TEXT_COLOR = "white";

	var WRONG_TEXT_COLOR = "#f54B42";
	var WRONG_TEXT_OUTLINE_COLOR = "#FFFFB0";
	var WRONG_TEXT_SHADOW_COLOR = "#404040";
	
	var BUTTON_TEXT_COLOR = "white"
	var BUTTON_TEXT_SHADOW_COLOR = "gold";

	var BUTTON_BORDER0_COLOR = "white";
	var BUTTON_COLOR = "#5d7cff";
	var BUTTON_BORDER1_COLOR = "gold";
	
	var OPENBUTTON_BACKGROUND_COLOR = BUTTON_BACKGROUND_COLOR,
		OPENBUTTON_COLOR = "#FFFFFF",
		OPENBUTTON_BORDER_COLOR = "gold";
	
	var OPENBUTTON_BORDER_SIZE = 8 * _scale, 
		OPENBUTTON_ROUND_RADIUD = 2+ 4 * _scale;
	
	var FILEINFO_TEXT_COLOR = "#EEEEEE";

	var CLOSE_ICON_ACTIVE_COLOR = "#ff5050";

	var MSG_AREA_Y = MSG_TEXT_SIZE * 3/2 | 0;
	var MSG_GAP_Y = MSG_TEXT_SIZE * 2/3 | 0;

	var PREVIEW_MAP_SCALE = tileScale * 0.13;
	var previewMapX = NO_OF_TILES_X*BASE_TILE_X*PREVIEW_MAP_SCALE,
		previewMapY = NO_OF_TILES_Y*BASE_TILE_Y*PREVIEW_MAP_SCALE;
	var previewMapGapX = 16*tileScale, 
		previewMapPerLine = 5;
	
	var coverBackgroundObj;

	var restoreCanvas;
	var dialogStage;
	
	var background1Obj, background2Obj;
	var titleTextObj, msgTextObj;
	var fileTextObj, fileNameTextObj, fileNameBackgroundObj;
	var openFolderButtonObj;
	var wrongText1Obj, wrongText2Obj;
	var fileInfoTextObj;
	var buttonTextObj, buttonObj;
	var fileNameObj = null;
	
	var closeIconObj;
	var saveKeyStateObj;

	var maxFileNameSize, totalFileNameSizeX, totalPreviewMapSizeX;
	var previewNoYOffset, previewMapYOffset;
	
	var buttonSizeX;
	var menuX, menuY;
	var fileNameX, fileNameY;
	var wrongMsgEnable = 0;

	var openFolderButtonScale = 0.9;
	var openFolderButtonX = openFolderBitmap.getBounds().width * tileScale * openFolderButtonScale,
		openFolderButtonY = openFolderBitmap.getBounds().height * tileScale * openFolderButtonScale;
	
	var nextButtonX = nextBitmap.getBounds().width * tileScale,
		nextButtonY = nextBitmap.getBounds().height * tileScale;
	
	var inputFileElement = null;

	var tmpCustomLevels;
	var levelMapNoObj = levelMapObjs = [];
	var totalLevelTextObj = null;
	var nextMapButtonObj, prevMapButtonObj;
	var previewvMapFirst = previewMapLast = -1;
	
	init();
	
	function init()
	{
		saveKeyState();
		coverParentStage();
		createInputFileElement();
		initContent();
		createCanvas();
		createDialogStage();
		
		creatBackground();
		createContent();
		closeIconObj = new closeIconClass(menuX, 0, dialogStage, _scale, CLOSE_ICON_ACTIVE_COLOR, closeDialog, null);
	}
	
	function saveKeyState()
	{
		saveKeyStateObj = saveKeyHandler(handleEscKeyDown);
	}
	
	function restoreKeyState()
	{
		restoreKeyHandler(saveKeyStateObj);
	}
	
	function coverParentStage()
	{
		coverBackgroundObj = new createjs.Shape();
		coverBackgroundObj.graphics.beginFill(COVER_BACKGROUND_COLOR).drawRect(0, 0, mainStage.canvas.width, mainStage.canvas.height).endFill();
		coverBackgroundObj.alpha = 0.6;
		mainStage.addChild(coverBackgroundObj); // mainStage
		mainStage.update();
	}

	function createInputFileElement()
	{
		inputFileElement = document.createElement('input'); 
		inputFileElement.type = 'file';
		inputFileElement.accept = '.lrwg';
		inputFileElement.style.display = 'none';
		document.body.appendChild(inputFileElement);
		inputFileElement.addEventListener('change', readRestoreFile);
	}
	
	function initContent()
	{
		titleTextObj = new createjs.Text("Restore", "bold "+TITLE_TEXT_SIZE + "px Helvetica",TITLE_TEXT_COLOR);
		titleTextObj.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 0, 0, 10 );
		
		msgTextObj = new createjs.Text("Restore custom levels from backup files", "bold " + MSG_TEXT_SIZE + "px Helvetica", MSG_TEXT_COLOR);

		fileTextObj = new createjs.Text("File:", "bold " + MSG_TEXT_SIZE + "px Helvetica", MSG_TEXT_COLOR);

		wrongText1Obj = new createjs.Text("Wrong file format !", "bold " + MSG_TEXT_SIZE + "px Helvetica", WRONG_TEXT_OUTLINE_COLOR);
		wrongText1Obj.outline = _scale;
		wrongText2Obj = new createjs.Text("Wrong file format !", "bold " + MSG_TEXT_SIZE + "px Helvetica", WRONG_TEXT_COLOR);
		wrongText2Obj.shadow = new createjs.Shadow(WRONG_TEXT_SHADOW_COLOR, _scale, _scale*2, 1);
		
		//get maximun file name text size (width)
		var tmpObj = new createjs.Text("X", "bold "+ MSG_TEXT_SIZE + "px Courier New", MSG_TEXT_COLOR);
		maxFileNameSize = tmpObj.getBounds().width * MAX_DISPLAY_FILENAME_LEN;
		
		fileInfoTextObj = new createjs.Text("Preview","bold " + FILEINFO_TEXT_SIZE + "px Helvetica", FILEINFO_TEXT_COLOR);
		
		totalFileNameSizeX = fileTextObj.getBounds().width + maxFileNameSize + (tileWScale*2/3) + openFolderButtonX;
		totalPreviewMapSizeX = (previewMapX+previewMapGapX) * previewMapPerLine + previewMapGapX;
		
		menuX = TITLE_TEXT_SIZE * 2 + (totalFileNameSizeX > totalPreviewMapSizeX?totalFileNameSizeX:totalPreviewMapSizeX) |0; 
		menuY = (TITLE_TEXT_SIZE * 2.5 + (MSG_TEXT_SIZE+MSG_GAP_Y)*2) + ((MSG_TEXT_SIZE+MSG_GAP_Y)*2+ previewMapY + TITLE_TEXT_SIZE) + (MSG_GAP_Y*3 + BUTTON_TEXT_SIZE) |0;

		buttonTextObj = new createjs.Text("   Restore   ", "bold " + BUTTON_TEXT_SIZE + "px Helvetica", BUTTON_TEXT_COLOR);

		buttonSizeX = buttonTextObj.getBounds().width + BUTTON_TEXT_SIZE; 
	}
	
	function createCanvas()
	{
		restoreCanvas = document.createElement('canvas');
		restoreCanvas.id = "restoreDialog";
		restoreCanvas.width  = menuX+10; //10 px for shadow
		restoreCanvas.height = menuY+10; //10 px for shadow
	
		var left = (screenX1 - restoreCanvas.width)/2|0,
		    top  = (screenY1 - restoreCanvas.height)/2|0;
		
		restoreCanvas.style.left = left + "px";
		restoreCanvas.style.top =  top + "px";
		restoreCanvas.style.position = "absolute";
		document.body.appendChild(restoreCanvas);
	}
	
	function createDialogStage()
	{
		dialogStage = new createjs.Stage(restoreCanvas);
		dialogStage.enableMouseOver(60);
		//createjs.Ticker.setFPS(20);
		createjs.Ticker.addEventListener("tick", dialogStage);
	}	

	function creatBackground()
	{
		background1Obj = new createjs.Shape();
		background1Obj.graphics.beginFill(BUTTON_BACKGROUND_BORDER_COLOR)
			.drawRoundRect(0, 0, menuX, menuY, 8*_scale).endFill();
		background1Obj.shadow = new createjs.Shadow(BUTTON_BACKGROUND_SHADOW, 3, 3, 5 );

		background2Obj = new createjs.Shape();
		background2Obj.graphics.beginFill(BUTTON_BACKGROUND_COLOR)
			.drawRoundRect(BUTTON_BACKGROUND_BORDER_SIZE, BUTTON_BACKGROUND_BORDER_SIZE, 
						   menuX-BUTTON_BACKGROUND_BORDER_SIZE*2, menuY-BUTTON_BACKGROUND_BORDER_SIZE*2, 8*_scale).endFill();
		dialogStage.addChild(background1Obj, background2Obj);
	}

	function createContent()
	{
		titleTextObj.x = (menuX - titleTextObj.getBounds().width)/2|0;
		titleTextObj.y = TITLE_TEXT_SIZE*3/4|0;
		dialogStage.addChild(titleTextObj);
		
		var yOffset = TITLE_TEXT_SIZE*2.2|0;
		
		msgTextObj.x = (menuX - msgTextObj.getBounds().width)/2|0;
		msgTextObj.y = yOffset;
		dialogStage.addChild(msgTextObj);
		
		yOffset += (MSG_TEXT_SIZE+MSG_GAP_Y)|0;
		fileTextObj.x = (menuX - totalFileNameSizeX)/2|0;
		fileTextObj.y = yOffset;
		dialogStage.addChild(fileTextObj);
		
		fileNameX = fileTextObj.x + fileTextObj.getBounds().width + (tileWScale/3)|0;
		fileNameY = yOffset;
		
		fileNameBackgroundObj = new createjs.Shape();
		fileNameBackgroundObj.graphics.beginFill("white").drawRect(
			fileNameX, fileNameY, maxFileNameSize, MSG_TEXT_SIZE).endFill();
		fileNameBackgroundObj.alpha = 0.2;
		
		dialogStage.addChild(fileNameBackgroundObj);
		
		addOpenButton(fileNameX+maxFileNameSize+(tileWScale*1/3)|0, fileNameY+(MSG_TEXT_SIZE-openFolderButtonY)/2|0);
		
		yOffset += (MSG_TEXT_SIZE+MSG_GAP_Y)|0; // fileInfo Box yOffset

		var fileInfoBackgroundObj = new createjs.Shape();
		var fileInfoTextBarObj = new createjs.Shape(); 
		var fileInfoBoxSizeY = (MSG_TEXT_SIZE+MSG_GAP_Y)*2 + previewMapY + MSG_TEXT_SIZE | 0;
		var fileInfoBoxYOffset = yOffset;

		fileInfoBackgroundObj.graphics.beginFill("white").drawRoundRect(TITLE_TEXT_SIZE, yOffset, menuX-TITLE_TEXT_SIZE*2, fileInfoBoxSizeY, 16*_scale).endFill();
		fileInfoBackgroundObj.alpha = 0.5;
		dialogStage.addChild(fileInfoBackgroundObj);
		
		fileInfoTextObj.x = (menuX-fileInfoTextObj.getBounds().width)/2; 
		fileInfoTextObj.y = yOffset+ (MSG_GAP_Y/2)|0;  // prevew text yOffset
		dialogStage.addChild(fileInfoTextObj);
		
		previewNoYOffset = fileInfoTextObj.y + (MSG_TEXT_SIZE+MSG_GAP_Y/2)|0;
		previewMapYOffset = previewNoYOffset + MSG_GAP_Y;

		//set Wrong file format x,y 
		wrongText1Obj.x = wrongText2Obj.x = (menuX-wrongText1Obj.getBounds().width)/2|0;
		wrongText1Obj.y = wrongText2Obj.y = fileInfoBoxYOffset + (fileInfoBoxSizeY- wrongText1Obj.getBounds().height)/2;  //Y center of preview box Y shift title
		
		createPreviewMapButton();
		
		// create Restore button
		buttonObj = new createjs.Container();
		
		//child id = 0
		var border = new createjs.Shape();
		border.graphics.beginFill(BUTTON_BORDER0_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE/2, -BUTTON_BORDER_SIZE/2, buttonSizeX+BUTTON_BORDER_SIZE, MSG_AREA_Y+BUTTON_BORDER_SIZE ,BUTTON_ROUND_RADIUD).endFill();
			
		//child id = 1
		var button = new createjs.Shape();
		button.graphics.beginFill(BUTTON_COLOR).drawRoundRect(0, 0, buttonSizeX, MSG_AREA_Y,BUTTON_ROUND_RADIUD).endFill();
			
		//child id = 2
		buttonTextObj.textAlign = "center";
		buttonTextObj.x = buttonSizeX/2|0;
		buttonTextObj.y = (MSG_AREA_Y - msgTextObj.getBounds().height)/2|0;
		
		buttonObj.addChild(border, button, buttonTextObj);
		buttonObj.x = (menuX - buttonSizeX)/2|0;
		buttonObj.y = fileInfoBoxYOffset + fileInfoBoxSizeY + MSG_GAP_Y|0;

		buttonObj.on('click', buttonClick);
		buttonObj.on('mouseover', buttonMouseOver);
		buttonObj.on('mouseout', buttonMouseOut);	
		buttonObj.alpha = 0;
		dialogStage.addChild(buttonObj);
	}

	function createPreviewMapButton()
	{
		var nextMapX = nextMapBitmap.getBounds().width*_scale, 
			nextMapY = nextMapBitmap.getBounds().height*_scale*2/3;
		var borderNext = new createjs.Shape();
		var borderPrev = new createjs.Shape();

		nextMapButtonObj = new createjs.Container();
		prevMapButtonObj = new createjs.Container();
		
		//Preview Map Next button
		borderNext.graphics.beginFill(PREVIEWMAP_BUTTON_COLOR)
			.drawRoundRect(-PREVIEWMAP_BUTTON_BORDER_SIZE/2|0, -PREVIEWMAP_BUTTON_BORDER_SIZE/2|0, nextMapX+PREVIEWMAP_BUTTON_BORDER_SIZE, nextMapY+PREVIEWMAP_BUTTON_BORDER_SIZE, BUTTON_ROUND_RADIUD).endFill();
		borderNext.alpha =PREVIEWMAP_BUTTON_GRAY_ALPHA;
		nextMapBitmap.setTransform(0, 0, _scale, _scale*2/3);
		nextMapButtonObj.x = TITLE_TEXT_SIZE + (previewMapGapX + previewMapX)*previewMapPerLine - nextMapX-PREVIEWMAP_BUTTON_BORDER_SIZE/2;
		nextMapButtonObj.y = previewMapYOffset + previewMapY + previewMapGapX/2;
		nextMapButtonObj.myId = 1;
		nextMapButtonObj.addChild(borderNext, nextMapBitmap);
		nextMapButtonObj.on('click', PreviewButtonClick);
		nextMapButtonObj.on('mouseover', PreviewButtonMouseOver);
		nextMapButtonObj.on('mouseout', PreviewButtonMouseOut);		
		nextMapButtonObj.alpha = 0;
		dialogStage.addChild(nextMapButtonObj);
		
		//Preview Map Prev Button
		borderPrev.graphics.beginFill(PREVIEWMAP_BUTTON_COLOR)
			.drawRoundRect(-PREVIEWMAP_BUTTON_BORDER_SIZE/2|0, -PREVIEWMAP_BUTTON_BORDER_SIZE/2|0, nextMapX+PREVIEWMAP_BUTTON_BORDER_SIZE, nextMapY+PREVIEWMAP_BUTTON_BORDER_SIZE, BUTTON_ROUND_RADIUD).endFill();
		borderPrev.alpha =PREVIEWMAP_BUTTON_GRAY_ALPHA;
		prevMapBitmap.setTransform(0, 0, _scale, _scale*2/3);
		prevMapButtonObj.x = TITLE_TEXT_SIZE + previewMapGapX + PREVIEWMAP_BUTTON_BORDER_SIZE/2;
		prevMapButtonObj.y = previewMapYOffset + previewMapY + previewMapGapX/2;
		prevMapButtonObj.myId = 2;
		prevMapButtonObj.addChild(borderPrev, prevMapBitmap);
		prevMapButtonObj.on('click', PreviewButtonClick);
		prevMapButtonObj.on('mouseover', PreviewButtonMouseOver);
		prevMapButtonObj.on('mouseout', PreviewButtonMouseOut);		
		prevMapButtonObj.alpha = 0;
		dialogStage.addChild(prevMapButtonObj);
		
		function PreviewButtonClick()
		{
			var myId = this.myId;
			var totalLevels = tmpCustomLevels.length;
			switch(myId) {
				case 1: //next page
					previewMapFirst += previewMapPerLine;
					previewMapLast += previewMapPerLine;
					if (previewMapLast >= totalLevels) previewMapLast = totalLevels-1;
					break;
				case 2: //previous page
					previewMapFirst -= previewMapPerLine;
					previewMapLast = previewMapFirst + previewMapPerLine-1;
					if (previewMapLast >= totalLevels) previewMapLast = totalLevels-1;
					break;
				default:
					error("Error: Design Error myId = " + myId );	
					return;
			}
			removePreviewMap();
			displayPreviewMap(myId);
		}

		function PreviewButtonMouseOver()
		{
			var backgroundObj = this.getChildAt(0);

			backgroundObj.alpha = 1;	
			dialogStage.cursor = 'pointer';
			dialogStage.update();			
		}

		function PreviewButtonMouseOut()
		{
			var backgroundObj = this.getChildAt(0);

			backgroundObj.alpha = PREVIEWMAP_BUTTON_GRAY_ALPHA;	
			dialogStage.cursor = 'default';
			dialogStage.update();			
		}
		
	}
	
	function removePreviewObj()
	{
		if (wrongMsgEnable) {
			dialogStage.removeChild(wrongText1Obj, wrongText2Obj);
			//dialogStage.removeChild(wrongText2Obj);
			wrongMsgEnable = 0;
		}
		removePreviewMap();
		disableMapButton();
		dialogStage.removeChild(totalLevelTextObj);
		dialogStage.update();
	}
	
	function readRestoreFile(e)
	{
		var file;
		var readFiler; 
		var fileSize, totalLevels, fileChecksum;

		removePreviewObj();
		buttonObj.alpha = 0; //disable restore button (hide)

		if (e.target.files.length <= 0) {
			displayFileName("");
			return;
		}
		file = e.target.files[0];
		displayFileName(file.name);

		// (1) First only read header for check file format
		readHeaderInfo(); 

		//reference: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
		function readHeaderInfo()
		{
			var readHeader = new FileReader();
			var blob = file.slice(0, 150); //read 0 - 150 bytes

			readHeader.onloadend = function(e) {
				if (e.target.readyState == FileReader.DONE) {
					checkHeaderInfo(e.target.result);
				}
			};

			readHeader.readAsText(blob);
		}

		function checkHeaderInfo(headerInfo)
		{
			//LODE RUNNER WEB GAME.Sun May 16 2021 11:12:20 GMT+0800 (台北標準時間).SISS.MTAyMDAwNDA5YTg1NExS
			var maxFileSize = 150 + NO_OF_TILES_X * NO_OF_TILES_Y * 256;
			var newLinePos = headerInfo.indexOf('\n');
			if(newLinePos < 0) {
				displayAlertMsg("wrong header");
				return;
			}

			var lastDotPos = headerInfo.substr(0, newLinePos).lastIndexOf('.');
			if (lastDotPos < 0 || newLinePos - lastDotPos != 21) {
				displayAlertMsg("wrong fileInfo");
				return;
			} else {
				try {
					var fileInfo = atob(headerInfo.substr(lastDotPos+1, newLinePos-lastDotPos-1));
				} catch(e) {
					// wrong base64 
					displayAlertMsg("wrong base64");
					return;
				}
				var verInfo = fileInfo.charAt(0);
				if ( verInfo != '1' && verInfo != '2') {
					displayAlertMsg("wrong fileInfo.version (" + verInfo + ")");
					return;
				}
				if (headerInfo.indexOf(LRWG_FILE_START_INFO) != 0) {
					displayAlertMsg("wrong startInfo");
					return;
				}
				totalLevels = parseInt(fileInfo.substr(1,2), 16);
				fileSize = parseInt(fileInfo.substr(3,6), 16);
				fileChecksum = parseInt(fileInfo.substr(9,4), 16);
				if (totalLevels > MAX_EDIT_LEVEL || totalLevels <= 0) {
					displayAlertMsg("wrong edit levels (" + totalLevels + ")");
					return;
				}
				if (file.size > maxFileSize) {
					displayAlertMsg("Error: file size too large (" + file.size + ")");
					return;
				}
				if (fileSize != file.size) {
					displayAlertMsg("wrong file size");
					return;
				}
				
				// (2) Read all file
				readAllFile = new FileReader();

				readAllFile.onloadend = function(e) {
					if (e.target.readyState == FileReader.DONE) {
						readCustomLevels(e.target.result, verInfo);
					}
				}
				readAllFile.readAsText(file);
			}
		}

		function readCustomLevels(fileData, verInfo)
		{
			var firstNewLinePos = fileData.indexOf('\n');
			var dataChecksum = 0;
			var levelData = fileData.substr(firstNewLinePos); //skip header 

			for(var i = 0; i < levelData.length; i++) {
				dataChecksum += levelData.charCodeAt(i);
			}
			if (fileChecksum != (dataChecksum & 0xFFFF)) {
				displayAlertMsg("wrong file checksum");
				return;
			}

			tmpCustomLevels = [];
			
			if (verInfo == '1') {
				// v1: level format
				// -------------------------------
				// level map format:
				// 
				//    +----- startLevelPos
				// 	  V
				// \n tile * NO_OF_TILES_X 
				// \n tile * NO_OF_TILES_X
				// ....
				// \n tile * NO_OF_TILES_X
				// \n checksum
				// ------------------------------
				var oneLevelSize = (NO_OF_TILES_X+1) * NO_OF_TILES_Y+2;  // +2: checksum + '\n'
				
				if(levelData.length != totalLevels * oneLevelSize) {
					displayAlertMsg("wrong levels data size (1)");
					return;
				}

				for(var curLevel = 0; curLevel < totalLevels; curLevel++) {
					var startLevelPos = curLevel * oneLevelSize + 1; // +1: skip first '\n'
					var curLevelMap = '';
					for(var tileY = 0; tileY < NO_OF_TILES_Y; tileY++) {
						// (startLevelPos+1), +1 : skip \n
						curLevelMap += levelData.substr(startLevelPos+tileY*(NO_OF_TILES_X+1), NO_OF_TILES_X);
					}
					var checksum = levelData.charAt(startLevelPos+oneLevelSize-2);
					var levelChecksum = getShareChecksum(curLevelMap);
					if (checksum != levelChecksum) {
						displayAlertMsg("wrong level checksum (" + (curLevel+1) + ")");
						return;
					}
					tmpCustomLevels.push(curLevelMap);
				}
			} else {
				// v2: level format
				// -----------------------------
				//  \n zipLevelData
				//  \n zipLevelData
				//   .......
				//  \n zipLevelData
				// -----------------------------
				var startLevelPos = 1; // begin from pos = 1
				var nextNewLinePos;
				var zipLevelData, curLevelMap;
				for(var curLevel = 0; curLevel < totalLevels; curLevel++) {
					nextNewLinePos = levelData.indexOf('\n', startLevelPos);
					if (nextNewLinePos < 0) {
						displayAlertMsg("wrong level data @" + (curLevel+1));
						return;
					}
					curLevelMap = unzipLevelMap(levelData.substr(startLevelPos, nextNewLinePos-startLevelPos));
					if (!curLevelMap) {
						displayAlertMsg("wrong ziplevel data @" + (curLevel+1));
						return;
					}
					tmpCustomLevels.push(curLevelMap);
					startLevelPos = nextNewLinePos+1;
				}
				if (levelData.length != startLevelPos) {
					displayAlertMsg("wrong levels data size (2)");
					return;
				}
			}
			
			// SUCCESS 	
			displayFileInfo();
			buttonObj.alpha = 1; //enable restore button
		}

		function displayAlertMsg(errMsg)
		{
			debug(errMsg);
			wrongMsgEnable = 1;
			dialogStage.addChild(wrongText1Obj, wrongText2Obj);
			dialogStage.update();
		}
	}
	
	function displayFileName(fileName)
	{
		if (fileNameObj) {
			dialogStage.removeChild(fileNameObj);
			fileNameObj = null;
		}
		if (fileName.length <= 0) { 
			dialogStage.update();
			return;
		}
		
		if (stringDisplayWidth(fileName) > MAX_DISPLAY_FILENAME_LEN) {
			fileName = cutFileName(fileName);
		}
		fileNameObj = new createjs.Text(fileName, "bold " + MSG_TEXT_SIZE + "px Helvetica", MSG_TEXT_COLOR);
		
		if(fileNameObj.getBounds().width > maxFileNameSize) {
			fileNameObj = new createjs.Text(fileName, "bold " + MSG_TEXT_SIZE + "px Courier New", MSG_TEXT_COLOR);
		}
		
		fileNameObj.x = fileNameX;
		fileNameObj.y = fileNameY;
		dialogStage.addChild(fileNameObj);
		dialogStage.update();
		
		function stringDisplayWidth(str) 
		{
			// 0x00-0xFF assume 1 char others assume 2 chars 	
			//reference: https://blog.typeart.cc/JavaScript計算含中英文字的字串長度/
			return str.replace(/[^\x00-\xff]/g,"xx").length;          
		}
		
		function cutFileName(str)
		{
			var oneSideSize = (MAX_DISPLAY_FILENAME_LEN - 3)/2|0;
			var leftName = '', rightName = '';
			
			for(var i = 0, width=0; width < oneSideSize; i++, width++) {
				var charCode = str.charCodeAt(i);
				if (charCode <= 0xFF) {
					leftName += str.charAt(i);
				} else {
					if(++width < oneSideSize) {
						leftName += str.charAt(i);
					} else {
						break;
					}
				}
			}

			for(var i = str.length-1, width=0; width < oneSideSize; i--, width++) {
				var charCode = str.charCodeAt(i);
				if (charCode <= 0xFF) {
					rightName = str.charAt(i) + rightName;
				} else {
					if(++width < oneSideSize) {
						rightName = str.charAt(i) + rightName;
					} else {
						break;
					}
				}
			}
			return leftName + "...." + rightName;
		}
	}
	
	function addOpenButton(xOffset, yOffset)
	{
		openFolderButtonObj = new createjs.Container();
		border = new createjs.Shape();	
		button = new createjs.Shape();

		//id = 0
		border.graphics.beginFill(OPENBUTTON_BACKGROUND_COLOR)
			.drawRoundRect(-OPENBUTTON_BORDER_SIZE, -OPENBUTTON_BORDER_SIZE, openFolderButtonX+OPENBUTTON_BORDER_SIZE*2, openFolderButtonY+OPENBUTTON_BORDER_SIZE*2, OPENBUTTON_ROUND_RADIUD).endFill();
		//id = 1
		button.graphics.beginFill(OPENBUTTON_COLOR)
			.drawRect(-OPENBUTTON_BORDER_SIZE/3, -OPENBUTTON_BORDER_SIZE/3, openFolderButtonX+OPENBUTTON_BORDER_SIZE*2/3, openFolderButtonY+OPENBUTTON_BORDER_SIZE*2/3).endFill();
		button.alpha = 0.9;

		//id = 2
		openFolderBitmap.setTransform(0, 0, _scale*openFolderButtonScale, _scale*openFolderButtonScale);

		openFolderButtonObj.x = xOffset;
		openFolderButtonObj.y = yOffset;
		openFolderButtonObj.addChild(border, button, openFolderBitmap);

		openFolderButtonObj.on('click', openButtonClick);
		openFolderButtonObj.on('mouseover', openButtonMouseOver);
		openFolderButtonObj.on('mouseout', openButtonMouseOut);	
		dialogStage.addChild(openFolderButtonObj);
		
		function openButtonClick()
		{
			inputFileElement.click();
			openButtonMouseOut();
		}
		
		function openButtonMouseOver()
		{
			var border = openFolderButtonObj.getChildAt(0);

			border.graphics.clear();
			border.graphics.beginFill(OPENBUTTON_BORDER_COLOR)
				.drawRoundRect(-OPENBUTTON_BORDER_SIZE, -OPENBUTTON_BORDER_SIZE, 
							   openFolderButtonX+OPENBUTTON_BORDER_SIZE*2, openFolderButtonY+OPENBUTTON_BORDER_SIZE*2, OPENBUTTON_ROUND_RADIUD).endFill();

			dialogStage.cursor = 'pointer';
			dialogStage.update();
		}	

		function openButtonMouseOut()
		{
			var border = openFolderButtonObj.getChildAt(0);

			border.graphics.clear();
			border.graphics.beginFill(OPENBUTTON_BACKGROUND_COLOR)
				.drawRoundRect(-OPENBUTTON_BORDER_SIZE, -OPENBUTTON_BORDER_SIZE, 
							   openFolderButtonX+OPENBUTTON_BORDER_SIZE*2, openFolderButtonY+OPENBUTTON_BORDER_SIZE*2, OPENBUTTON_ROUND_RADIUD).endFill();

			dialogStage.cursor = 'default';
			dialogStage.update();
		}		

	}
	
	function removePreviewMap()
	{
		for(var i=0 ; i < levelMapObjs.length; i++) {
			dialogStage.removeChild(levelMapObjs[i]);
		}

		for(var i=0 ; i < levelMapNoObj.length; i++) {
			dialogStage.removeChild(levelMapNoObj[i]);
		}
	}
	
	function disableMapButton()
	{
		prevMapButtonObj.alpha = 0; //disable next map button (hide)
		nextMapButtonObj.alpha = 0; //disable prev map button (hide)
	}

	function displayPreviewMap(myId=0)
	{
		var borderSize = _scale < 1?1:_scale;
		var scaleX = scaleY = PREVIEW_MAP_SCALE;
		
		levelMapObjs = [];
		levelMapNoObj = [];
		for(var level=previewMapFirst, i=0; level <= previewMapLast; level++, i++) {
			var levelMap = new createjs.Container();
			var border = new createjs.Shape();
			var background = new createjs.Shape();
			var mapOffsetX = TITLE_TEXT_SIZE + previewMapGapX + (previewMapX+previewMapGapX) * i;
			
			levelMapNoObj[i] = new createjs.Text(("00"+(level+1)).slice(-3), "bold " + MAPNO_TEXT_SIZE + "px Helvetica", "black");
			levelMapNoObj[i].x = mapOffsetX;
			levelMapNoObj[i].y = previewNoYOffset;
			levelMapNoObj[i].alpha = 0.6;
			dialogStage.addChild(levelMapNoObj[i]);
			
			border.graphics.beginFill("white")
			      .drawRoundRect(-borderSize, -borderSize, previewMapX+2*borderSize, previewMapY+2*borderSize, borderSize);
			background.graphics.beginFill("black").drawRect(0, 0, previewMapX, previewMapY);
			
			levelMap.addChild(border, background, level2Bitmap(tmpCustomLevels[level], scaleX, scaleY));
			levelMapObjs[i] = levelMap;
			levelMapObjs[i].x = mapOffsetX;
			levelMapObjs[i].y = previewMapYOffset|0;
			dialogStage.addChild(levelMapObjs[i]);
		}
		
		if (previewMapFirst <= 0) {
			prevMapButtonObj.alpha = 0; //disable
		} else prevMapButtonObj.alpha = 1; //enable

		if (previewMapLast+1 >= tmpCustomLevels.length) {
			nextMapButtonObj.alpha = 0; //disable
		} else nextMapButtonObj.alpha = 1; //enable
		dialogStage.update();
	}

	function displayFileInfo()
	{
		var totalLevels = tmpCustomLevels.length;
		var levelText =  totalLevels > 1? " Levels": " Level";

		previewMapFirst = 0;
		previewMapLast = previewMapPerLine-1;
		if(previewMapLast+1 >= totalLevels) previewMapLast = totalLevels-1;
		displayPreviewMap();
		
		totalLevelTextObj = new createjs.Text("Total: " + tmpCustomLevels.length + levelText, "bold " + TOTALLEVEL_TEXT_SIZE + "px Helvetica", "black");
		totalLevelTextObj.x = (menuX-totalLevelTextObj.getBounds().width)/2|0;
		totalLevelTextObj.y = previewMapYOffset + previewMapY + previewMapGapX*2;
		totalLevelTextObj.alpha = 0.6;
		dialogStage.addChild(totalLevelTextObj);
		
		dialogStage.update();
	}

	function level2Bitmap(levelMap, scaleX, scaleY)
	{
		var container = new createjs.Container();	
		var guardCount = 0, runner = 0;
		var bitmap;

		//--------------------------------------------
		// Parser map from right-bottom to left-top
		// for drop guards if too manys	
		//--------------------------------------------
		var index = NO_OF_TILES_Y * NO_OF_TILES_X - 1;
		for(var y = NO_OF_TILES_Y-1; y >= 0; y--) {
			for(var x = NO_OF_TILES_X-1; x >= 0; x--) {
				var id = levelMap.charAt(index--);		

				var curTile;	
				switch(id) {
				default:		
				case ' ': //empty
					continue;
				case '#': //Normal Brick
					curTile = getThemeBitmap("brick");
					break;	
				case '@': //Solid Brick
					curTile = getThemeBitmap("solid");
					break;	
				case 'H': //Ladder
					curTile = getThemeBitmap("ladder");
					break;	
				case '-': //Line of rope
					curTile = getThemeBitmap("rope");
					break;	
				case 'X': //False brick
					curTile = getThemeBitmap("brick");
					break;
				case 'S': //Ladder appears at end of level
					continue;
				case '$': //Gold chest
					curTile = getThemeBitmap("gold");
					break;	
				case '0': //Guard
					if(++guardCount > MAX_NEW_GUARD) { 
						continue;  //too many guard , set this tile as empty
					}
					curTile = new createjs.Sprite(guardData, "runLeft");
					curTile.stop();	
					break;	
				case '&': //Player
					if(++runner > 1) {
						continue;  //too many runner, set this tile as empty
					}
					curTile = new createjs.Sprite(runnerData, "runRight");
					curTile.stop();	
					break;	
				}
				curTile.setTransform(x*BASE_TILE_X*scaleX, y*BASE_TILE_Y*scaleX, scaleX, scaleY);
				container.addChild(curTile); 
			}
		}	
		container.cache(0, 0, previewMapX, previewMapY);
		bitmap = new createjs.Bitmap( container.cacheCanvas); // change "cont.getCacheDataURL()" to "cont.cacheCanvas"
		container.removeAllChildren();
		return bitmap;
	}	

	function restoreConfirm(rc)
	{ 
		var tmpTestInfo = {level: 1}; // "level:1" for data safe 
		var oldEditLevels = editLevels; // 1 - 
		
		if(rc) { //yes restore custom levels
			
			//------------------------------------------------------------------------------------
			//(1) clear edit levels 
			getTestLevel(tmpTestInfo);
			clearEditLevelInfo(); //clear edit level info
			clearStorage(STORAGE_USER_SCORE_INFO); //clear user score info
			clearTestLevel(); //clear test level
			initEditLevelInfo();
	
			//(2) add levelmap to storage
			editLevelData = [];
			for(var i=0; i < tmpCustomLevels.length; i++) {
				setEditLevel(++editLevels, tmpCustomLevels[i]); //editLevels: 1 - MAX_EDIT_LEVEL
			}
			
			//(3) save edit info
			setEditLevelInfo();
			if(tmpTestInfo.level > oldEditLevels && editLevels < MAX_EDIT_LEVEL && !levelMapIsEmpty(tmpTestInfo.levelMap)) {
				//still have space for save new editing level
				tmpTestInfo.level = editLevels+1;
				setTestLevel(tmpTestInfo);
			}
			//-----------------------------------------------------------------------------------
			
			restoreKeyState();
			curLevel = 1;
			setModernInfo(); // set current level = 1 for play mode
			if(playMode == PLAY_EDIT) {
				editEdit(-1, _callBackFun);
			} else {
				editPlay(-1, _callBackFun);
			}
		} else {
			restoreKeyState();
			if(_callBackFun) _callBackFun();
			
		}
	}
	
	//restore button click 
	function buttonClick()
	{
		removeCanvas();
		removeCoverBackground();
		yesNoDialog(["Warning", "Overwrite existing custom levels ?"], yesBitmap, noBitmap, mainStage, tileScale, restoreConfirm);
	}

	//restore button mouse over
	function buttonMouseOver()
	{
		var border = buttonObj.getChildAt(0);

		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER1_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE, -BUTTON_BORDER_SIZE, buttonSizeX+BUTTON_BORDER_SIZE*2, MSG_AREA_Y+BUTTON_BORDER_SIZE*2,BUTTON_ROUND_RADIUD).endFill();

		buttonTextObj.shadow = new createjs.Shadow(TITLE_TEXT_SHADOW_COLOR, 2, 2, 10 );
		dialogStage.cursor = 'pointer';
		dialogStage.update();
	}
	
	//restore button mouse out
	function buttonMouseOut()
	{
		var border = buttonObj.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill(BUTTON_BORDER0_COLOR)
			.drawRoundRect(-BUTTON_BORDER_SIZE/2, -BUTTON_BORDER_SIZE/2, buttonSizeX+BUTTON_BORDER_SIZE, MSG_AREA_Y+BUTTON_BORDER_SIZE, BUTTON_ROUND_RADIUD).endFill();
		
		buttonTextObj.shadow = null;
		dialogStage.cursor = 'default';
		dialogStage.update();
	}	
	
	function removeCanvas()
	{
		dialogStage.removeAllChildren();
		dialogStage.enableMouseOver(0);
		createjs.Ticker.removeEventListener(dialogStage);
		document.body.removeChild(restoreCanvas);
	}
	
	function removeCoverBackground()
	{
		mainStage.removeChild(coverBackgroundObj);
	}		
	
	function closeDialog()
	{
		restoreKeyState();
		removeCanvas();
		removeCoverBackground();
		if(_callBackFun) _callBackFun();
	}
	
	function handleEscKeyDown(event) 
	{
		if(!event){ event = window.event; } //cross browser issues exist
	
		if(event.shiftKey || event.ctrlKey) return false;

		switch(event.keyCode) {
		case KEYCODE_ESC:
			closeDialog();
			break;	
		default:
			//debug("keycode = " + code);	
			break;	
		}
		return false;
	}	
}
