var emptyTile, actTile;
var cursorTileObj;
var editMap;
	
var MAX_EDIT_GUARD = 5;     //maximum number of guards
var EMPTY_ID = 0, GUARD_ID = 8, RUNNER_ID = 9;

//value | Character | Type
//------+-----------+-----------
//  0x0 |  <space>  | Empty space
//  0x1 |     #     | Normal Brick
//  0x2 |     @     | Solid Brick
//  0x3 |     H     | Ladder
//  0x4 |     -     | Hand-to-hand bar (Line of rope)
//  0x5 |     X     | False brick
//  0x6 |     S     | Ladder appears at end of level
//  0x7 |     $     | Gold chest
//  0x8 |     0     | Guard
//  0x9 |     &     | Player

var tileInfo = [
	[ "eraser",   ' ' ], //(0), empty
	[ "brick",    '#' ], //(1)
	[ "solid",    '@' ], //(2)
	[ "ladder",   'H' ], //(3)
	[ "rope",     '-' ], //(4)
	[ "trapBrick",'X' ], //(5)
	[ "hladder",  'S' ], //(6)
	[ "gold",     '$' ], //(7)
	[ "guard1",   '0' ], //(8)
	[ "runner1",  '&' ]  //(9)
];

var baseTile=[];	
var lastRunner = null;
var lastGuardList = [];	
var editBorder;
var testLevelInfo = {level: -1};

function startEditMode() 
{
	playMode = PLAY_EDIT;
	mainStage.removeAllChildren();
	//document.onkeydown = function() { return true; };
	document.onkeydown = editHandleKeyDown;
	
	////getEditLevelInfo(); //move to main.js
	setEditSelectMenu();
	
	canvasEditReSize();
	createBaseTile();
	createEditMap();
	startEditTicker();
	setButtonState();
}

function setEditSelectMenu()
{
	if(editLevels>0)selectIconObj.enable(); 
	else selectIconObj.disable(1);
}

function back2EditMode(rc)
{
	if(rc == 1) { //pass
		testLevelInfo.pass = 1;
		setTestLevel(testLevelInfo);
		//enableSaveButton();
	} else { //fail
		//if(testLevelInfo.pass && !testLevelInfo.modified) enableSaveButton();
	}
	startEditMode();
	//setButtonState();
}

function saveTestState()
{
	map2LevelData();
	setTestLevel(testLevelInfo);
}

function startTestMode()
{
	playMode = PLAY_TEST;
	playData = 3;
	
	curLevel = testLevelInfo.level;
	stopEditTicker();
	saveTestState();
	canvasReSize();
	document.onkeydown = handleKeyDown; //key press
	selectIconObj.disable(1);
	initShowDataMsg();
	startGame();
}

function getTestLevelMap(initValue)
{
	return testLevelInfo.levelMap;
}

var EDIT_PADDING = 1;

function canvasEditReSize() 
{
	for (var scale = MAX_SCALE; scale >= MIN_SCALE; scale -= 0.25) {
		canvasX = (BASE_SCREEN_X+BASE_TILE_X*2) * scale+ EDIT_PADDING * (NO_OF_TILES_X+1);
		canvasY =  BASE_SCREEN_Y * scale + EDIT_PADDING * (NO_OF_TILES_Y+1);
		if (canvasX <= screenX1 && canvasY <= screenY1 || scale <= MIN_SCALE) break;
	}
	//debug("screenX1 = " + screenX1 + " screenY1 = " + screenY1 + "scale = " + scale);

	canvas = document.getElementById('canvas');

	canvas.width = canvasX;
	canvas.height = canvasY;
	
	//Set canvas top left position
	var left = ((screenX1 - canvasX)/2|0),
		top  = ((screenY1 - canvasY)/2|0);
	canvas.style.left = (left>0?left:0) + "px";
	canvas.style.top =  (top>0?top:0) + "px";
	canvas.style.position = "absolute";
	
	//initial constant value
	tileScale = scale;
	tileW = BASE_TILE_X * scale;
	tileH = BASE_TILE_Y * scale;
	
	W2 = (tileW/2|0); //20, 15, 10,
	H2 = (tileH/2|0); //22, 16, 11 
	
	W4 = (tileW/4|0); //10, 7, 5,
	H4 = (tileH/4|0); //11, 8, 5,
	
	editBorder = 4 * tileScale;	
}

