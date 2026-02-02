-- allow foreign keys
PRAGMA foreign_keys = ON;

-- delete old tables if they exist
drop TABLE if EXISTS Colour;

-- colour table
CREATE TABLE Colour (
    hex INTEGER PRIMARY KEY
)   