/** 
 * @license ============================================================================= 
 * Lode Runner main program
 *
 * This program is a HTML5 remake of the Lode Runner games (APPLE II version).
 *
 * The program code base on CreateJS JavaScript libraries !
 * http://www.createjs.com/
 *
 * The AI algorithm reference book:
 * http://www.kingstone.com.tw/book/book_page.asp?kmcode=2014710650538
 * 
 * Source Code: https://github.com/SimonHung/LodeRunner
 *
 * by Simon Hung 2014/06/20 (http://simonsays-tw.com)
 * ============================================================================= 
 */

var screenX1, screenY1;
var canvasX, canvasY;

var tileW, tileH; //tile width & tile height
var tileWScale, tileHScale; //tile width/height with scale
var W2, W4;       //W2: 1/2 tile-width,  W4: 1/4 tile width
var H2, H4;       //H2: 1/2 tile-height, H4: 1/4 tile height

var mainStageX, mainStageY;
var scroeStageX, scoreStageY;

var canvas;
var mainStage, scoreStage;
var loadingTxt;

var gameState, lastGameState ;
var tileScale, xMove, yMove;

var speedMode = [16, 20, 25, 30, 35]; //slow   normal  fast 
var speedText = ["VERY SLOW", "SLOW", "NORMAL", "FAST", "VERY FAST"];
var speed = 2; //normal 
var demoSpeed = 40;

var levelData = levelData1; //Lode Runner 1

var curLevel = 1, maxLevel = 1;
var playMode = PLAY_CLASSIC;
var playData = 1; //1: lode runner 1,           2: lode runner 2, 3: user created, 
                  //4: lode runner 1 demo mode, 5: lode runner 2 demo mode
var curTime = MAX_TIME_COUNT;

function init() 
{
	var screenSize = getScreenSize();
	screenX1 = screenSize.x;
	screenY1 = screenSize.y;
	
	loadDataJS(); //load demo data file
	canvasReSize();
	createStage();
	setBackground();
	initAutoDemoRnd(); //init auto demo random levels
	//initDemoModeVariable(); //for user to select demo level 06/11/2014, move to lodeDataJS() 06/14/2014
	////genUserLevel(MAX_EDIT_LEVEL); //for debug only
	getEditLevelInfo(); //load edit levels
	showLoadingPage(); //preload function 
}

function loadDataJS()
{
	var js = document.createElement('script');
	
	js.type = "text/javascript";
	js.src = "lodeRunner.wData.js";
	//console.log(js.src);
	js.onload = function() {
		initDemoModeVariable();
		debug('demo data load complete');
	}; 
	//document.body.appendChild(js);
	document.getElementsByTagName('head')[0].appendChild(js);
}