function createBaseTile()
{
	for(var id = 0; id < tileInfo.length; id++) {
		baseTile[id] = { image: preload.getResult(tileInfo[id][0]), id: id };
	}
	
	emptyTile = { image: preload.getResult("empty"), id: 0 };
	actTile = baseTile[1];
}

function createEditMap() 
{
	var tile, backColor, bitmap;
		
	setEditBackground();
	drawEditArea(0,0, 
				 (tileW+EDIT_PADDING)*NO_OF_TILES_X+EDIT_PADDING,
				 (tileH+EDIT_PADDING)*NO_OF_TILES_Y+EDIT_PADDING
	);
	
	initMapInfo();
	getTestLevel(testLevelInfo);
	
	
	//(1) create empty map[x][y] array;
	editMap = [];
	for(var x = 0; x < NO_OF_TILES_X; x++) {
		editMap[x] = [];
	}
	
	//(2) draw map
	var index = 0;
	for(var y = 0; y < NO_OF_TILES_Y; y++) {
		for(var x = 0; x < NO_OF_TILES_X; x++) {
			var id = tile2Id(testLevelInfo.levelMap.charAt(index++));
			tile = new createjs.Container();
				
			backColor = new createjs.Shape();
			backColor.graphics.beginFill("black").drawRect(0, 0, tileW, tileH).endFill();
			if(id == 0) {
				bitmap = new createjs.Bitmap(emptyTile.image);
			} else {
				bitmap = new createjs.Bitmap(baseTile[id].image);
			}
			bitmap.scaleX = bitmap.scaleY = tileScale;
			
			tile.addChild(backColor, bitmap);
			tile.x = (tileW + EDIT_PADDING) * x+EDIT_PADDING;
			tile.y = (tileH + EDIT_PADDING) * y+EDIT_PADDING;
			editMap[x][y] = { tile: tile, id: id };
			mainStage.addChild(tile); 
			addManCheck(id, x, y);
		}
	}
	drawEditGround();
	addSelectIcon();
 	addCursorTile();
	drawEditLevel();
	drawSaveButton();
	drawTestButton();
	drawNewButton();
	enableTestButton();
	
	mainStage.on("stagemouseup", stageMouseUp);
	mainStage.on("stagemousedown", stageMouseDown);
}

function clearEditMap()
{
	initMapInfo();	
	for(var y = 0; y < NO_OF_TILES_Y; y++) {
		for(var x = 0; x < NO_OF_TILES_X; x++) {
			var tileObj = editMap[x][y];
			tileObj.tile.getChildAt(1).image =  emptyTile.image;
			tileObj.id = emptyTile.id;
		}
	}
}

var tileIdMapping = { ' ':0, '#':1, '@':2, 'H':3, '-':4, 'X':5, 'S':6, '$':7, '0':8, '&':9 };
function tile2Id(tileChar)
{
	if( tileIdMapping.hasOwnProperty(tileChar)) {
		return tileIdMapping[tileChar];
	} else {
		return 0;
	}
}

function setEditBackground()
{
	//set background color
	var background = new createjs.Shape();
	background.graphics.beginFill("black").drawRect(0, 0, canvas.width, canvas.height);
	mainStage.addChild(background);
	document.body.style.background = "#301050";
}
	
function drawEditArea(startX, startY, width, height)
{
	var editBack = new createjs.Shape();
	editBack.alpha = 0.5;
	editBack.graphics.beginFill("gold").drawRect(startX, startY, width, height);
	mainStage.addChild(editBack);
}

