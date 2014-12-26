var RUNNER_SPEED = 0.65;  
var DIG_SPEED = 0.68;    //for support champLevel, change DIG_SPEED and FILL_SPEED, 2014/04/12
var FILL_SPEED = 0.24;
var GUARD_SPEED = 0.3;

var FLASH_SPEED = 0.25; //for flash cursor (hi-score input mode)

var COVER_PROGRESS_BAR_H = 32;
var COVER_PROGRESS_UNDER_Y = 116;
var COVER_RUNNER_UNDER_Y = 164;
var COVER_SIDE_X = 56;		

//*********************
// preload cover page
//*********************
var coverBitmap, remakeBitmap;
var helpObj, helpBitmap, editHelpBitmap, demoHelpBitmap;
var mainMenuIconBitmap, mainMenuIconObj;
var selectIconBitmap, selectIconObj;
var checkBitmap;
var returnBitmap, select1Bitmap, nextBitmap;
var yesBitmap, noBitmap;
var coverPageLoad;

function showLoadingPage() 
{
	var coverPageImages = [
		{ src: "image/cover.png",  id: "cover" },
		{ src: "image/runner.png",  id: "runner" }
	];
		
	coverPageLoad = new createjs.LoadQueue(true);
	coverPageLoad.on("error", handleCoverPageError);
	coverPageLoad.on("fileload", handleCoverPageFileLoad);
	coverPageLoad.on("complete", handleCoverPageComplete);
	coverPageLoad.loadManifest(coverPageImages);
		
	function handleCoverPageError(e)
	{
		console.log("error", e);
	}

	function handleCoverPageFileLoad(e)
	{
		switch(e.item.id) {	
		case "cover":	
			addCover2Screen(e.result);
			break;
		case "runner":
			createRunnerSpriteSheet(e.result);
			break;
		} 
	}

	function handleCoverPageComplete(e)
	{
		preloadResource();
	}
		
	function addCover2Screen(image)
	{
		coverBitmap = new createjs.Bitmap(image);
		coverBitmap.setTransform(0, 0, tileScale, tileScale); //x,y, scaleX, scaleY 
		mainStage.addChild(coverBitmap);	
		mainStage.update();	
	}
}

function createRunnerSpriteSheet(runnerImage)
{
	runnerData = new createjs.SpriteSheet({
		images: [runnerImage],
		
		frames: { regX:0, height: BASE_TILE_Y,  regY:0, width: BASE_TILE_X},
		
		animations: { 
			runRight: [0,2, "runRight", RUNNER_SPEED], 
			runLeft : [3,5, "runLeft",  RUNNER_SPEED], 
			runUpDn : [6,7, "runUpDn",  RUNNER_SPEED],

			barRight: {
				frames: [ 9, 10, 10, 11, 11 ],
				next:  "barRight",
				speed: RUNNER_SPEED
			},

			barLeft: {
				frames: [ 12, 13, 13, 14, 14 ],
				next:  "barLeft",
				speed: RUNNER_SPEED
			},
					 
			digRight: 15,
			digLeft : 16,

			fallRight : 8,
			fallLeft: 17
		} 
	});
}

//*****************************************************************************		
//BEGIN of preload		
//*****************************************************************************		
var preload; //preload resource object
var firstPlay = 0;

var runnerData, guardData;
var holeData, holeObj = {};
var textData;

var soundFall, soundDig, soundPass, soundEnding;