function canvasReSize() 
{
	for (var scale = MAX_SCALE; scale >= MIN_SCALE; scale -= 0.25) {
		canvasX = BASE_SCREEN_X * scale;
		canvasY = BASE_SCREEN_Y * scale;
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
	
	//tileW = BASE_TILE_X * scale;
	//tileH = BASE_TILE_Y * scale;
	tileW = BASE_TILE_X; //tileW and tileH for detection so don't change scale
	tileH = BASE_TILE_Y;
	tileWScale = BASE_TILE_X * scale;
	tileHScale = BASE_TILE_Y * scale;
	
	W2 = (tileW/2|0); //20, 15, 10,
	H2 = (tileH/2|0); //22, 16, 11 
	
	W4 = (tileW/4|0); //10, 7, 5,
	H4 = (tileH/4|0); //11, 8, 5,
	
	//xMove and yMove initial by setSpeedByAiVersion() 
 	//xMove = 4 * tileScale * 2;
 	//yMove = 4 * tileScale * 2;		
}

function createStage() 
{
	mainStage = new createjs.Stage(canvas);

	loadingTxt = new createjs.Text(" ", "36px Arial", "#FF0000");
	loadingTxt.x = (canvas.width - loadingTxt.getBounds().width) / 2 | 0;
	loadingTxt.y = (canvas.height - loadingTxt.getBounds().height) / 2 | 0;
	mainStage.addChild(loadingTxt);
	mainStage.update();
}

function setBackground()
{
	//set background color
	var background = new createjs.Shape();
	background.graphics.beginFill("#000000").drawRect(0, 0, canvas.width, canvas.height);
	mainStage.addChild(background);
	document.body.style.background = "#301050";
}

function showCoverPage()
{
	menuIconDisable(1);
	clearIdleDemoTimer();
	mainStage.removeAllChildren();	
	mainStage.addChild(coverBitmap);
	mainStage.addChild(remakeBitmap);
	mainStage.update();	
	waitIdleDemo(3000);
}

var idleTimer=null, startIdleTime;
function waitIdleDemo(maxIdleTime)
{
	startIdleTime = new Date();
	idleTimer = setInterval(function(){ checkIdleTime(maxIdleTime);}, 200);
	anyKeyStopDemo();
}

function anyKeyStopDemo()
{
	document.onkeydown = anyKeyDown; //any key press
	enableStageClickEvent();
}

function stopDemoAndPlay()
{
	if(changingLevel) return false;
	clearIdleDemoTimer();
	disableStageClickEvent();

	soundStop(soundFall);		
	stopAllSpriteObj();
	
	if(playMode == PLAY_DEMO) selectIconObj.disable(1); 
	
	////genUserLevel(MAX_EDIT_LEVEL); //for debug only
	////getEditLevelInfo(); //load edit levels
	selectGame();
}

var stageClickListener = null, stagePressListener = null;

function enableStageClickEvent()
{
	disableStageClickEvent();
	
	//createjs.Touch.enable(mainStage);
	stageClickListener = mainStage.on("click", function(evt) { stopDemoAndPlay(); });
	//stagePressListener = mainStage.on("press", function(evt) { stopDemoAndPlay(); });
}

function disableStageClickEvent()
{
	var rc = 0;
	
	if(stageClickListener) { rc = 1; mainStage.off("click", stageClickListener); }
	//if(stagePressListener) { rc = 1; mainStage.off("press", stagePressListener); }
	stageClickListener = stagePressListener = null;
	//createjs.Touch.disable(mainStage);
	
	return rc;
}

function clearIdleDemoTimer()
{
	if(idleTimer) clearInterval(idleTimer);
	idleTimer = null;
}

function noKeyDown()
{
	return false;
}

function anyKeyDown()
{
	//if(changingLevel) return false;
	stopDemoAndPlay();
}

function checkIdleTime(maxIdleTime)
{
	var curTime = new Date();
	var idleTime = (curTime - startIdleTime);
		
	if(idleTime > maxIdleTime){ //start demo
		clearIdleDemoTimer();
		playMode = PLAY_AUTO;
		anyKeyStopDemo(); 
		startGame();
	}
}

function selectGame()
{
	var infoJSON = getStorage(STORAGE_LASTPLAY_MODE);
	playMode = PLAY_NONE;

	if(infoJSON) {
		var infoObj = JSON.parse(infoJSON);
		playMode = infoObj.m; //mode= 1: classic, 2:time 
		playData = infoObj.d; //data= 1: lode runner 1, 2: lode runner 2
	}
	
	if( (playMode != PLAY_CLASSIC && playMode != PLAY_MODERN) ||
	    (playData != 1 && playData != 2 && playData != 3) )
	{
		playMode = PLAY_CLASSIC;
		playData = 1; //lode runner 1
	}
	document.onkeydown = handleKeyDown;
	initShowDataMsg();
	startGame();	
}

var gameTicker = null;
var changingLevel = 0; 
function startPlayTicker()
{
	stopPlayTicker();
	//createjs.Ticker.timingMode = createjs.Ticker.RAF;
	if(playMode == PLAY_AUTO || playMode == PLAY_DEMO) {
		//createjs.Ticker.setFPS(speedMode[speedMode.length-1]); //very fast
		createjs.Ticker.setFPS(demoSpeed); //06/12/2014
	} else {
		createjs.Ticker.setFPS(speedMode[speed]);
	}
	gameTicker = createjs.Ticker.on("tick", mainTick);	
}
	
function stopPlayTicker()
{
	if(gameTicker) {
		createjs.Ticker.off("tick", gameTicker);	
		gameTicker = null;
	}
}

function startGame()
{
	var levelMap;
	gameState = GAME_WAITING;
	startPlayTicker();
	changingLevel = 1;
	
	curAiVersion = AI_VERSION; //07/04/2014
	initHotKeyVariable();      //07/09/2014
	
	switch(playMode) {
	case PLAY_CLASSIC:
		getClassicInfo();	
		levelMap = levelData[curLevel-1];	
		break;
	case PLAY_MODERN:
		getModernInfo();	
		levelMap = levelData[curLevel-1];
		break;	
	case PLAY_TEST:
		levelMap = getTestLevelMap();
		break;
	case PLAY_DEMO:
		getDemoInfo();	
		levelMap = levelData[curLevel-1];
		break;	
	case PLAY_AUTO:
		getAutoDemoLevel(1);
		levelMap = levelData[curLevel-1];	
		break;
	}
	showLevel(levelMap);
	addCycScreen();
	setTimeout(function() { openingScreen(cycDiff*2);}, 5);
}

var maxTileX = NO_OF_TILES_X - 1, maxTileY = NO_OF_TILES_Y - 1;

var runner = null,  guard= [];
var map; //[x][y] = { base: base map, act : active map, state:, bitmap: }
var guardCount, goldCount, goldComplete;

function initVariable()
{
	guard = [];
	keyAction = holeObj.action = ACT_STOP; 
	goldCount = guardCount = goldComplete = 0;
	runner = null;
	dspTrapTile = 0;
	
	initRnd(); 
	initModernVariable();
	initGuardVariable();
	initInfoVariable();
	initCycVariable();
	
	setSpeedByAiVersion(); //07/04/2014
}

function buildLevelMap(levelMap) 
{
	//(1) create empty map[x][y] array;
	map = [];
	for(var x = 0; x < NO_OF_TILES_X; x++) {
		map[x] = [];
		for(var y = 0; y < NO_OF_TILES_Y; y++) {
			map[x][y] = {}; 
		}
	}

	
	//(2) draw map
	var index = 0;
	for(var y = 0; y < NO_OF_TILES_Y; y++) {
		for(var x = 0; x < NO_OF_TILES_X; x++) {
			var id = levelMap.charAt(index++);

			var curTile;	
			switch(id) {
			default:		
			case ' ': //empty
				map[x][y].base = EMPTY_T;
				map[x][y].act  = EMPTY_T;
				map[x][y].bitmap = null;
				continue;
			case '#': //Normal Brick
				map[x][y].base = BLOCK_T;
				map[x][y].act = BLOCK_T;	
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("brick"));
				break;	
			case '@': //Solid Brick
				map[x][y].base = SOLID_T;
				map[x][y].act  = SOLID_T;
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("solid"));
				break;	
			case 'H': //Ladder
				map[x][y].base =LADDR_T;
				map[x][y].act  =LADDR_T;
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("ladder"));
				break;	
			case '-': //Line of rope
				map[x][y].base = BAR_T;
				map[x][y].act  = BAR_T;
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("rope"));
				break;	
			case 'X': //False brick
				map[x][y].base = TRAP_T; //behavior same as empty
				map[x][y].act  = TRAP_T; 
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("brick"));
				break;
			case 'S': //Ladder appears at end of level
				map[x][y].base = HLADR_T; //behavior same as empty before end of level
				map[x][y].act  = EMPTY_T; //behavior same as empty before end of level
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("ladder"));
				curTile.set({alpha:0});	//hide the laddr
				break;
			case '$': //Gold chest
				map[x][y].base = GOLD_T; //keep gold on base map
				map[x][y].act  = EMPTY_T;
				curTile = map[x][y].bitmap = new createjs.Bitmap(preload.getResult("gold"));
				goldCount++;	
				break;	
			case '0': //Guard
				map[x][y].base = EMPTY_T;
				map[x][y].act  = GUARD_T;  
				map[x][y].bitmap = null;
				if(guardCount >= MAX_GUARD) {
					map[x][y].act = EMPTY_T;
					continue;  //too many guard , set this tile as empty
				}
				
				guard[guardCount] = {};	
				curTile = guard[guardCount].sprite = new createjs.Sprite(guardData, "runLeft");
				guard[guardCount].pos = { x:x, y:y, xOffset:0, yOffset:0};	
				guard[guardCount].action = ACT_STOP;
				guard[guardCount].shape = "runLeft";
				guard[guardCount].lastLeftRight = "ACT_LEFT";
				guard[guardCount].hasGold = 0;
				guardCount++;	
				//curTile.gotoAndPlay();	
				curTile.stop();	
				//curTile.framerate = 60;	
				break;	
			case '&': //Player
				map[x][y].base = EMPTY_T;
				map[x][y].act  = RUNNER_T;	
				map[x][y].bitmap = null;
				if(runner !=  null) {
					map[x][y].act  = EMPTY_T;	
					continue;  //too many runner, set this tile as empty
				}
				runner = {};	
				curTile = runner.sprite = new createjs.Sprite(runnerData, "runRight");
				runner.pos = { x:x, y:y, xOffset:0, yOffset:0};	
				runner.action = ACT_UNKNOWN;	
				runner.shape = "runRight";	
				runner.lastLeftRight = "ACT_RIGHT";
				//curTile.gotoAndPlay();	
				curTile.stop();	
				//curTile.framerate = 60;	
				break;	
			}
			curTile.setTransform(x * tileWScale, y * tileHScale, tileScale, tileScale); //x,y, scaleX, scaleY 
			mainStage.addChild(curTile); 
		}
	}
	moveSprite2Top();
}

