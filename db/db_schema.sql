-- allow foreign keys
PRAGMA foreign_keys = ON;

-- delete old tables if they exist
drop TABLE if EXISTS Curve;
drop TABLE if EXISTS Gradient;
drop TABLE if EXISTS Palette;

-- curve table
CREATE TABLE "Curve" (
	"id"	INTEGER,
    "date_created"  INTEGER,
	"P1_x"	REAL,
	"P1_y"	REAL,
	"P2_x"	REAL,
	"P2_y"	REAL,
	"P3_x"	REAL,
	"P3_y"	REAL,
	"P4_x"	REAL,
	"P4_y"	REAL
);

-- gradient table
CREATE TABLE "Gradient" (
	"id"	INTEGER,
    "date_created"  INTEGER,
	"numBlocks"	INTEGER,
	"fromHex"	INTEGER,
	"toHex"	INTEGER
);

-- palette table
CREATE TABLE "Palette" (
	"id"	INTEGER,
    "date_created"  INTEGER,
	"block_ids"	TEXT
);