function preloadResource() 
{
	var runnerSprite = new createjs.Sprite(runnerData, "runRight");
	var progress = new createjs.Shape(); 
	var progressBorder = new createjs.Shape();
	var percentTxt = new createjs.Text("0", (COVER_PROGRESS_BAR_H* tileScale) + "px Arial", "#FF0000");

	var resource = [
		{ src: "image/remake.png",  id: "remake" },

		{ src: "image/empty.png",   id: "empty" },
		{ src: "image/brick.png",   id: "brick" },
		{ src: "image/block.png",   id: "solid" },
		{ src: "image/ladder.png",  id: "ladder" },
		{ src: "image/rope.png",    id: "rope" },
		{ src: "image/trap.png",    id: "trapBrick" },
		{ src: "image/hladder.png", id: "hladder" },
		{ src: "image/gold.png",    id: "gold" },
		{ src: "image/guard1.png",  id: "guard1" },
		{ src: "image/runner1.png", id: "runner1" },
		{ src: "image/eraser.png",  id: "eraser" },
	
		{ src: "image/guard.png",   id: "guard" },
		{ src: "image/hole.png",    id: "hole" },
		{ src: "image/over.png",    id: "over" },
	
		{ src: "image/ground.png",  id: "ground" },
		{ src: "image/text.png",    id: "text" },
	
		{ src: "image/help.png",    id: "help" },
		{ src: "image/editHelp.png",id: "editHelp" },
		{ src: "image/demoHelp.png",id: "demoHelp" },
		
		{ src: "image/menu.png",    id: "menu" },
		{ src: "image/select.png",  id: "select" },
		{ src: "image/check.png",   id: "check" }, //check icon for select menu
		
		{ src: "image/return.png",  id: "return" },
		{ src: "image/select1.png", id: "select1" },
		{ src: "image/next.png",    id: "next" },
		
		{ src: "image/yes.png",     id: "yes" },
		{ src: "image/no.png",      id: "no" },
		
	
		{ src: "sound/born.ogg",    id:"reborn"},
		{ src: "sound/dead.ogg",    id:"dead"},
		{ src: "sound/dig.ogg",     id:"dig"},
		{ src: "sound/getGold.ogg", id:"getGold"},
		{ src: "sound/fall.ogg",    id:"fall"},
		{ src: "sound/down.ogg",    id:"down"},
		{ src: "sound/pass.ogg",    id:"pass"},
		{ src: "sound/trap.ogg",    id:"trap"},
		
		{ src: "sound/goldFinish.ogg",  id:"goldFinish"},
		{ src: "sound/ending.ogg",      id:"ending"},
		{ src: "sound/scoreBell.ogg",   id:"scoreBell"},
		{ src: "sound/scoreCount.ogg",  id:"scoreCount"},
		{ src: "sound/scoreEnding.ogg", id:"scoreEnding"},
		
		{ src: "sound/beep.ogg", id:"beep"},
		
		{ src: "cursor/openhand.cur", id:"openHand"}, //preload cursor
		{ src: "cursor/closedhand.cur", id:"closeHand"}
		
	];	
	
	preload = new createjs.LoadQueue(true);
	createjs.Sound.alternateExtensions = ["mp3"];
	preload.installPlugin(createjs.Sound);
	preload.on("error", handleFileError);
	preload.on("progress", handleProgress);
	preload.on("complete", handleComplete);

	preload.loadManifest(resource);

	createjs.Ticker.setFPS(30);
	var preloadTicker = createjs.Ticker.on("tick", mainStage);

	//Set runner sprite size & position
	runnerSprite.setTransform(COVER_SIDE_X* tileScale, 
							  (BASE_SCREEN_Y - COVER_RUNNER_UNDER_Y)* tileScale,
							  tileScale, 
							  tileScale);
	runnerSprite.gotoAndPlay();	

	var width = canvas.width - 2*COVER_SIDE_X* tileScale;
	var height = COVER_PROGRESS_BAR_H * tileScale;

	//Set progress & progressborder size & position
	progressBorder.graphics.beginStroke("gold").drawRect(0,0,width,height);
	progress.x = progressBorder.x = COVER_SIDE_X * tileScale;
	progress.y = progressBorder.y = (BASE_SCREEN_Y - COVER_PROGRESS_UNDER_Y) * tileScale;
	
	//Set percentTxt position
	percentTxt.x = (canvas.width - percentTxt.getBounds().width) / 2 | 0;
	percentTxt.y = (BASE_SCREEN_Y - COVER_PROGRESS_UNDER_Y) * tileScale;
	
	mainStage.addChild(runnerSprite, progress, progressBorder, percentTxt);
	
	function handleFileError(event) 
	{
		console.log("error", event);
	}

	function handleProgress(event) 
	{
		progress.graphics.clear();
		progress.graphics.beginFill("gold").drawRect(0,0,width*(event.loaded / event.total),height);
		percentTxt.text = (100*(event.loaded / event.total)|0) + "%";
		percentTxt.x = (canvas.width - percentTxt.getBounds().width) / 2 | 0;
	}

	function handleComplete(event) 
	{
		percentTxt.text = "100%";
		mainStage.update();
		createPreloadSpriteSheet();
		createSoundInstance();
		setTimeout(clearLoadingInfo, 500);
	}
	
	
	function createSoundInstance()
	{
		soundFall = createjs.Sound.createInstance("fall"); 
		soundDig = createjs.Sound.createInstance("dig");
		soundPass = createjs.Sound.createInstance("pass");
		
		soundEnding = createjs.Sound.createInstance("ending");
		
	}
	
	function clearLoadingInfo()
	{
		mainStage.removeChild(runnerSprite, progress, progressBorder, percentTxt);
		showRemakeBitmap();
		mainStage.addChild(remakeBitmap);
		mainStage.update();
	}
	
	//create remake 2014 
	function showRemakeBitmap()
	{
		var x = 372 * tileScale;
		var y = 128 * tileScale;
		remakeBitmap = new createjs.Bitmap(preload.getResult("remake"));
		remakeBitmap.setTransform(x, y, tileScale, tileScale); //x,y, scaleX, scaleY 
		remakeBitmap.rotation = -5;
		remakeBitmap.set({alpha:0});
		createjs.Tween.get(remakeBitmap).set({alpha:0}).to({alpha:1}, 500).call(preloadComplet);
	}
	
	function createHelpObj()
	{
		helpBitmap = new createjs.Bitmap(preload.getResult("help"));
		editHelpBitmap = new createjs.Bitmap(preload.getResult("editHelp"));
		demoHelpBitmap = new createjs.Bitmap(preload.getResult("demoHelp"));
		
		helpObj = new helpMenuClass(mainStage, helpBitmap, editHelpBitmap, demoHelpBitmap, tileScale);
	}
	
	function createMenuBitmapIcon()
	{
		mainMenuIconBitmap = new createjs.Bitmap(preload.getResult("menu"));
		mainMenuIconObj = new mainMenuIconClass(screenX1, screenY1, tileScale, mainMenuIconBitmap);
		
		selectIconBitmap = new  createjs.Bitmap(preload.getResult("select"));
		selectIconObj = new selectIconClass(screenX1, screenY1, tileScale, selectIconBitmap); 
		
		
		checkBitmap = new  createjs.Bitmap(preload.getResult("check"));
		
		returnBitmap = new createjs.Bitmap(preload.getResult("return"));
		select1Bitmap = new createjs.Bitmap(preload.getResult("select1"));
		nextBitmap = new createjs.Bitmap(preload.getResult("next"));
		
		yesBitmap = new createjs.Bitmap(preload.getResult("yes"));
		noBitmap = new createjs.Bitmap(preload.getResult("no"));
		
	}
	
	function getFirstPlayInfo()
	{
		if(getStorage(STORAGE_FIRST_PLAY) == null) {
			firstPlay = 1;
			setStorage(STORAGE_FIRST_PLAY, 1);
		}
	}
	
	function preloadComplet()
	{
		createHelpObj();
		createMenuBitmapIcon();
		getFirstPlayInfo();
		createjs.Ticker.off("tick", preloadTicker); //remove ticker of cover page
		waitIdleDemo(4000); //wait user key or show demo level
	}
}