function moveSprite2Top()
{
	//move guard to top (z index)
	for(var i = 0; i < guardCount; i++) {
		moveChild2Top(mainStage, guard[i].sprite); 
	}
	
	if(runner == null) {
		console.log(" Without runner ???");
	} else {
		//move runner to top (z index)
		moveChild2Top(mainStage, runner.sprite); 
	}
	
	//move fill hole object to top
	moveFillHoleObj2Top();
	
	//move debug text to top
	moveChild2Top(mainStage, loadingTxt); //for debug
}

function buildGroundInfo()
{
	drawGround();
	drawInfo(levelData);
}

var groundTile;
function drawGround()
{
	groundTile = [];
	for(var x = 0; x < NO_OF_TILES_X; x++) {
		groundTile[x] = new createjs.Bitmap(preload.getResult("ground"));
		groundTile[x].setTransform(x * tileWScale, NO_OF_TILES_Y * tileHScale, tileScale, tileScale);
		mainStage.addChild(groundTile[x]); 
	}
}


var runnerLife = RUNNER_LIFE;
var curScore = 0;
var curGetGold = 0, curGuardDeadNo = 0; //for modern mode 

var infoY;
var scoreTxt, scoreTile,
	lifeTxt, lifeTile,
	levelTxt, levelTile,
	demoTxt;

var goldTxt, goldTile,
	guardTxt, guardTile,
	timeTxt, timeTile;

//=============================
// initial modern mode variable
//=============================
function initModernVariable()
{
	curTime = MAX_TIME_COUNT;
	curGetGold = curGuardDeadNo = 0;
}

function initInfoVariable()
{
	infoY =  (NO_OF_TILES_Y * BASE_TILE_Y + GROUND_TILE_Y) * tileScale;
	
	scoreTxt = []; 
	scoreTile = [];
	
	lifeTxt = []; 
	lifeTile = [];
	
	demoTxt = [];

	levelTxt = []; 
	levelTile = [];
	
	goldTxt = [];
	goldTile = [];
	
	guardTxt = [];
	guardTile = [];

	timeTxt = []; 
	timeTile = [];
}