function drawEditGround()
{
	var groundTile;
	var y = (tileH + EDIT_PADDING) * NO_OF_TILES_Y+EDIT_PADDING;
	var x = (tileW + EDIT_PADDING) * NO_OF_TILES_X+EDIT_PADDING;
	
	groundTile = new createjs.Shape();
	groundTile.graphics.beginFill("#0DA1FF").drawRect(0, 0, x, 10*tileScale);
	groundTile.x = 0;
	groundTile.y = y;

	mainStage.addChild(groundTile); 
}

function addSelectIcon()
{
	var x =  (tileW+EDIT_PADDING)*NO_OF_TILES_X+tileW/2;
	var y;
	for(var i = 1; i < baseTile.length; i++) {
		y = (tileH*3/2)*(i-1) + tileH*3/2;
		drawSelectIcon(i, x, y);
	}
	y = (tileH*3/2)*(i-1) + tileH*3/2;
	drawSelectIcon(0, x, y);
}
	
function addCursorTile()
{
	var backColor, bitmap;
	
	cursorTileObj = new createjs.Container();
				
	backColor = new createjs.Shape();
	backColor.graphics.beginFill("black").drawRect(0, 0, tileW, tileH).endFill();
	bitmap = new createjs.Bitmap(actTile.image);
	bitmap.scaleX = bitmap.scaleY = tileScale;
				
	cursorTileObj.addChild(backColor, bitmap);
	cursorTileObj.alpha = 0;	
	mainStage.addChild(cursorTileObj);

}

//var gameTicker = null; ....//same as playTicker
function startEditTicker()
{
	stopEditTicker();
	createjs.Ticker.setFPS(30);
/*	
	if(testLevelInfo.level >= MAX_EDIT_LEVEL) {
		mainStage.cursor = 'default';
		mainStage.update();
		return;
	}
*/	
	mainStage.enableMouseOver(120);
	gameTicker = createjs.Ticker.on("tick", editTick);	
}
	
function stopEditTicker()
{
	if(gameTicker) {
		createjs.Ticker.off("tick", gameTicker);
		mainStage.enableMouseOver(0);
		mainStage.cursor = 'default';
		gameTicker = null;
	}
}

function drawSelectIcon(id, x, y)
{
	var tile, border, backColor, bitmap;
	var selColor;
	
	tile = new createjs.Container();

	//child id = 0
	border = new createjs.Shape();
	if(id == actTile.id) {
		selColor = "red";
		selectedTile = tile;
	} else {
		selColor = "black";
	}
	border.graphics.beginFill(selColor).drawRect(-editBorder, -editBorder, tileW+editBorder*2, tileH+editBorder*2).endFill();
	
	//child id = 1
	backColor = new createjs.Shape();
	backColor.graphics.beginFill("black").drawRect(0, 0, tileW, tileH).endFill();
	
	//child id = 2
	if(id == 0) {
		bitmap = new createjs.Bitmap(preload.getResult("eraser")); //id=2
	} else {
		bitmap = new createjs.Bitmap(baseTile[id].image); //id=2
	}
	bitmap.scaleX = bitmap.scaleY = tileScale;
				
	tile.addChild(border, backColor, bitmap);
		
	tile.x = x;
	tile.y = y;
	tile.myId = id;
	tile.on('click', selectTileClick);
	tile.on('mouseover', selectTileMouseOver);
	tile.on('mouseout', selectTileMouseOut);
	mainStage.addChild(tile);
}
	
var mouseOver = 0;	
function selectTileClick()
{
	var actBorder = this.getChildAt(0);
	var inActBorder = selectedTile.getChildAt(0);
	
	inActBorder.graphics.clear();
	inActBorder.graphics.beginFill("black").drawRect(-editBorder, -editBorder, tileW+editBorder*2, tileH+editBorder*2).endFill();
	
	actBorder.graphics.clear();
	actBorder.graphics.beginFill("red").drawRect(-editBorder, -editBorder, tileW+editBorder*2, tileH+editBorder*2).endFill();
	
	actTile = baseTile[this.myId];
	cursorTileObj.getChildAt(1).image =  actTile.image;
	selectedTile = this;
}
	
