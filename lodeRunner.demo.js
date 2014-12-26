/////////////////
// Auto Demo 
/////////////////

var demoRecordIdx, demoGoldIdx, demoBornIdx;
var	demoTickCount;
var demoRnd, demoIdx;

function initAutoDemoRnd()
{
	demoRnd = [];
	demoRnd[0] = new rangeRandom(0, demoData1.length-1, 0); //random range 0 .. demoData1.length-1
/* auto demo data always use demoData1 (because now can select demo levels from demo mode) , 6/12/2014	
	demoRnd[1] = new rangeRandom(0, demoData2.length-1, 0); //random range 0 .. demoData1.length-2
*/	
}

var demoRecord, demoGoldDrop, demoBornPos;
var demoLevel, demoData, demoCount, demoMaxCount;
function getAutoDemoLevel(initValue)
{
	if(initValue) {
		curScore = 0;	
		runnerLife = 1;
/* auto demo data always use demoData1 (because now can select demo levels from demo mode) , 6/12/2014		
		if(playData == 2) { //lode runner 2 demo data
			demoLevel = 1;
			demoCount = 1;
			demoMaxCount = 2;
			demoData = demoData2;
			levelData = levelData2;
			demoIdx = 1;
		} else { //lode runner 1 demo data
*/		
			demoLevel = 1;
			demoCount = 1;
			demoMaxCount = 3;
			demoData = demoData1;
			levelData = levelData1;
			demoIdx = 0;
//		}
	} else {
		demoLevel++;
		demoCount++;
	}
	var idx = demoRnd[demoIdx].get();
		
	demoRecord = demoData[idx].action;
	demoGoldDrop = demoData[idx].goldDrop;
	demoBornPos = demoData[idx].bornPos;
	curLevel = demoData[idx].level;
	
	curAiVersion = demoData[idx].ai; //07/04/2014
	if("godMode" in demoData[idx]) 
		godMode = demoData[idx].godMode; //07/09/2014
}

var demoCountTime = 0, demoCountEnable = 0;
function enableAutoDemoTimer()
{
	demoCountEnable = 1;
	demoCountTime = 0;
}

function disableAutoDemoTimer()
{
	demoCountEnable = 0;
}

function countAutoDemoTimer()
{
	if(demoCountEnable) {
		demoCountTime++;
		//debug(demoCountTime);
		if(demoCountTime > MAX_DEMO_WAIT_COUNT) {
			disableAutoDemoTimer();
			gameState = GAME_WAITING;	
			showCoverPage();
		}
	}
}

//=====================================
// function for auto demo & demo mode
//=====================================

function initPlayDemo()
{
	demoRecordIdx = demoGoldIdx = demoBornIdx = 0;
	demoTickCount = 0;
	gameState = GAME_RUNNING;
}

function playDemo()
{
	if(demoRecordIdx < demoRecord.length) {
		if(demoRecord[demoRecordIdx*2] == demoTickCount) {
			//loadingTxt.text = demoRecordIdx + " " + demoTickCount ; //for debug
			pressKey(demoRecord[demoRecordIdx*2+1]);
			demoRecordIdx++;
		}
	}
	demoTickCount++;
}

function getDemoGold(guard)
{
	guard.hasGold = demoGoldDrop[demoGoldIdx++];
}

function getDemoBornPos()
{
	if(demoBornPos[0] == 2) {
		demoBornIdx += 2;
		return { x: demoBornPos[demoBornIdx-1], y: demoBornPos[demoBornIdx] };
	} else {
		return { x: demoBornPos[++demoBornIdx], y: 1 };
	}
}

//====================================
// for demo mode (User select level)
//====================================

var playerDemoData1 = [], playerDemoData2 = [];
var noDemoData1 = 1, noDemoData2 = 1;

var wHighScores1 = [], wHighScores2 = [];
var wDemoData1 = [], wDemoData2 = [];

function initDemoModeVariable()
{
	for(var i = 0; i < wDemoData1.length; i++) {
		playerDemoData1[wDemoData1[i].level-1] = wDemoData1[i]; 
	}
	
	for(var i = 0; i < wDemoData2.length; i++) {
		playerDemoData2[wDemoData2[i].level-1] = wDemoData2[i]; 
	}
	
	if(playerDemoData1.length > 0) noDemoData1 = 0;
	if(playerDemoData2.length > 0) noDemoData2 = 0;
}

function initDemoInfo()
{
	var idx = curLevel - 1;
	
	curScore = 0;	
	runnerLife = 1;
		
	demoRecord = demoData[idx].action;
	demoGoldDrop = demoData[idx].goldDrop;
	demoBornPos = demoData[idx].bornPos;
	assert(curLevel == demoData[idx].level, "curLevel != level of demoData");	
	
	curAiVersion = demoData[idx].ai; //07/04/2014
	if("godMode" in demoData[idx]) 
		godMode = demoData[idx].godMode; //07/09/2014
}