function drawInfo()
{
	if(playMode == PLAY_CLASSIC || playMode == PLAY_AUTO || playMode == PLAY_DEMO) {
		//SCORE
		drawScoreTxt();
		drawScore(0);

		if(playMode == PLAY_DEMO) {
			drawDemoTxt();
		} else {
			//MEN
			drawLifeTxt();
			drawLife();
		}
	} else {
		//GOLD 
		drawGoldTxt();
		drawGold(0);
		
		//GUARD
		drawGuardTxt();
		drawGuard(0);
		
		//TIME 
		drawTimeTxt();
		drawTime(0);
	}
	
	//LEVEL
	drawLevelTxt();
	drawLevel();
}

//for classic & auto demo mode
function drawScoreTxt()
{
	scoreTxt = drawText(0, infoY, "SCORE", mainStage);
}

function drawLifeTxt()
{
	lifeTxt = drawText(13*tileWScale, infoY, "MEN", mainStage);
}

function drawLevelTxt()
{
	var xOffset = 20;
	
	//if(playMode == PLAY_CLASSIC || playMode == PLAY_AUTO) xOffset = 20;
	//else xOffset = 19;
	
	levelTxt = drawText(xOffset*tileWScale, infoY, "LEVEL", mainStage);
}

//for demo mode
function drawDemoTxt()
{
	demoTxt = drawText(14*tileWScale, infoY, "DEMO", mainStage);
}

//for time & edit mode
function drawGoldTxt()
{
	goldTxt = drawText(0*tileWScale, infoY, "@", mainStage);
}

function drawGuardTxt()
{
	guardTxt = drawText((5+2/3)*tileWScale, infoY, "#", mainStage);
}

function drawTimeTxt()
{
	timeTxt = drawText((11+1/3)*tileWScale, infoY, "TIME", mainStage);
}

// draw score number 
function drawScore(addScore)
{
	var digitNo;
	
	curScore += addScore;
	for(var i = 0; i < scoreTile.length; i++) 
		mainStage.removeChild(scoreTile[i]);
	
	//if(playMode == PLAY_CLASSIC || playMode == PLAY_AUTO) digitNo = 7;
	//else digitNo = 6
	
	scoreTile = drawText(5*tileWScale, infoY, ("000000"+curScore).slice(-7), mainStage);
}

function drawLife()
{
	for(var i = 0; i < lifeTile.length; i++) 
		mainStage.removeChild(lifeTile[i]);

	lifeTile = drawText(16*tileWScale, infoY, ("00"+runnerLife).slice(-3), mainStage);
}

function drawLevel()
{
	for(var i = 0; i < levelTile.length; i++) 
		mainStage.removeChild(levelTile[i]);
	
	switch(playMode) {
	case PLAY_AUTO:	
		levelTile = drawText(25*tileWScale, infoY, ("00"+demoLevel).slice(-3), mainStage);
		break;	
	case PLAY_CLASSIC: 
	default:		
		levelTile = drawText(25*tileWScale, infoY, ("00"+curLevel).slice(-3), mainStage);
		break;	
	}
}

function drawGold(addGold)
{
	curGetGold += addGold;
	for(var i = 0; i < goldTile.length; i++) 
		mainStage.removeChild(goldTile[i]);
	
	goldTile = drawText(1*tileWScale, infoY, ("00"+curGetGold).slice(-3), mainStage);
}

function drawGuard(addGuard)
{
	curGuardDeadNo += addGuard;
	if(curGuardDeadNo > 100) curGuardDeadNo = 100;
	for(var i = 0; i < guardTile.length; i++) 
		mainStage.removeChild(guardTile[i]);
	
	guardTile = drawText((6+2/3)*tileWScale, infoY, ("00"+curGuardDeadNo).slice(-3), mainStage);
}


function drawTime(decTime)
{
	if(curTime <= 0) return;
	if(decTime) curTime--;
	if(curTime < 0) { curTime = 0;}
	
	for(var i = 0; i < timeTile.length; i++) 
		mainStage.removeChild(timeTile[i]);

	timeTile = drawText((15+1/3)*tileWScale, infoY, ("00"+curTime).slice(-3), mainStage);
}

function setGroundInfoOrder()
{
	var i;

	for(i = 0; i < groundTile.length; i++) moveChild2Top(mainStage, groundTile[i]);
	
	if(playMode == PLAY_CLASSIC || playMode == PLAY_AUTO || playMode == PLAY_DEMO) {
		for(i = 0; i < scoreTxt.length; i++) moveChild2Top(mainStage, scoreTxt[i]);
		for(i = 0; i < scoreTile.length; i++) moveChild2Top(mainStage, scoreTile[i]);

		if(playMode == PLAY_DEMO) {
			for(i = 0; i < demoTxt.length; i++) moveChild2Top(mainStage, demoTxt[i]);
		} else {
			for(i = 0; i < lifeTxt.length; i++) moveChild2Top(mainStage, lifeTxt[i]);
			for(i = 0; i < lifeTile.length; i++) moveChild2Top(mainStage, lifeTile[i]);
		}
	} else {
		for(i = 0; i < goldTxt.length; i++) moveChild2Top(mainStage, goldTxt[i]);
		for(i = 0; i < goldTile.length; i++) moveChild2Top(mainStage, goldTile[i]);

		for(i = 0; i < guardTxt.length; i++) moveChild2Top(mainStage, guardTxt[i]);
		for(i = 0; i < guardTile.length; i++) moveChild2Top(mainStage, guardTile[i]);

		for(i = 0; i < timeTxt.length; i++) moveChild2Top(mainStage, timeTxt[i]);
		for(i = 0; i < timeTile.length; i++) moveChild2Top(mainStage, timeTile[i]);
	}
	
	for(i = 0; i < levelTxt.length; i++) moveChild2Top(mainStage, levelTxt[i]);
	for(i = 0; i < levelTile.length; i++) moveChild2Top(mainStage, levelTile[i]);
}