function selectTileMouseOver()
{ 
	var border = this.getChildAt(0);
	
	border.graphics.clear();
	border.graphics.beginFill("gold").drawRect(-editBorder, -editBorder, tileW+editBorder*2, tileH+editBorder*2).endFill();

	mainStage.cursor = 'pointer'
	mouseOver = 1;
}
	
function selectTileMouseOut()
{ 
	var border = this.getChildAt(0);
	var color = (actTile.id == this.myId)?"red":"black";
	
	border.graphics.clear();
	border.graphics.beginFill(color).drawRect(-editBorder, -editBorder, tileW+editBorder*2, tileH+editBorder*2).endFill();
	
	mouseOver = 0;
}

function drawEditLevel()
{
	var y = canvas.height - tileH - editBorder*2;
	
	drawText(0, y, "LEVEL", mainStage);	
	drawEditLevelNo();
}

var editLevelNoObj = [];
function drawEditLevelNo()
{
	var y = canvas.height - tileH - editBorder*2;
	
	for(var i = 0; i < editLevelNoObj.length; i++) 
		mainStage.removeChild(editLevelNoObj[i]);
	
	editLevelNoObj = drawText(5*tileW, y, ("00"+(testLevelInfo.level)).slice(-3), mainStage);
}

var testButton, newButton, saveButton;

function drawTestButton()
{
	var border, backColor, text;
	var textSting = "TEST";
	
	var width = textSting.length * tileW;
	//var x = canvas.width - width * 1.5;
	var x = 20*(tileW+EDIT_PADDING)+EDIT_PADDING;
	var y = canvas.height - tileH - editBorder;
	
	testButton = new createjs.Container();

	//child id = 0
	border = new createjs.Shape();
	border.graphics.beginFill("black").drawRect(-editBorder, -editBorder, width+editBorder*2, tileH+editBorder*2).endFill();
	
	//child id = 1
	backColor = new createjs.Shape();
	backColor.graphics.beginFill("#FFF").drawRect(0, 0, width, tileH).endFill();
	
	testButton.addChild(border, backColor);
	
	//child id = 2
	drawText(0, 0, textSting, testButton);
		
	testButton.x = x;
	testButton.y = y;
	testButton.on('click', testButtonClick);
	testButton.on('mouseover', testButtonMouseOver);
	testButton.on('mouseout', testButtonMouseOut);
	testButton.alpha = 0;
	mainStage.addChild(testButton);	

	function testButtonClick()
	{
		startTestMode();
	}

	function testButtonMouseOver()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill("gold").drawRect(-editBorder, -editBorder, 4*tileW+editBorder*2, tileH+editBorder*2).endFill();

		mainStage.cursor = 'pointer';
		mouseOver = 1;	
	}

	function testButtonMouseOut()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill("black").drawRect(-editBorder, -editBorder, 4*tileW+editBorder*2, tileH+editBorder*2).endFill();
	
		mouseOver = 0;	
	}	
}

function drawSaveButton()
{
	var border, backColor, text;
	var textSting = "SAVE";
	
	var width = textSting.length * tileW;
	//var x = canvas.width - width * 1.5;
	var x = 15*(tileW+EDIT_PADDING)+EDIT_PADDING;
	var y = canvas.height - tileH - editBorder;
	
	saveButton = new createjs.Container();

	//child id = 0
	border = new createjs.Shape();
	border.graphics.beginFill("black").drawRect(-editBorder, -editBorder, width+editBorder*2, tileH+editBorder*2).endFill();
	
	//child id = 1
	backColor = new createjs.Shape();
	backColor.graphics.beginFill("#FFF").drawRect(0, 0, width, tileH).endFill();
	
	saveButton.addChild(border, backColor);
	
	//child id = 2
	drawText(0, 0, textSting, saveButton);
		
	saveButton.x = x;
	saveButton.y = y;
	saveButton.on('click', saveButtonClick);
	saveButton.on('mouseover', saveButtonMouseOver);
	saveButton.on('mouseout', saveButtonMouseOut);
	saveButton.alpha = 0;
	mainStage.addChild(saveButton);	

	function saveButtonClick()
	{
		stopEditTicker();
		saveEditLevel();
		yesNoDialog(["Save Successful", "Play It ?"], yesBitmap, noBitmap, mainStage, tileScale, playConfirm);

	}

	function saveButtonMouseOver()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill("gold").drawRect(-editBorder, -editBorder, 4*tileW+editBorder*2, tileH+editBorder*2).endFill();

		mainStage.cursor = 'pointer';
		mouseOver = 1;	
	}

	function saveButtonMouseOut()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill("black").drawRect(-editBorder, -editBorder, 4*tileW+editBorder*2, tileH+editBorder*2).endFill();
	
		mouseOver = 0;	
	}	
	
	function playConfirm(rc)
	{
		if(rc) { //yes
			clearTestLevel(); //clear current edit level 
			startPlayUserLevel();
		} else { //no
			//enableTestButton();
			setButtonState();
			startEditTicker();
		}
	}
	
	function startPlayUserLevel()
	{
		playMode = PLAY_MODERN;
		playData = 3;
	
		curLevel = testLevelInfo.level;
		setModernInfo();
	
		canvasReSize();
		document.onkeydown = handleKeyDown;
		initShowDataMsg();
		startGame();
	}	
}

