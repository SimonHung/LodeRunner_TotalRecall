var keyAction = ACT_STOP; //// keyLastLeftRight = ACT_RIGHT;
var shiftLevelNum = 0;
var runnerDebug = 0;

function pressShiftKey(code)
{
	switch(code) {
	case KEYCODE_PERIOD: //SHIFT-. = '>', change to next level
		shiftLevelNum = 1;	
		gameState = GAME_NEXT_LEVEL;
		break;	
	case KEYCODE_COMMA:	 //SHIFT-, = '<', change to previous level	
		shiftLevelNum = 1;	
		gameState = GAME_PREV_LEVEL;
		break;
	case KEYCODE_UP: //SHIFT-UP, inc runner 	
		if(playMode == PLAY_CLASSIC && runnerLife < 10) { //bug fixed: add check playMode, 12/15/2014
			runnerLife++;	
			drawLife();
		}
		break;	
	case KEYCODE_X: //SHIFT-X 
		toggleTrapTile();
		break;
	case KEYCODE_G: //SHIFT-G, toggle god mode
		toggleGodMode();
		break;	
	default:		
		if(runnerDebug) debugKeyPress(code);
		break;
	}
}

function pressCtrlKey(code)
{
	switch(code) {
	case KEYCODE_A: //CTRL-A : abort level
		gameState = GAME_RUNNER_DEAD;	
		break;	
	case KEYCODE_C: //CTRL-C : copy current level
		copyLevelMap = levelData[curLevel-1];
		showTipsText("COPY MAP", 0);	
		break;	
	case KEYCODE_R: //CTRL-R : abort game
		runnerLife = 1;	
		gameState = GAME_RUNNER_DEAD;	
		break;	
	case KEYCODE_S: //CTRL-S, toggle sound 
		if( (soundOff ^= 1) == 1) {
			soundDig.stop();
			soundFall.stop();
			showTipsText("SOUND OFF", 0);
		} else {
			showTipsText("SOUND ON", 0);
		}
		break;	
	case KEYCODE_LEFT: //SHIFT + <- : speed down
		setSpeed(-1);	
		break;	
	case KEYCODE_RIGHT: //SHIFT + -> : speed up
		setSpeed(1);	
		break;	
	}
}

function debugKeyPress(code)
{
	switch(code) {
	case KEYCODE_1: //SHIFT-1 , add 5 level
		shiftLevelNum = 5;	
		gameState = GAME_NEXT_LEVEL;
		break;	
	case KEYCODE_2: //SHIFT-2 , add 10 level
		shiftLevelNum = 10;	
		gameState = GAME_NEXT_LEVEL;
		break;	
	case KEYCODE_3: //SHIFT-3 , add 20 level
		shiftLevelNum = 20;	
		gameState = GAME_NEXT_LEVEL;
		break;	
	case KEYCODE_4: //SHIFT-4 , add 50 level
		shiftLevelNum = 50;	
		gameState = GAME_NEXT_LEVEL;
		break;	
	case KEYCODE_6: //SHIFT-6 , dec 5 level
		shiftLevelNum = 5;	
		gameState = GAME_PREV_LEVEL;
		break;	
	case KEYCODE_7: //SHIFT-7 , dec 10 level
		shiftLevelNum = 10;	
		gameState = GAME_PREV_LEVEL;
		break;	
	case KEYCODE_8: //SHIFT-8 , dec 20 level
		shiftLevelNum = 20;	
		gameState = GAME_PREV_LEVEL;
		break;	
	case KEYCODE_9: //SHIFT-9 , dec 50 level
		shiftLevelNum = 50;	
		gameState = GAME_PREV_LEVEL;
		break;
	}
}

var godMode = 0, godModeKeyPressed = 0;

function initHotKeyVariable()
{
	godMode = 0;
	godModeKeyPressed = 0;
}

function toggleGodMode()
{
	godModeKeyPressed = 1; //means player press the god-mod hot-key
	
	godMode ^= 1;
	if(godMode) {
		showTipsText("GOD MODE ON", 0);
	} else {	
		showTipsText("GOD MODE OFF", 0);
	}
}

function setSpeed(v)
{
	speed += v;
	if(speed < 0) speed = 0;
	if(speed >= speedMode.length) speed = speedMode.length-1;
	createjs.Ticker.setFPS(speedMode[speed]);
	showTipsText(speedText[speed], 0);
}

function helpCallBack() //help complete call back
{
	pressKey(KEYCODE_ESC);
}

function pressKey(code)
{
	switch(code) {
	case KEYCODE_LEFT:        
	case KEYCODE_J:		
		keyAction = ACT_LEFT;
		break;
	case KEYCODE_RIGHT: 
	case KEYCODE_L:		
		keyAction = ACT_RIGHT;
		break;
	case KEYCODE_UP: 
	case KEYCODE_I:		
		keyAction = ACT_UP;
		break;
	case KEYCODE_DOWN: 
	case KEYCODE_K:		
		keyAction = ACT_DOWN;
		break;
	case KEYCODE_Z:
	case KEYCODE_U:		
		keyAction = ACT_DIG_LEFT;
		break;	
	case KEYCODE_X:
	case KEYCODE_O:		
		keyAction = ACT_DIG_RIGHT;
		break;	
	case KEYCODE_ESC: //help & pause
		if(gameState == GAME_PAUSE) {
			gameResume();
			showTipsText("", 0); //clear text
		} else {
			gamePause();
			showTipsText("PAUSE", 1); //display "PAUSE"
			//helpObj.showHelp(helpCallBack);
		}
		break;
	case KEYCODE_ENTER: //display hi-score
		if(playMode == PLAY_CLASSIC) {
			menuIconDisable(1);
			gamePause();
			showScoreTable(playData-1, null, function() { menuIconEnable(); gameResume();});	
		} else {
			keyAction = ACT_UNKNOWN;
		}
		break;	
	default:
		keyAction = ACT_UNKNOWN;
		//debug("keycode = " + code);	
		break;	
	}
  if(recordMode && code != KEYCODE_ESC) saveKeyCode(code, keyAction);
}

function gameResume()
{
	gameState = lastGameState;
	soundResume(soundFall);
	soundResume(soundDig);
}

function gamePause()
{
	lastGameState = gameState;	
	gameState = GAME_PAUSE;
	soundPause(soundFall);
	soundPause(soundDig);
}

function handleKeyDown(event) 
{
	if(!event){ event = window.event; } //cross browser issues exist
	
	if(event.shiftKey) {
		if(gameState == GAME_START || gameState == GAME_RUNNING) {
			pressShiftKey(event.keyCode);
		}
	} else 
	if (event.ctrlKey) {
		if(gameState == GAME_START || gameState == GAME_RUNNING) {
			pressCtrlKey(event.keyCode);
		}
	} else {
		 if((gameState == GAME_PAUSE && event.keyCode == KEYCODE_ESC) ||
    	    gameState == GAME_START || gameState == GAME_RUNNING) 
		{
			if(recordMode != RECORD_PLAY && playMode != PLAY_AUTO) {
				pressKey(event.keyCode);	
			}
		}
		
	}
 /*
	//e.cancelBubble is supported by IE - this will kill the bubbling process.
	event.cancelBubble = true;
	event.returnValue = false;

	//event.stopPropagation works only in Firefox.
	if (event.stopPropagation) {
		event.stopPropagation();
		event.preventDefault();
	}
 */	
	if(event.keyCode >= 112 && event.keyCode <= 123) return true; //F1 ~ F12
	return false;
	
}		
	