function drawText(x, y, str, parentObj, numberType)
{
	var text = str.toUpperCase();
	var textTile = [];
	
	if(typeof numberType == "undefined") numberType = "N";
	
	for(var i = 0; i < text.length; i++) {
		var code = text.charCodeAt(i);
		
		switch(true) {
		case (code >=48 && code <=57): //N0 ~ N9 or D0 ~ D9 
			textTile[i] = new createjs.Sprite(textData, numberType+String.fromCharCode(code));	
			break;
		case (code >=65 && code <= 90):
			textTile[i] = new createjs.Sprite(textData, String.fromCharCode(code));	
			break;
		case (code == 46): //'.'
			textTile[i] = new createjs.Sprite(textData, "DOT");	
			break;
		case (code == 60): //'<'
			textTile[i] = new createjs.Sprite(textData, "LT");	
			break;
		case (code == 62): //'>'
			textTile[i] = new createjs.Sprite(textData, "GT");	
			break;
		case (code == 45): //'-'
			textTile[i] = new createjs.Sprite(textData, "DASH");	
			break;
		case (code == 35): //'#': guard dead in trap hole
			textTile[i] = new createjs.Sprite(textData, String.fromCharCode(code));	
			break;
		case (code == 64): //'@': gold
			textTile[i] = new createjs.Sprite(textData, String.fromCharCode(code));	
			break;
		default: //space
			textTile[i] = new createjs.Sprite(textData, "SPACE");	
			break;
		}
		textTile[i].setTransform(x + i*tileWScale, y, tileScale, tileScale).stop();
		parentObj.addChild(textTile[i]); 
	}
	return textTile;	
}

var playTickTimer = 0;
function playGame(deltaS)
{
	if(goldComplete && runner.pos.y == 0 && runner.pos.yOffset == 0) {
		gameState = GAME_FINISH;
		return;
	}
	
	if(++playTickTimer >= TICK_COUNT_PER_TIME) {
		if(playMode != PLAY_CLASSIC && playMode != PLAY_AUTO && playMode != PLAY_DEMO) drawTime(1);
		playTickTimer = 0;
	}
	
 	//runner.xMove = 4 * tileScale * 2;
 	//runner.yMove = 4 * tileScale * 2;
	if(playMode == PLAY_AUTO || playMode == PLAY_DEMO) playDemo();
	if(recordMode) processRecordKey();
	if(!isDigging()) moveRunner();
	if(gameState != GAME_RUNNER_DEAD) moveGuard();
}

//***********************
// BEGIN show new level *
//***********************
function showLevel(levelMap)
{
	mainStage.removeAllChildren();
	
	loadingTxt.text = "";
	//loadingTxt.text = tileScale;  //for debug
	mainStage.addChild(loadingTxt); //for debug

	initVariable();	
	setBackground();
	
	buildLevelMap(levelMap);
	
	buildGroundInfo();
}

var tipsText = null;
var tipsRect = null;
function showTipsText(text, always)
{
	var x, y, width, height;
	
	if(tipsText != null) {
		mainStage.removeChild(tipsText);
	}
	if(tipsRect != null) {
		mainStage.removeChild(tipsRect);
	}	
	
	tipsText = new createjs.Text("test", "bold " +  (48*tileScale) + "px Helvetica", "#ee1122");
	tipsText.text = text;
	tipsText.set({alpha:1});
	if(text.length) {
		width = tipsText.getBounds().width;
		height = tipsText.getBounds().height;
	} else {
		width = height = 0;
	}
	x = tipsText.x = (canvas.width - width) / 2 | 0;
	y = tipsText.y = (NO_OF_TILES_Y*tileHScale - height) / 2 | 0;
	tipsText.shadow = new createjs.Shadow("white", 2, 2, 1);
	
	tipsRect = new createjs.Shape();
    tipsRect.graphics.beginFill("#020722");
    tipsRect.graphics.drawRect(-1, -1,width+2, height+2);	
	tipsRect.setTransform(x, y+5).set({alpha:0.8});

	mainStage.addChild(tipsRect);
	mainStage.addChild(tipsText);
	
	if(!always){
		createjs.Tween.get(tipsRect,{override:true}).set({alpha:0.8}).to({alpha:0}, 1000);
		createjs.Tween.get(tipsText,{override:true}).set({alpha:1}).to({alpha:0}, 1000);
	}
	mainStage.update();
}