function getDemoInfo()
{
	var infoJSON;
	
	if(playData == 5) {
		infoJSON = getStorage(STORAGE_DEMO_INFO2); 
		levelData = levelData2;
		demoData = playerDemoData2;
	} else {
		infoJSON = getStorage(STORAGE_DEMO_INFO1); 
		levelData = levelData1;
		demoData = playerDemoData1;
	} 

	if(infoJSON == null) {
		curLevel = 1;
	} else {
		var infoObj = JSON.parse(infoJSON);
		curLevel = infoObj.l;
	}
	getValidDemoLevel();
	initDemoInfo();	
}

function setDemoInfo()
{
	var infoObj = { l:curLevel};
	var infoJSON = JSON.stringify(infoObj);
	
	switch(playData) {
	default:
	case 4:		
		setStorage(STORAGE_DEMO_INFO1, infoJSON); 
		break;
	case 5:
		setStorage(STORAGE_DEMO_INFO2, infoJSON);
		break;	
	}
}

function getValidDemoLevel()
{
	while(typeof demoData[curLevel-1] == "undefined") {
		if(++curLevel > levelData.length) curLevel = 1;
	}
}

function getNextDemoLevel()
{
	getValidDemoLevel();
	setDemoInfo();
	initDemoInfo();
}

function updatePlayerDemoData(playData, demoDataInfo)
{
	var playerDemoData = null;
	var level = demoDataInfo.level;
	
	switch(playData) {
	case 1:
		playerDemoData = playerDemoData1;
		break;
	case 2:
		playerDemoData = playerDemoData2;
		break;
	}
	
	if(playerDemoData != null) {
		if(typeof playerDemoData[level-1] == "undefined") {
			// new
			playerDemoData[level-1] = { 
				level: demoDataInfo.level, 
				ai: demoDataInfo.ai, 
				time: demoDataInfo.time, 
				state: demoDataInfo.state,
				action: demoDataInfo.action,
				goldDrop: demoDataInfo.goldDrop,
				bornPos: demoDataInfo.bornPos,
				godMode: demoDataInfo.godMode //07/09/2014
			};
		} else {  // always update local data 
			//if( playerDemoData[level-1].time >= demoDataInfo.time) { //only udate best time
			
			//update
			playerDemoData[level-1].level = demoDataInfo.level;
			playerDemoData[level-1].ai = demoDataInfo.ai;
			playerDemoData[level-1].time = demoDataInfo.time;
			playerDemoData[level-1].state = demoDataInfo.state;
			playerDemoData[level-1].action = demoDataInfo.action;
			playerDemoData[level-1].goldDrop = demoDataInfo.goldDrop;
			playerDemoData[level-1].bornPos = demoDataInfo.bornPos;
			playerDemoData[level-1].godMode = demoDataInfo.godMode; //07/09/2014
			
		}
	}
}

//==============================
// Record play action for demo
//==============================

var RECORD_NONE = 0, RECORD_KEY = 1, RECORD_PLAY = 2;
var recordMode = RECORD_KEY; 
//var recordMode = RECORD_NONE; 

var recordCount, recordKeyCode = 0, lastKeyCode = -1;
var playRecord, goldRecord, bornRecord;
var goldRecordIdx, bornRecordIdx;
var playRecordTime, recordState;

function initRecordVariable()
{
	recordCount = 0;
	goldRecordIdx = 0;
	bornRecordIdx = 0;
	playRecordTime = 0;

	switch(recordMode) {
	case RECORD_KEY:
		recordKeyCode = 0;
		lastKeyCode = -1;	
		playRecord = [];
		goldRecord = [];
		bornRecord = [];
		break;
	case RECORD_PLAY:		
		recordIdx = 0;
		gameState = GAME_RUNNING;
		break;
	}
}

var alwaysRecord = 0, keyPressed = 0;
function saveKeyCode(code, keyAction)
{
	//-----------------------------------------------------------------------------
	// Don't care repeat times, always record key when press dig-left or dig-right 
	// fixed by Simon 12/12/2014
	//-----------------------------------------------------------------------------
	alwaysRecord = 0;
	if(keyAction == ACT_DIG_LEFT || keyAction == ACT_DIG_RIGHT) alwaysRecord = 1;
		
	recordKeyCode = code;
	keyPressed = 1;
}

function recordModeDump(state)
{
	recordPlayTime(state);
	convertBornPos();
	dumpRecord();
}

function recordModeToggle(state)
{
	if(recordMode == RECORD_KEY) {
		if(playMode != PLAY_AUTO && playMode != PLAY_DEMO) recordMode = RECORD_PLAY;
		recordModeDump(state);
	} else recordMode = RECORD_KEY;
}

