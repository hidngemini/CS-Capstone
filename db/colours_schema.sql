-- allow foreign keys
PRAGMA foreign_keys = ON;

-- delete old tables if they exist
drop TABLE if EXISTS Colours;

-- colour table
CREATE TABLE Colours (
    hex INTEGER PRIMARY KEY
)   