//==============================
// support different AI-version 
//==============================

var spriteSpeed = [
	{ runnerSpeed: 0.65, guardSpeed: 0.3,  digSpeed: 0.68, fillSpeed: 0.24, xMoveBase: 8, yMoveBase: 8 }, //ver 1
	{ runnerSpeed: 0.70, guardSpeed: 0.35, digSpeed: 0.68, fillSpeed: 0.27, xMoveBase: 8, yMoveBase: 9 }  //ver 2
];

var curAiVersion = AI_VERSION;		
function setSpeedByAiVersion()
{
	var speedObj = spriteSpeed[curAiVersion-1];
	
	RUNNER_SPEED = speedObj.runnerSpeed;
	GUARD_SPEED = speedObj.guardSpeed;
	DIG_SPEED = speedObj.digSpeed;
	FILL_SPEED = speedObj.fillSpeed;
	
	//xMove = speedObj.xMoveBase * tileScale; //8, 6, 4 (10, 7.5, 5)
 	//yMove = speedObj.yMoveBase * tileScale;	//8, 6, 4 (10, 7.5, 5)	
	xMove = speedObj.xMoveBase; 
 	yMove = speedObj.yMoveBase;
	
	//W4 = (tileW/4|0)+ speedObj.w4; //no used
	//H4 = (tileH/4|0)+ speedObj.h4;
	
	createSpriteSheet();
}

function createSpriteSheet()
{
	createRunnerSpriteSheet(coverPageLoad.getResult("runner"));
	createPreloadSpriteSheet();
}