function editLevelModified()
{
	return (testLevelInfo.modified);
}

function editConfirmAbortState(callbackFun)
{
	stopEditTicker();
	yesNoDialog(["Abort current edit ?"], yesBitmap, noBitmap, mainStage, tileScale, 
				function(rc) { if(rc) callbackFun(); else startEditTicker(); });
}

function drawNewButton()
{
	var border, backColor, text;
	var textSting = "NEW";
	var width = textSting.length * tileW;
	var x = 25*(tileW+EDIT_PADDING)+EDIT_PADDING;
	var y = canvas.height - tileH - editBorder;
	
	newButton = new createjs.Container();

	//child id = 0
	border = new createjs.Shape();
	border.graphics.beginFill("black").drawRect(-editBorder, -editBorder, width+editBorder*2, tileH+editBorder*2).endFill();
	
	//child id = 1
	backColor = new createjs.Shape();
	backColor.graphics.beginFill("#FFF").drawRect(0, 0, width, tileH).endFill();
	
	newButton.addChild(border, backColor);
	
	//child id = 2
	drawText(0, 0, textSting, newButton);
		
	newButton.x = x;
	newButton.y = y;
	newButton.on('click', newButtonClick);
	newButton.on('mouseover', newButtonMouseOver);
	newButton.on('mouseout', newButtonMouseOut);
	mainStage.addChild(newButton);	
	
	function newLevel(rc)
	{
		if(rc) 	{
			clearEditMap();
			if(testLevelInfo.level <= editLevels) { //edit exist level
				testLevelInfo.level = editLevels+1;
				drawEditLevelNo();
			}
			if(testLevelInfo.level > MAX_EDIT_LEVEL) {
				setButtonState();
			} else {
				disableTestButton();
			}
			clearTestLevel();
		}
		startEditTicker();
	}
	
	function newButtonClick()
	{
		stopEditTicker();
		if(testLevelInfo.modified) {
			yesNoDialog(["Abort current edit ?"], yesBitmap, noBitmap, mainStage, tileScale, newLevel);
		} else {
			newLevel(1);
		}
	}

	function newButtonMouseOver()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill("gold").drawRect(-editBorder, -editBorder, 3*tileW+editBorder*2, tileH+editBorder*2).endFill();

		mainStage.cursor = 'pointer';
		mouseOver = 1;	
	}

	function newButtonMouseOut()
	{
		var border = this.getChildAt(0);
	
		border.graphics.clear();
		border.graphics.beginFill("black").drawRect(-editBorder, -editBorder, 3*tileW+editBorder*2, tileH+editBorder*2).endFill();
	
		mouseOver = 0;	
	}	
}