var dspTrapTile = 0;
function toggleTrapTile()
{
	dspTrapTile ^= 1;
	
	for(var y = 0; y < NO_OF_TILES_Y; y++) {
		for(var x = 0; x < NO_OF_TILES_X; x++) {
			if( map[x][y].base == TRAP_T) {
				if(dspTrapTile) {
					map[x][y].bitmap.set({alpha:0.5}); //hidden tile
				} else {
					map[x][y].bitmap.set({alpha:1}); //display tile
				}
			}
		}
	}
	
	if(dspTrapTile) {		
		showTipsText("SHOW TRAP TILE", 0);
	} else {
		showTipsText("HIDE TRAP TILE", 0);
	}
	
}

function startAllSpriteObj()
{
	//(1) runner stop
	if(runner && !runner.paused) runner.sprite.play();
	
	//(2) guard stop
	for(var i = 0; i < guardCount; i++) {
		if(!guard[i].paused) guard[i].sprite.play();
	}
	
	//(3) fill hole stop
	for(var i = 0; i < fillHoleObj.length; i++)
		fillHoleObj[i].play();
	
	//(4) hole digging
	if(holeObj.action == ACT_DIGGING) holeObj.sprite.play();
}

function stopAllSpriteObj()
{
	//(1) runner stop
	if(runner) {
		runner.paused = runner.sprite.paused;
		runner.sprite.stop();
	}
	
	//(2) guard stop
	for(var i = 0; i < guardCount; i++) {
		guard[i].paused = guard[i].sprite.paused;
		guard[i].sprite.stop();
	}
	
	//(3) fill hole stop
	for(var i = 0; i < fillHoleObj.length; i++)
		fillHoleObj[i].stop();
	
	//(4) hole digging
	if(holeObj.action == ACT_DIGGING) holeObj.sprite.stop();
	
}

function gameOverAnimation()
{
	var gameOverImage = new createjs.Bitmap(preload.getResult("over"));
	var bound = gameOverImage.getBounds();
	var x = (NO_OF_TILES_X*tileWScale)/2|0;
	var y = (NO_OF_TILES_Y*tileHScale)/2|0;
	var regX = (bound.width)/2|0;
	var regY = (bound.height)/2|0;
	
	
	var rectBlock = new createjs.Shape();
    rectBlock.graphics.beginFill("black");
    rectBlock.graphics.drawRect(-1, -1,bound.width+2, bound.height+2);
	
	rectBlock.setTransform(x, y, tileScale, tileScale).set({regX:regX, regY:regY});
	
	gameOverImage.setTransform(x, y, tileScale, tileScale).set({regX:regX, regY:regY});
	createjs.Tween.get(gameOverImage)
			.to({scaleY:-tileScale},80)
			.to({scaleY:tileScale},80)
			.to({scaleY:-tileScale},100)
			.to({scaleY:tileScale},100)
			.to({scaleY:-tileScale},150)
			.to({scaleY:tileScale},150)
			.to({scaleY:-tileScale},300)
			.to({scaleY:tileScale},300)
			.to({scaleY:-tileScale},450)
			.to({scaleY:tileScale},450)
			.to({scaleY:-tileScale},750)
			.to({scaleY:tileScale},750)
			.wait(1500)
			.call(function(){gameState = GAME_OVER;});
	
	mainStage.addChild(rectBlock);
	mainStage.addChild(gameOverImage);
	//stopAllSpriteObj();
}

var cycScreen, cycMaxRadius, cycDiff, cycX, cycY

function initCycVariable()
{
	cycX = NO_OF_TILES_X * tileWScale/2;
	cycY = NO_OF_TILES_Y * tileHScale/2;
	cycMaxRadius = Math.sqrt(cycX*cycX+cycY*cycY)|0+1;
	cycDiff = (cycMaxRadius/CLOSE_SCREEN_SPEED)|0;
}

function addCycScreen()
{
	cycScreen =  new createjs.Shape();
	mainStage.addChild(cycScreen);
	
	setGroundInfoOrder();
}

function removeCycScreen()
{
	mainStage.removeChild(cycScreen);
}

function newLevel(r)
{
	changingLevel = 1;
	//menuIconDisable(0);
	addCycScreen();

	//close screen
	setTimeout(function() { closingScreen(cycMaxRadius);}, 100);
}

function closingScreen(r)
{
	removeCycScreen();
	addCycScreen();
	cycScreen.graphics.beginFill("black").arc( cycX, cycY, r, 0, 2*Math.PI, true)
	cycScreen.graphics.arc( cycX, cycY, cycMaxRadius, 0, 2*Math.PI, false);
	mainStage.update();
	if(r > 0) {
		r -= cycDiff;
		if(r < cycDiff*2) r = 0;
		setTimeout(function() { closingScreen(r);}, 5);
	} else {
		var levelMap;
		
		curAiVersion = AI_VERSION; //07/04/2014
		initHotKeyVariable();      //07/09/2014
		
		if(playMode == PLAY_AUTO) getAutoDemoLevel(0);
		if(playMode == PLAY_DEMO) getNextDemoLevel();
/*		
		if(playMode == PLAY_MODERN || playMode == PLAY_EDIT) {
			curScore = 0; curGetGold = 0; curGuardDeadNo = 0;
		}
*/		
		if(playMode == PLAY_TEST) {
			levelMap = getTestLevelMap();
		} else {
			levelMap = levelData[curLevel-1];
		}
		showLevel(levelMap);
		addCycScreen();
		setTimeout(function() { openingScreen(cycDiff*2);}, 5);
	}
}

