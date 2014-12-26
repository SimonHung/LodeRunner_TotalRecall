/**********************************************************************************
Read Lode Runner APPLE-II DISK IMAGE to extract all levels

Each level is a 28x16 tiles, Lode Runner has 8 different tile types. 
Two additional tiles are used to represent the player and guard start positions.
(reference : http://baetzler.de/c64/games/loderunner/)

APPLE-II DISK data format:

Since there are less than 16 different tiles, it is both convenient and 
efficient to store tiles as nibbles instead of bytes. 
Thus the 448 tiles of a Lode Runner level can be represented in 224 (0xE0) bytes

The tile data for each level use 256 bytes (0x00 ~ 0xFF), 
level data starts at offset 0x00 to 0xDF, and reserved 0x20 bytes.
(0x00 ~ 0xDF + 0x20 = 0x100 (256) bytes) 

The tiles are stored in left-to-right, to-to-bottom order, 
with a small twist: the low nibble of each byte encodes the left tile 
and the high nibble encodes the right tile in each byte of data. 

level start from disk offset 0x3000,

Lode Runner Level value to map (10 different types):

value | Character | Type
------+-----------+-----------
  0x0 |  <space>  | Empty space
  0x1 |     #     | Normal Brick
  0x2 |     @     | Solid Brick
  0x3 |     H     | Ladder
  0x4 |     -     | Hand-to-hand bar (Line of rope)
  0x5 |     X     | False brick
  0x6 |     S     | Ladder appears at end of level
  0x7 |     $     | Gold chest
  0x8 |     0     | Guard
  0x9 |     &     | Player	


2014/10/18 add support dump Revenge_of_Lode_Runner disk
2014/10/18 add support c64 codes
**********************************************************************************/

#include <stdio.h>

#define MAX_TILE_TYPE (sizeof(tileType)/sizeof(char))
#define MAX_LEVEL_ROW (16)
#define MAX_LEVEL_COL (28)

#define READ_LEVEL_DATA_SIZE (256)
#define ONE_LEVEL_DATA_SIZE (224)

#define APPLE_DISK_NO (3)

#if (APPLE_DISK_NO == 1)

#define FILE_NAME "Lode_Runner_Apple-II.dsk"
#define MAX_LEVEL (150)
#define TITLE_NAME "Lode Runner (Apple-II 1983)"
#define DATA_VAR_NAME "baseLevelData"

#elif (APPLE_DISK_NO == 2)

#define FILE_NAME "Lode_Runner_Championship _Apple-II.dsk"
#define MAX_LEVEL (50)
#define TITLE_NAME "Championship Lode Runner (Apple-II 1984)"
#define DATA_VAR_NAME "champLevelData"

#elif (APPLE_DISK_NO == 3)

#define FILE_NAME "Revenge_of_Lode_Runner.dsk"
#define MAX_LEVEL (25)
#define TITLE_NAME "Revenge of Lode Runner (Apple-II 1986)"
#define DATA_VAR_NAME "RevengeLevelData"

#endif

char tileType[] = {
	' ', //0x00: Empty space
	'#', //0x01:Normal Brick
	'@', //0x02:Solid Brick
	'H', //0x03:Ladder
	'-', //0x04:Hand-to-hand bar (Line of rope)
	'X', //0x05:False brick
	'S', //0x06:Ladder appears at end of level
	'$', //0x07:Gold chest
	'0', //0x08:Guard
	'&'  //0x09:Player	
};


int goodLevel(unsigned char *levelData)
{
	int i;
	unsigned char leftTile, rightTile;
	int allZero = 1;
		
	for(i = 0; i < ONE_LEVEL_DATA_SIZE; i++) {
		//levelData[i] = levelData[i] ^ 0xFF;
		leftTile = levelData[i] & 0xF;
		rightTile = levelData[i] >> 0x04;
		if(leftTile >= MAX_TILE_TYPE || rightTile >= MAX_TILE_TYPE) {
			return 0;
		}
		if(leftTile != 0 || rightTile != 0) allZero = 0;
	}
	return !allZero;
	return 1; //OK
}

void dumpTitle(void)
{
	printf("//************************************************************\n");
	printf("//* All levels extract from: \n");
	printf("//* %s DISK IMAGE\n",TITLE_NAME );
	printf("//* by Simon Hung 2014/02/20\n");
	printf("//************************************************************\n\n");
}

void dumpLevel(int level, unsigned char *levelData)
{
	int row, col;
	unsigned char leftTile, rightTile;
	int offset = 0;
	
	printf("======<<< Level %03d >>>======\n\n", level);
	for(row = 0; row < MAX_LEVEL_ROW; row++){
		for(col = 0; col < MAX_LEVEL_COL; col+=2){ //one byte contains 2 tile
			leftTile = levelData[offset] & 0xF;
			rightTile = levelData[offset] >> 0x04;
			printf("%c%c",tileType[leftTile],tileType[rightTile]);
			offset++;			
		}
		printf("\n");
	}
	printf("\n");
}

void dumpLevel4JavaScript(int level, unsigned char *levelData)
{
	int row, col;
	unsigned char leftTile, rightTile;
	int offset = 0;
	
	printf("//======<<< Level %03d >>>======\n\n", level);
	for(row = 0; row < MAX_LEVEL_ROW; row++){
		printf("\"");
		for(col = 0; col < MAX_LEVEL_COL; col+=2){ //one byte contains 2 tile
			leftTile = levelData[offset] & 0xF;
			rightTile = levelData[offset] >> 0x04;
			printf("%c%c",tileType[leftTile],tileType[rightTile]);
			offset++;			
		}
		if(row < MAX_LEVEL_ROW-1)printf("\" +\n");
		else if (level < MAX_LEVEL)printf("\",\n");
		     else printf("\"\n");
	}
	printf("\n");
}



int main(void)
{
	FILE *fp;
	unsigned char levelData[READ_LEVEL_DATA_SIZE];
	int curLevel = 0;
	int readSize= 0, isGood;
	unsigned long curPos = 0x3000L;
	unsigned long dspPos = curPos;
	int doubleError = 0;
	
	if((fp = fopen(FILE_NAME, "rb")) ==NULL) {
		printf("Open file \"%s\" failed !\n", FILE_NAME);
		return 1;
	}
	
	if(fseek(fp, curPos, SEEK_SET) != 0) {
		printf("Fseek error ! @%d\n", __LINE__);
		fclose(fp);
		return 1;
	}

	dumpTitle();

	printf("var %s = [\n", DATA_VAR_NAME);	
#ifdef C64
	do {
#endif
	while(curLevel < MAX_LEVEL && 
	      (readSize = fread(levelData, sizeof(char), READ_LEVEL_DATA_SIZE, fp)) ==  READ_LEVEL_DATA_SIZE &&
	      (isGood = goodLevel(levelData))
	){
		//dumpLevel(++curLevel, levelData);
		//printf("%x", dspPos);
		dumpLevel4JavaScript(++curLevel, levelData);
		dspPos += READ_LEVEL_DATA_SIZE;
		doubleError=0;
	}
#ifdef C64
		doubleError++;
		if(!isGood) {
			curPos += 0x1500L;
			dspPos = curPos;
			if(fseek(fp, curPos, SEEK_SET) != 0) {
				printf("Fseek error ! @%d\n", __LINE__);
				fclose(fp);
				return 1;
			}
			
		} else doubleError++;
	} while(curLevel < MAX_LEVEL && doubleError <= 1);
#endif
	printf("];\n");
	
	fclose(fp);	
}