function setButtonState()
{
	if(testLevelInfo.level > MAX_EDIT_LEVEL) {
		newButton.alpha = 0;
		testButton.alpha = 0;
		saveButton.alpha = 0;
		editWarningMsg(0);
		return;
	} else {
		newButton.alpha = 1;
		editWarningMsg(1);
	}
	
	if(testLevelInfo.modified) 	{
		enableTestButton();
		if(testLevelInfo.pass) {
			saveButton.alpha = 1;
		} else {
			saveButton.alpha = 0;
		}
	} else {
		testLevelInfo.pass = 0;
		saveButton.alpha = 0;
	}
} 

function enableTestButton()
{
	if(lastRunner) testButton.alpha = 1;
}

function disableTestButton()
{
	testButton.alpha = 0;
	saveButton.alpha = 0;
}

function clearUserLevelScore()
{
	playData = 3;
	getModernScoreInfo();
	modernScoreInfo[testLevelInfo.level-1] = -1;
	setModernScoreInfo();
}

function delUserLevelScore(level)
{
	playData = 3;
	getModernScoreInfo();
	modernScoreInfo.splice(level-1, 1);
	modernScoreInfo[MAX_EDIT_LEVEL-1] = -1;
	setModernScoreInfo();
}

function saveEditLevel()
{
	map2LevelData();
	if(testLevelInfo.level > editLevels) { // new level
		addEditLevel(testLevelInfo.levelMap);
	} else {
		setEditLevel(testLevelInfo.level, testLevelInfo.levelMap);
	}
	clearUserLevelScore(); //clear score 
	testLevelInfo.modified = 0;
	setEditSelectMenu();
}


var mouseDown = 0;
var lastDown = {x:-1, y:-1};
	
function stageMouseDown(event)
{
	mouseDown = 1;
	//console.log("DOWN");
}
	
function stageMouseUp(event)
{
	mouseDown = 0;
	lastDown = {x:-1, y:-1};
	//console.log("UP");
}

function initMapInfo()
{
	lastRunner = null;
	lastGuardList = [];	

	testLevelInfo.modified = 0;
	testLevelInfo.pass = 0;
}
		
function addManCheck(id, x, y)
{
	switch(id) {
	case RUNNER_ID:
		if (lastRunner && (lastRunner.x != x || lastRunner.y != y)) {
			var lastRunnerTile = editMap[lastRunner.x][lastRunner.y];
			lastRunnerTile.tile.getChildAt(1).image =  emptyTile.image;
			lastRunnerTile.id = emptyTile.id;
		}
		lastRunner = { x:x, y:y };
		break;	
	case GUARD_ID:
		var sameGuard=0, guardNo = lastGuardList.length;
			
		for(var i = 0; i < guardNo; i++) {
			if(lastGuardList[i].x == x && lastGuardList[i].y == y) {
				sameGuard = 1;
				break;
			}
		}
		if(!sameGuard) {
			if(guardNo >= MAX_EDIT_GUARD) { //too many guards remove first one
				var x1 = lastGuardList[0].x, y1 = lastGuardList[0].y;
				var guardTile = editMap[x1][y1];
					
				guardTile.tile.getChildAt(1).image =  emptyTile.image;
				guardTile.id = emptyTile.id;
				lastGuardList.splice(0,1); //remove first one from array
			}
			lastGuardList.push({x:x, y:y});
		}
		break;	
	}
}

function delManCheck(id, x, y)
{
	switch(id) {
	case RUNNER_ID:
		//assert(lastRunner != null, "runner == null error");
		var lastRunnerTile = editMap[lastRunner.x][lastRunner.y];
		lastRunnerTile.tile.getChildAt(1).image =  emptyTile.image;
		lastRunnerTile.id = emptyTile.id;
		lastRunner = null;
		disableTestButton();	
		break;
	case GUARD_ID:		
		var removeId = -1, guardNo = lastGuardList.length;
			
		for(var i = 0; i < guardNo; i++) {
			if(lastGuardList[i].x == x && lastGuardList[i].y == y) {
				removeId = i;
				break;
			}
		}
		if(removeId >= 0) {
			var x1 = lastGuardList[removeId].x, y1 = lastGuardList[removeId].y;
			var guardTile = editMap[x1][y1];
			
			guardTile.tile.getChildAt(1).image =  emptyTile.image;
			guardTile.id = emptyTile.id;
			lastGuardList.splice(removeId,1);
		} else {
			console.log("design error !");
		}
		break;	
	}
}