function menuIconEnable()
{
	mainMenuIconObj.enable();
	if(playMode == PLAY_MODERN || playMode == PLAY_DEMO) {
		selectIconObj.enable();
	}
}

function menuIconDisable(hidden)
{
	mainMenuIconObj.disable(hidden);
	if(playMode == PLAY_MODERN) {
		selectIconObj.disable(hidden);
	}
}

var showStartTipsMsg = 0;
function initShowDataMsg()
{
	showStartTipsMsg = 0;
}

function showDataMsg()
{
	if(!showStartTipsMsg) {
		var nameTxt = null;
		switch(playData) {
		case 1:
			nameTxt = "Lode Runner 1";
			break;
		case 2:		
			nameTxt = "Lode Runner 2";
			break;	
		case 3:
			if(playMode == PLAY_TEST) {
				nameTxt = "Test Mode";
			} else {
				nameTxt = "User Created";
			}
			break;	
		case 4:
			nameTxt = "DEMO: Lode Runner 1";
			break;
		case 5:
			nameTxt = "DEMO: Lode Runner 2";
			break;
		}
		if(nameTxt)	showTipsMsg(nameTxt, mainStage, tileScale);
		showStartTipsMsg = 1;
	}
}

function initForPlay()
{
	menuIconEnable();
	showDataMsg();
}

function openingScreen(r)
{
	removeCycScreen();
	addCycScreen();
	cycScreen.graphics.beginFill("black").arc( cycX, cycY, r, 0, 2*Math.PI, true)
	cycScreen.graphics.arc( cycX, cycY, cycMaxRadius, 0, 2*Math.PI, false);
	mainStage.update();
	if(r < cycMaxRadius) {
		r += cycDiff;
		if(r > cycMaxRadius) r = cycMaxRadius;
		setTimeout(function() { openingScreen(r);}, 5);
	} else {
		removeCycScreen();
		gameState = GAME_START;
		keyAction = ACT_STOP;
		runner.sprite.gotoAndPlay();
		changingLevel = 0;
		
		if(recordMode) initRecordVariable();
		if(playMode == PLAY_AUTO || playMode == PLAY_DEMO) {
			initPlayDemo();
			if(playMode == PLAY_DEMO) initForPlay();
		} else { 
			if(firstPlay) { 
				firstPlay = 0;
				helpObj.showHelp(0, initForPlay, null); 
			} else {	
				initForPlay();
			}
			if(playMode != PLAY_TEST) {
				enableAutoDemoTimer(); //while start game and idle too long will into demo mode
			}
		}
	}
}

function incLevel(incValue)
{
	curLevel += incValue;
	while (curLevel > levelData.length) curLevel-= levelData.length;
	if(playMode == PLAY_CLASSIC) setClassicInfo();
	if(playMode == PLAY_MODERN) setModernInfo();
}

function decLevel(decValue)
{
	curLevel -= decValue
	while (curLevel <= 0) curLevel += levelData.length;
	if(playMode == PLAY_CLASSIC) setClassicInfo();
	if(playMode == PLAY_MODERN) setModernInfo();
}


function updateModernScoreInfo()
{
	var lastHiScore = modernScoreInfo[curLevel-1];
	var levelScore = (curTime + curGetGold + curGuardDeadNo) * SCORE_VALUE_PER_POINT;
	
	if(lastHiScore < levelScore) {
		modernScoreInfo[curLevel-1] = (curTime + curGetGold + curGuardDeadNo) * SCORE_VALUE_PER_POINT;
		setModernScoreInfo();
	}
	
	if(lastHiScore < 0) lastHiScore = 0;
	
	return lastHiScore;
}

function gameFinishActiveNew(level)
{
	curLevel = level;
	setModernInfo();
	startGame();
}

function gameFinishCloseIcon()
{
	startGame();
}

function gameFinishCallback(selectMode)
{
	switch(selectMode) {
	case 0: //return (same level)
		gameState = GAME_NEW_LEVEL;
		break;
	case 1: //menu selection
		//incLevel(1);	
		activeSelectMenu(gameFinishActiveNew, gameFinishCloseIcon, null)	
		break;
	case 2: //new level
		incLevel(1);	
		gameState = GAME_NEW_LEVEL;
		break;
	default:
		debug("design error !");	
		break;	
	}
}

function gameFinishTestModeCallback()
{
	back2EditMode(1);
}

var lastScoreTime, scoreDuration;
var scoreIncValue, finalScore;

