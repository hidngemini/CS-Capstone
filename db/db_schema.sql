-- allow foreign keys
PRAGMA foreign_keys = ON;

-- delete old tables if they exist
drop TABLE if EXISTS Curve;
drop TABLE if EXISTS Gradient;
drop TABLE if EXISTS Palette;
drop TABLE if EXISTS Texture;

-- purely for testing purposes; #TODO: REMOVE THIS EVENTUALLY
drop TABLE if EXISTS Colour;
CREATE TABLE "Colour" (
	"colourId" INTEGER NOT NULL,
	"dateCreated"  INTEGER NOT NULL,
    "hex" INTEGER NOT NULL,
	PRIMARY KEY(colourId)
);

-- curve table
CREATE TABLE "Curve" (
	"curveId"	INTEGER NOT NULL,
    "dateCreated"  INTEGER NOT NULL,
	"P1_x"	REAL NOT NULL,
	"P1_y"	REAL NOT NULL,
	"P2_x"	REAL NOT NULL,
	"P2_y"	REAL NOT NULL,
	"P3_x"	REAL NOT NULL,
	"P3_y"	REAL NOT NULL,
	"P4_x"	REAL NOT NULL,
	"P4_y"	REAL NOT NULL,
	PRIMARY KEY (curveId)
);

-- gradient table
CREATE TABLE "Gradient" (
	"gradId"	INTEGER NOT NULL,
    "dateCreated"  INTEGER NOT NULL,
	"numBlocks"	INTEGER NOT NULL,
	"fromHex"	INTEGER NOT NULL,
	"toHex"	INTEGER NOT NULL,
	PRIMARY KEY (gradId)
);

-- palette table
CREATE TABLE "Palette" (
	"paletteId"	INTEGER NOT NULL,
    "dateCreated"  INTEGER NOT NULL,
	"blockData"	TEXT NOT NULL,
	PRIMARY KEY (paletteId)
);

-- textures table
CREATE TABLE "Texture" (
	"textureId" INTEGER NOT NULL, 
	"texture" BLOB NOT NULL,
	"avgColour" INTEGER NOT NULL,
	PRIMARY KEY (textureId)
)