//state: = 0: no change, < 0: level deleted, > 0 level change to newLevel
function editSelectMenuClose(levelDeleted, newLevel, state)
{
	if(levelDeleted) {
		switch(true) {
		case (state > 0): //level changed
			getTestLevel(testLevelInfo);
			testLevelInfo.level = newLevel;
			setTestLevel(testLevelInfo);
			startEditMode();
			break;
		case (state < 0): //level deleted
			clearTestLevel();
			setEditSelectMenu();	
			startEditMode();
			break;	
		case (state == 0 && newLevel == 0): //new level
			if(testLevelInfo.modified == 1) {	
				testLevelInfo.level = editLevels+1;
				setTestLevel(testLevelInfo);
			} 
			startEditMode();
			break;
		}
	}
}

function editSelectLevel(level)
{
	testLevelInfo.level = level;
	testLevelInfo.levelMap = editLevelData[level-1];
	setTestLevel(testLevelInfo);
	startEditMode();
}

function map2LevelData()
{
	var i=0;
	
	testLevelInfo.levelMap = "";
	for(var y = 0; y < NO_OF_TILES_Y; y++) {
		for(var x = 0; x < NO_OF_TILES_X; x++) {
			testLevelInfo.levelMap += tileInfo[editMap[x][y].id][1];
		}
	}
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

var copyLevelMap = null;
function editHandleKeyDown(event)
{
	if(!event){ event = window.event; } //cross browser issues exist
	
	if (event.ctrlKey) {
		if(event.keyCode == KEYCODE_V) { //CTRL-V
			if(copyLevelMap != null) {
				testLevelInfo.levelMap = copyLevelMap;
				testLevelInfo.pass = 1;
				setTestLevel(testLevelInfo);
				startEditMode();
				////setButtonState();
				setTimeout(function() { showTipsText("PASTE MAP", 0);}, 50);
			}
		}
	}
	return true;
}	

function editTick() 
{
	var x = ((mainStage.mouseX-EDIT_PADDING) / (tileW+EDIT_PADDING) )| 0;
	var y = ((mainStage.mouseY-EDIT_PADDING) / (tileH+EDIT_PADDING) )| 0;
	
	if(testLevelInfo.level > MAX_EDIT_LEVEL) {
		mainStage.cursor = 'default'; 
		mainStage.update();
		return;
	}
	if(x >= 0 && x < NO_OF_TILES_X && y >= 0 && y < NO_OF_TILES_Y) {
		//edit area
		mainStage.cursor = 'pointer'; 
		if( x != lastDown.x || y != lastDown.y) {
			cursorTileObj.alpha = 1;
			cursorTileObj.x = (tileW + EDIT_PADDING) * x+EDIT_PADDING;
			cursorTileObj.y = (tileH + EDIT_PADDING) * y+EDIT_PADDING;
			if(mouseDown) {
				var clickTile = editMap[x][y];
				
				if(!actTile.id || clickTile.id == actTile.id) {
					if(actTile.id) cursorTileObj.alpha = 0;
					delManCheck(clickTile.id, x, y);
					clickTile.tile.getChildAt(1).image =  emptyTile.image;
					clickTile.id = emptyTile.id;
				} else {	
					delManCheck(clickTile.id, x, y);
					clickTile.tile.getChildAt(1).image =  actTile.image;
					clickTile.id = actTile.id;
					addManCheck(actTile.id, x, y);
				}
				lastDown = {x:x, y:y};
				
				if(testLevelInfo.pass || actTile.id == RUNNER_ID || testLevelInfo.modified == 0) {
					testLevelInfo.modified = 1;
					testLevelInfo.pass = 0;
					setButtonState();
				}
			}
		}
	} else {
		if(!mouseOver) mainStage.cursor = 'default'; 
		cursorTileObj.alpha = 0;
	}
	mainStage.update();
}