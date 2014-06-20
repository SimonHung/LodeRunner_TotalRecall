
function showScoreTable(_dataId, _curScoreInfo, _callbackFun, _waitTime)
{
	var hiScoreInfo;
	var canvas2, scoreStage;
	var titleText;
	var recordId = -1;
	var savedKeyDownHander;
	var timeOutHandler = null;

	init();
	
	function init()
	{
		getHiScoreInfo();
		
		if(_curScoreInfo) {
			recordId = updateScoreInfo();
 			if(recordId < 0) {
				if(_callbackFun) _callbackFun();
				return; //don't need update score
			}
 		}
		
		createCanvas2();
		createScoreStage();
		setScoreBackground();
		drawHiScoreList();
		scoreStage.update();
		if(recordId >= 0) {
			inputHiScoreName();
		} else {
			anyKeyHandler();
			if(typeof _waitTime == "undefined") _waitTime = 3500;
			timeOutHandler = setTimeout( function() { closeScoreTable(); }, _waitTime);
		}
	}
	
	function closeScoreTable()
	{
		removeCanvas2();
		restoreKeyDownHandler();
		if(_callbackFun) _callbackFun();
	}
	
	function getHiScoreInfo()
	{
		var infoJSON, levelMap;
	
		if(_dataId == 1) {
			infoJSON = getStorage(STORAGE_HISCORE_INFO2);
		} else {
			infoJSON = getStorage(STORAGE_HISCORE_INFO1);
		}
		
		if(infoJSON) {
			var infoObj = JSON.parse(infoJSON);
			hiScoreInfo = infoObj;
		} else {
			hiScoreInfo = [];
			for(var i = 0; i < MAX_HISCORE_RECORD; i++) {
				hiScoreInfo[i] = {s:0 , n:"" , l: 0};
			}
			
			if(_dataId == 1) {
				hiScoreInfo[0].n = "STEVE JOBS";
				hiScoreInfo[0].l = 1;
				hiScoreInfo[0].s = 2500;
				
				hiScoreInfo[1].n = "BILL GATES";
				hiScoreInfo[1].l = 1;
				hiScoreInfo[1].s = 1500;
			} else {
				hiScoreInfo[0].n = "SIMON";
				hiScoreInfo[0].l = 1;
				hiScoreInfo[0].s = 3500;
				
				hiScoreInfo[1].n = "PETER PAN";
				hiScoreInfo[1].l = 1;
				hiScoreInfo[1].s = 2000;
				 
				hiScoreInfo[2].n = "DASH PARR"; // The Incredibles. He is the son of Bob Parr and Helen Parr (小飛)
				hiScoreInfo[2].l = 1;
				hiScoreInfo[2].s = 1000;
			}
		}
	}
	
	function setHiScoreInfo()
	{
		var infoJSON = JSON.stringify(hiScoreInfo);
		
		if(_dataId == 1) 
			setStorage(STORAGE_HISCORE_INFO2, infoJSON); 
		else
			setStorage(STORAGE_HISCORE_INFO1, infoJSON); 
	}

	function updateScoreInfo()
	{
		var addId = -1;
		
		if(_curScoreInfo.s <= 0) return addId; //don't save if scroe <= 0
		
		for(var i = 0; i < MAX_HISCORE_RECORD; i++) {
			_curScoreInfo.n = "";
			if(_curScoreInfo.s >= hiScoreInfo[i].s) {
				addId = i;
				hiScoreInfo.splice(i, 0, _curScoreInfo);
				hiScoreInfo.splice(MAX_HISCORE_RECORD, 1);
				setHiScoreInfo();
				break;
			}
		}
		return addId;
	}
	
	function createCanvas2()
	{
		canvas2 = document.createElement('canvas');
		canvas2.id     = "canvas2";
		canvas2.width  = canvasX;
		canvas2.height = canvasY;
	
		//Set canvas top left position
		var left = ((screenX - canvasX)/2|0),
			top  = ((screenY - canvasY)/2|0);
		canvas2.style.left = (left>0?left:0) + "px";
		canvas2.style.top =  (top>0?top:0) + "px";
		canvas2.style.position = "absolute";
		document.body.appendChild(canvas2);
	}	
	
	function createScoreStage() 
	{
		scoreStage = new createjs.Stage(canvas);
	}	
	
	function removeCanvas2()
	{
		scoreStage.removeAllChildren();
		scoreStage.update();
		document.body.removeChild(canvas2);
	}	
	
	function setScoreBackground()
	{
		//set background color
		var background = new createjs.Shape();
		background.graphics.beginFill("black").drawRect(0, 0, canvas2.width, canvas2.height);
		scoreStage.addChild(background);
	}	
	
	function getNameStartPos(nameLength, itemId) 
	{
		var x = (4+(MAX_HISCORE_NAME_LENGTH-nameLength)/2)*tileW;
		var y = (itemId * 1.2 + 5) * tileH;
		
		return { x: x, y: y };
	}
	
	function drawHiScoreList()
	{
		var title = "LODE RUNNER " + ((_dataId == 1)?"2":"1") + " HIGH SCORES";
		var barTile;

		drawText((NO_OF_TILES_X-title.length)/2*tileW, 0.5*tileH, title, scoreStage);
		drawText(0.5*tileW, 3*tileH, "NO", scoreStage);
		drawText(7*tileW, 3*tileH, "NAME", scoreStage);
		drawText(14.5*tileW, 3*tileH, "LEVEL  SCORE", scoreStage);
 	
		for(var x = 0; x < NO_OF_TILES_X; x++) {
			barTile = new createjs.Bitmap(preload.getResult("ground"));
			barTile.setTransform(x * tileW, 4.5*tileH , tileScale, tileScale);
			scoreStage.addChild(barTile); 
		}		
 	
		for(var i = 0; i < MAX_HISCORE_RECORD; i++) {
			var pos = getNameStartPos(hiScoreInfo[i].n.length, i);
			
			drawText(0.5*tileW, pos.y, ("0"+(i+1)).slice(-2) + ".", scoreStage);
			
			if(hiScoreInfo[i].s > 0) {
				if(hiScoreInfo[i].n.length > 0) {
					drawText(pos.x, pos.y, hiScoreInfo[i].n, scoreStage);
				}
				drawText(15.5*tileW, pos.y, ("00"+hiScoreInfo[i].l).slice(-3), scoreStage);
				drawText(20.5*tileW, pos.y, ("000000"+hiScoreInfo[i].s).slice(-7), scoreStage);
			}
		}
	}
	
	function anyKeyHandler()
	{
		savedKeyDownHander = document.onkeydown;
		document.onkeydown = function(event) {
			if(!event){ event = window.event; } 
		
			//if( event.keyCode == KEYCODE_ENTER) {
				clearTimeout(timeOutHandler);
				closeScoreTable();
			//}
		}
	}

	function restoreKeyDownHandler()
	{
		document.onkeydown = savedKeyDownHander;
	}			
	
	function inputHiScoreName() 
	{
		var name, nameText;
		var curPos = 0;
		var savedKeyDownHander, hiScoreTicker;
		var cursor;

		init();
		
		function init()
		{
			name = []; //string
			nameText = []; //text object
			changeKeyDownHandler();
			
			var pos = getNameStartPos(0, recordId);
			cursor = new createjs.Sprite(textData, "FLASH");
			cursor.setTransform(pos.x-tileW/2, pos.y , tileScale, tileScale);
			scoreStage.addChild(cursor);
			
			hiScoreTicker = createjs.Ticker.on("tick", scoreStage);	
		}
		
		function changeKeyDownHandler()
		{
			savedKeyDownHander = document.onkeydown;
			document.onkeydown = handleHiScoreName;
		}
		
		function cutTailSpace()
		{
			for(var i = name.length-1; i >= 0; i--) {
				if(name[i] == " ") name.splice(i,1);
				else break;
			}
		}
		
		function inputFinish()
		{
			cutTailSpace();
			redrawName();
			
			//uodate name for score info  
			hiScoreInfo[recordId].n = array2String(name);
			setHiScoreInfo();

			//remove cursor
			scoreStage.removeChild(cursor);
			scoreStage.update();
			
			createjs.Ticker.off("tick", hiScoreTicker);
			setTimeout( function() { closeScoreTable(); }, 1500);
		}
		
		function removeNameText()
		{
			for(var i = 0; i < nameText.length; i++) 
			scoreStage.removeChild(nameText[i]);
		}
		
		function array2String(name)
		{
			var nameString = "";
			for(var i = 0; i < name.length; i++) {
				nameString += name[i];
			}
			return nameString;
		}
	
		function redrawName()
		{
			var pos = getNameStartPos(name.length, recordId); 
			removeNameText();
			nameText = drawText(pos.x, pos.y, array2String(name), scoreStage);

			//change cursor position
			if(name.length > 0) cursor.x = pos.x + curPos * tileW;
			else cursor.x = pos.x - tileW/2;

			//move cursor to top
			moveChild2Top(scoreStage, cursor);
		}
		
		
		function handleHiScoreName(event)
		{
			if(!event){ event = window.event; } //cross browser issues exist
		
		
			//if(event.shiftKey) {
			//} else 	if (event.ctrlKey) {
			//} else 
			{
				var code = event.keyCode;
			
				if(curPos >= MAX_HISCORE_NAME_LENGTH && 
				   code != KEYCODE_BKSPACE && code != KEYCODE_LEFT && code != KEYCODE_ENTER) 
				{
					soundPlay("beep"); //wrong key code	
					return false;
				}

				switch(true) {
				case (code >=65 && code <= 90): // A ~ Z
				case (code >= 97 && code <= 122): //a ~ z
					if( code > 90) code -= 32;	
					name[curPos++] = String.fromCharCode(code);
					break;
				case (code == KEYCODE_DOT): //'.'		
					name[curPos++] = ".";
					break;
				case (code == KEYCODE_DASH): //'-'
					name[curPos++] = "-";
					break;
				case (code == KEYCODE_SPACE): //space
					if(curPos == 0) {
						soundPlay("beep"); //wrong key code	
						break;
					}
					name[curPos++] = " ";
					break;
				case (code == KEYCODE_BKSPACE): //backspace
					if(curPos == 0) break;
					name.splice(--curPos, 1);
					break;
				case (code == KEYCODE_LEFT): //LEFT
					if(curPos > 0) curPos--;	
					break;
				case (code == KEYCODE_RIGHT): //RIGHT
					if(curPos < name.length) curPos++;	
					break;
				case (code == KEYCODE_ENTER): //ENTER
					if(name.length > 0) inputFinish();	
					else soundPlay("beep");	
				default:
					//debug(code);	
					if(code > 32) soundPlay("beep"); //wrong key code	
					break;	
				}
				
				redrawName();
				
				return false;
			}
		}
	}
}