function createPreloadSpriteSheet() 
{
	guardData = new createjs.SpriteSheet({
		images: [preload.getResult("guard")],
		
		frames: {regX:0, height: BASE_TILE_Y,  regY: 0, width: BASE_TILE_X},
		
		animations: { 
			runRight: [0,2,  "runRight", GUARD_SPEED], 
			runLeft : [3,5,  "runLeft",  GUARD_SPEED],
			runUpDn : [6,7,  "runUpDn",  GUARD_SPEED],
					 
			barRight: {
				frames: [ 11, 12, 12, 13, 13 ],
				next:  "barRight",
					speed: GUARD_SPEED
			},
				 
			barLeft: {
				frames: [ 14, 15, 15, 16, 16 ],
				next:  "barLeft",
				speed: GUARD_SPEED
			},
			
			reborn: {
				frames: [ 17, 17, 18 ],
				speed: GUARD_SPEED
			},
					 
			fallRight : 8,
			fallLeft: 19,
			
			shakeRight: {
				frames: [ 8, 8, 8, 8, 8, 8, 8,
				          8, 8, 8, 8, 8, 8,
				          9, 10, 9, 10, 8 ],
				next: null,
				speed: GUARD_SPEED
			},
			
			shakeLeft: {
				frames: [ 19, 19, 19, 19, 19, 19, 19,
				          19, 19, 19, 19, 19, 19, 
				          20, 21, 20, 21, 19],
				next: null,
				speed: GUARD_SPEED
			}
					
		}
	});
	
	holeData = new createjs.SpriteSheet( {
		images: [preload.getResult("hole")],
		
		frames: [
			//dig hole Left
			[BASE_TILE_X*0,0,BASE_TILE_X,BASE_TILE_Y*2], //0 [x,y, width, height]
			[BASE_TILE_X*1,0,BASE_TILE_X,BASE_TILE_Y*2], //1
			[BASE_TILE_X*2,0,BASE_TILE_X,BASE_TILE_Y*2], //2
			[BASE_TILE_X*3,0,BASE_TILE_X,BASE_TILE_Y*2], //3
			[BASE_TILE_X*4,0,BASE_TILE_X,BASE_TILE_Y*2], //4
			[BASE_TILE_X*5,0,BASE_TILE_X,BASE_TILE_Y*2], //5
			[BASE_TILE_X*6,0,BASE_TILE_X,BASE_TILE_Y*2], //6
			[BASE_TILE_X*7,0,BASE_TILE_X,BASE_TILE_Y*2], //7
			
			//dig hole right
			[BASE_TILE_X*0,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //08
			[BASE_TILE_X*1,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //09
			[BASE_TILE_X*2,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //10
			[BASE_TILE_X*3,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //11
			[BASE_TILE_X*4,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //12
			[BASE_TILE_X*5,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //13
			[BASE_TILE_X*6,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //14
			[BASE_TILE_X*7,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y*2], //15
			
			//fill hole
			[BASE_TILE_X*8,0,            BASE_TILE_X,BASE_TILE_Y], //16
			[BASE_TILE_X*8,BASE_TILE_Y,  BASE_TILE_X,BASE_TILE_Y], //17
			[BASE_TILE_X*8,BASE_TILE_Y*2,BASE_TILE_X,BASE_TILE_Y], //18
			[BASE_TILE_X*8,BASE_TILE_Y*3,BASE_TILE_X,BASE_TILE_Y]  //19
		],	
		
		animations: { 
			digHoleLeft:  [0, 7, false, DIG_SPEED],
			digHoleRight: [8,15, false, DIG_SPEED],
			fillHole: { 
				frames: [16, 16, 16, 16, 16, 16, 16, 16, 16,
				         16, 16, 16, 16, 16, 16, 16, 16, 16,
				         16, 16, 16, 16, 16, 16, 16, 16, 16,
				         16, 16, 16, 16, 16, 16, 16, 16, 16, 
				         16, 16, 16, 16, 16, 16, 16, 16, 16,
				         17, 17, 18, 18, 19 ], //delay fill time for champLevel, 2014/04/12
				next:  false,
				speed: FILL_SPEED
			}		
		}
	});
	
	holeObj.sprite = new createjs.Sprite(holeData, "digHoleLeft");
	holeObj.action = ACT_STOP; //no digging 

	textData = new createjs.SpriteSheet({
		images: [preload.getResult("text")],
		
		frames: {regX:0, height: BASE_TILE_Y,  regY: 0, width: BASE_TILE_X},
		
		animations: { 
			"N0": 0, "N1": 1, "N2": 2, "N3": 3, "N4": 4, 
			"N5": 5, "N6": 6, "N7": 7, "N8": 8, "N9": 9,
			"A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15, "G": 16, "H": 17,
			"I": 18, "J": 19, "K": 20, "L": 21, "M": 22, "N": 23, "O": 24, "P": 25,
			"Q": 26, "R": 27, "S": 28, "T": 29, "U": 30, "V": 31, "W": 32, "X": 33,
			"Y": 34, "Z": 35, 
			"DOT": 36, "LT": 37, "GT": 38, "DASH": 39,
			"@":40,  //gold
			"#":41,  //trap
			"SPACE":43, 
			"FLASH": { //42 & 43 
				frames: [42, 42, 42, 43, 43, 43],
				next: "FLASH",
				speed: FLASH_SPEED
			},
			"D0": 50, "D1": 51, "D2": 52, "D3": 53, "D4": 54,  //blue digit number for player name, 11/17/2014
 			"D5": 55, "D6": 56, "D7": 57, "D8": 58, "D9": 59
		}
	});
}