function mainTick(event)
{ 
	var deltaS = event.delta/1000; 
	
	switch(gameState) {
	case GAME_START:
		//if(playMode == PLAY_AUTO) initPlayDemo();
		//if(recordMode) initRecordVariable();
		countAutoDemoTimer();	
		if(keyAction != ACT_STOP && keyAction != ACT_UNKNOWN) {
			disableAutoDemoTimer();	
			gameState = GAME_RUNNING;
			playTickTimer = 0;
			if(goldCount <= 0) showHideLaddr();
		}
		break;	
	case GAME_RUNNING:
		playGame(deltaS);
		break;
	case GAME_RUNNER_DEAD:
		//mainStage.update();

		//if(recordMode) recordModeToggle(GAME_RUNNER_DEAD); //for debug only (if enable it must disable below statement)
		if(recordMode == RECORD_KEY) recordModeDump(GAME_RUNNER_DEAD);	
			
		soundStop(soundFall);
		stopAllSpriteObj();	
		soundPlay("dead");
		switch(playMode) {
		case PLAY_CLASSIC:
		case PLAY_AUTO:
			--runnerLife;
			drawLife();	
			if(runnerLife <= 0) {
				gameOverAnimation();
				menuIconDisable(1);
				if(playMode == PLAY_CLASSIC) clearClassicInfo();
				gameState = GAME_OVER_ANIMATION;
			} else {
				//stopAllSpriteObj();
				setTimeout(function() {gameState = GAME_NEW_LEVEL; }, 500);
				gameState = GAME_WAITING;	
				if(playMode == PLAY_CLASSIC) setClassicInfo();
			}
			break;
		case PLAY_DEMO:	
			console.log("DEMO dead level=" + curLevel);	
			setTimeout(function() {incLevel(1); gameState = GAME_NEW_LEVEL; }, 500);
			gameState = GAME_WAITING;	
			break;	
		case PLAY_MODERN:		
			setTimeout(function() {gameState = GAME_NEW_LEVEL; }, 500);
			gameState = GAME_WAITING;	
			break;
		case PLAY_TEST:		
			setTimeout(function() { back2EditMode(0); }, 500);
			gameState = GAME_WAITING;	
			break;
		default:
			debug("GAME_RUNNER_DEAD: desgin error !");	
			break;	
		}
		break;	
	case GAME_OVER_ANIMATION:
		//if(playMode == PLAY_CLASSIC) clearClassicInfo();
		break;	
	case GAME_OVER:
		////getClassicInfo();
		var scoreInfo = null;	
		if(playMode == PLAY_CLASSIC) {	
			//try to set hi-score record
			scoreInfo = {s:curScore, l:(curLevel>maxLevel)?curLevel:maxLevel};
		}	
			
		showScoreTable(playData-1, scoreInfo , function() { showCoverPage();});	
		//setTimeout(function(){ showCoverPage();}, 2000);
		gameState = GAME_WAITING;	
		return;
	case GAME_FINISH: 
		stopAllSpriteObj();
			
		switch(playMode) {
		case PLAY_CLASSIC:
		case PLAY_AUTO:		
		case PLAY_DEMO:		
			soundPlay(soundPass);
			finalScore = curScore + SCORE_COMPLETE_LEVEL;
			scoreDuration = ((soundPass.getDuration()) /(SCORE_COUNTER+1))| 0;
			lastScoreTime = event.time;
			scoreIncValue = SCORE_COMPLETE_LEVEL/SCORE_COUNTER|0;
			drawScore(scoreIncValue);
			gameState = GAME_FINISH_SCORE_COUNT;	
			break;
		case PLAY_MODERN:
			soundPlay(soundEnding);
			var lastHiScore = lastHiScore = updateModernScoreInfo();
			levelPassDialog(curLevel, curGetGold, curGuardDeadNo, curTime, lastHiScore, 
						  returnBitmap, select1Bitmap, nextBitmap,
						  mainStage, tileScale, gameFinishCallback);	
			gameState = GAME_WAITING;
			break;
		case PLAY_TEST:
			soundPlay(soundEnding);
				
			setTimeout(function() { 
				////playMode = GAME_EDITING; 
				back2EditMode(1);
			},500);	
				
			gameState = GAME_WAITING;
			break;
		default:
			debug("design error!");	
			break;	
		}

		//if(recordMode) recordModeToggle(GAME_FINISH); //for debug only (if enable it must comment below if statement)
		if(recordMode == RECORD_KEY) {
			recordModeDump(GAME_FINISH);	
			
			if((playMode == PLAY_CLASSIC || playMode == PLAY_MODERN) && playData <= 2) {
				updatePlayerDemoData(playData, curDemoData); //update current player demo data
			}
		}
		break;	
	case GAME_FINISH_SCORE_COUNT:		
		if(event.time > lastScoreTime+ scoreDuration) {
			lastScoreTime += scoreDuration;
			if(curScore + scoreIncValue >= finalScore) {
				curScore = finalScore;
				drawScore(0);
				
				if(playMode == PLAY_TEST) {
					back2EditMode(1);
					break;
				} 
				if(playMode == PLAY_CLASSIC) {
					if(++runnerLife > RUNNER_MAX_LIFE) runnerLife = RUNNER_MAX_LIFE;	
				}
				gameState = GAME_NEW_LEVEL;

				if(playMode == PLAY_AUTO) {
					if(demoCount >= demoMaxCount) {
						setTimeout(function(){ showCoverPage();}, 500);	
						gameState = GAME_WAITING;	
					}
				}
				if(recordMode != RECORD_PLAY) {
					incLevel(1);
				}
			} else {
				drawScore(scoreIncValue);
			}
		}
		break;
	case GAME_NEXT_LEVEL:
		soundStop(soundFall);		
		stopAllSpriteObj();
		incLevel(shiftLevelNum);
		gameState = GAME_NEW_LEVEL; 
		return;
	case GAME_PREV_LEVEL:
		soundStop(soundFall);		
		stopAllSpriteObj();
		decLevel(shiftLevelNum);	
		gameState = GAME_NEW_LEVEL; 
		return;
	case GAME_NEW_LEVEL:
		gameState = GAME_WAITING;	
		newLevel();	
		break;
	case GAME_PAUSE:
	default:
		return;	
	}
	
	mainStage.update();
}	
