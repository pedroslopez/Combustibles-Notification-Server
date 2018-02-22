CREATE TABLE Tokens (
    token varchar(255) UNIQUE
);

CREATE TABLE app_variables (
    varkey varchar(255) UNIQUE,
    varvalue varchar(255) UNIQUE
);

INSERT INTO app_variables VALUES (
    'lastScan', ''
);