function processRecordKey()
{
	switch(recordMode) {
	case RECORD_KEY: //record the play key action
		recordKeyAction();
		break;
	case RECORD_PLAY: //play the record key 
		recordPlayDemo();
		break;
	}	
	recordCount++;
}

function recordKeyAction()
{
	if(!keyPressed) return;
	if(recordKeyCode != lastKeyCode || alwaysRecord) {
		playRecord.push(recordCount);
		playRecord.push(recordKeyCode);
		lastKeyCode = recordKeyCode;
	}
	keyPressed = 0;
}

var recordIdx;

function recordPlayDemo()
{
	if(recordIdx < playRecord.length) {
		/*
		if(playRecord[recordIdx].count == recordCount) {
			loadingTxt.text = recordIdx;
			pressKey(playRecord[recordIdx++].code);
		}*/
		if(playRecord[recordIdx*2] == recordCount) {
			//loadingTxt.text = recordIdx;  //for debug
			pressKey(playRecord[recordIdx*2+1]);
			recordIdx++;
		}
	}
}

function processRecordGold(guard)
{
	switch(recordMode) {
	case RECORD_KEY: //record the play key action, save gold
		goldRecord.push(guard.hasGold);
		break;
	case RECORD_PLAY: //play the record key, get gold 
		guard.hasGold = goldRecord[goldRecordIdx++];
		break;
	}	

}

function saveRecordBornPos(x, y)
{
	bornRecord.push({ x:x, y:y });
}

function getRecordBornPos()
{
	if(bornRecord[0] == 2) {
		bornRecordIdx += 2;
		return { x: bornRecord[bornRecordIdx-1], y: bornRecord[bornRecordIdx] };
	} else {
		return { x: bornRecord[++bornRecordIdx], y: 1 };
	}
}

function recordPlayTime(state)
{
	playRecordTime = recordCount;
	recordState = (state == GAME_FINISH)?1:0; //finish or dead
}

function convertBornPos()
{
	var len, offset = 1;
	var tmpRecord = [];
	
	if((len = bornRecord.length) <= 0) return;
	
	for(var i = 0; i < len; i++) if(bornRecord[i].y != 1) offset = 2;
	
	tmpRecord[0] = offset;
	for(var i = 0; i < len; i++) {
		tmpRecord[i*offset+1] = bornRecord[i].x;
		if(offset == 2) tmpRecord[i*offset+2] = bornRecord[i].y;
	}
	bornRecord = tmpRecord;
}

var curDemoData;
function dumpRecord()
{
	var txtStr;	
	
	curDemoData = {};
	curDemoData.level = curLevel;
	curDemoData.ai = AI_VERSION;
	curDemoData.time = playRecordTime;
	curDemoData.state = recordState;
	curDemoData.action = [];
	curDemoData.goldDrop = [];
	curDemoData.bornPos = [];
	curDemoData.godMode = godModeKeyPressed; //07/09/2014

	for(var i = 0; i < playRecord.length; i++) {
		curDemoData.action[i] = playRecord[i];
	}
	
	for(var i = 0; i < goldRecord.length; i++) {
		curDemoData.goldDrop[i] = goldRecord[i];
	}
	
	for(var i = 0; i < bornRecord.length; i++) {
		curDemoData.bornPos[i] = bornRecord[i];
	}

	debug(curDemoData);
	
	debug("	{ level: " + curLevel + ","); 
	debug("		ai: " + AI_VERSION + ","); 
	debug("		time: " + playRecordTime + ",");
	debug("		state: " + recordState + ",");
	debug("		godMode: " + godModeKeyPressed + ","); //07/09/2014

	if(playRecord.length > 0) {
		txtStr = "		action: [ " + playRecord[0];
		for(var i = 1; i < playRecord.length; i++) {
			txtStr += ", " + playRecord[i];
		}
		debug(txtStr+ " ], //" + (playRecord.length/2));
	} else {
		debug("		action: [ ],");
	}
	
	if(goldRecord.length > 0) {
		txtStr = "		goldDrop: [ " + goldRecord[0];
		for(var i = 1; i < goldRecord.length; i++) {
			txtStr += ", " + goldRecord[i];
		}
		debug(txtStr+ " ],");
	} else {
		debug("		goldDrop: [ ],");
	}
	if( bornRecord.length > 0) {
		txtStr = "		bornPos: [ " + bornRecord[0];
		for(var i = 1; i < bornRecord.length; i++) {
			txtStr += ", " + bornRecord[i];
		}
		debug(txtStr+" ]");
	} else {
		debug("		bornPos: [ ]");
	}
	
	debug("	},");
}
