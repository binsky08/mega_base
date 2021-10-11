DROP DATABASE IF EXISTS mega_base;
CREATE DATABASE mega_base;
USE mega_base;

CREATE TABLE game
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(1000) NOT NULL,
    release_date DATE
);

CREATE TABLE rating_agency
(
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(5)
);

CREATE TABLE link_game_rating_agency
(
    game_id          BIGINT REFERENCES game (id),
    rating_agency_id BIGINT REFERENCES rating_agency (id),
    age              INT NOT NULL,
    PRIMARY KEY (game_id, rating_agency_id)
);

CREATE TABLE category
(
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE link_game_category
(
    game_id     BIGINT REFERENCES game (id),
    category_id BIGINT REFERENCES category (id),
    PRIMARY KEY (game_id, category_id)
);

CREATE TABLE player
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(350) NOT NULL UNIQUE,
    first_name     TEXT         NOT NULL,
    last_name      TEXT         NOT NULL,
    nickname       VARCHAR(255) UNIQUE,
    password_plain VARCHAR(255),
    date_of_birth  DATE
);

CREATE TABLE link_player_game
(
    player_id BIGINT REFERENCES player (id),
    game_id   BIGINT REFERENCES game (id),
    PRIMARY KEY (player_id, game_id)
);

CREATE TABLE friends
(
    source_player_id      BIGINT REFERENCES player (id),
    destination_player_id BIGINT REFERENCES player (id),
    CONSTRAINT columns_cannot_equal CHECK (friends.source_player_id <> friends.destination_player_id),
    PRIMARY KEY (source_player_id, destination_player_id)
);

INSERT INTO player (email, first_name, last_name, nickname, password_plain, date_of_birth)
VALUES ('gamer@examle.de', 'Jane', 'Doe', 'JD', '12345678', '1971-02-01'),
       ('pinguin@examle.de', 'Linus', 'Torvalds', 'PenguinMaster', 'Password', '1970-01-01'),
       ('schlagerstar@examle.de', 'Helene', 'Fischer', 'herzbeben', 'atemlos', '1984-08-05'),
       ('angela.merkel@example.com', 'Angela', 'Merkel', 'Mutti', '#neuland', '1874-04-12'),
       ('andi@example.com', 'Andreas', 'Scheuer', 'Andi', 'Maut', '1940-11-12'),
       ('Suckerberg@example.com', 'Mark', 'Suckerberg', 'Fratzenbuch', 'Datenschutz', '1945-01-01');

INSERT INTO game (name, release_date)
VALUES ('GTA 5', '2013-09-11'),
       ('GTA 6', '2050-09-11'),
       ('Portal 3', '2150-09-11'),
       ('Half Life', '1990-08-15'),
       ('Tetris', '1895-08-15'),
       ('Daten versenken', '2004-02-04'),
       ('Pong', '1960-08-15');

INSERT INTO category (name)
VALUES ('Realistisch'),
       ('Puzzle'),
       ('Ballerspiel'),
       ('Historisch');

INSERT INTO rating_agency (name)
VALUES ('PEGI'),
       ('ESRB'),
       ('USK');

INSERT INTO link_game_rating_agency (game_id, rating_agency_id, age)
SELECT game.id, rating_agency.id, 21
FROM game
         INNER JOIN rating_agency ON game.name IN ('Portal 3', 'Half Life') AND rating_agency.name = 'USK';

INSERT INTO link_game_rating_agency (game_id, rating_agency_id, age)
SELECT game.id, rating_agency.id, 21
FROM game
         INNER JOIN rating_agency ON game.name IN ('Pong', 'Tetris') AND rating_agency.name = 'USK';

INSERT INTO link_game_rating_agency (game_id, rating_agency_id, age)
SELECT game.id, rating_agency.id, 6
FROM game
         INNER JOIN rating_agency ON game.name IN ('GTA 6', 'Portal 3') AND rating_agency.name = 'ESRB';


INSERT INTO link_game_category (game_id, category_id)
SELECT g.id, c.id
FROM game g
         INNER JOIN category c ON g.name IN ('GTA 6', 'Portal 3')
    AND c.name = 'Realistisch';

INSERT INTO link_game_category (game_id, category_id)
SELECT g.id, c.id
FROM game g
         INNER JOIN category c ON g.name IN ('Tetris', 'Portal 3')
    AND c.name = 'Puzzle';

INSERT INTO link_game_category (game_id, category_id)
SELECT g.id, c.id
FROM game g
         INNER JOIN category c ON g.name IN ('GTA 5', 'GTA 6', 'Portal 3')
    AND c.name = 'Ballerspiel';

INSERT INTO link_game_category (game_id, category_id)
SELECT g.id, c.id
FROM game g
         INNER JOIN category c on g.name in ('Tetris', 'Pong')
    AND c.name = 'Historisch';


Insert INTO link_player_game (player_id, game_id)
SELECT p.id, g.id
FROM game g
         INNER JOIN player p on g.name in ('Portal 3')
    AND p.nickname = 'JD';

Insert INTO link_player_game (player_id, game_id)
SELECT p.id, g.id
FROM game g
         INNER JOIN player p on g.name in ('Tetris', 'Pong')
    AND p.nickname = 'PenguinMaster';

Insert INTO link_player_game (player_id, game_id)
SELECT p.id, g.id
FROM game g
         INNER JOIN player p on g.name in ('GTA 5', 'GTA 6', 'Half Life')
    AND p.nickname = 'Mutti';

Insert INTO link_player_game (player_id, game_id)
SELECT p.id, g.id
FROM game g
         INNER JOIN player p on g.name in ('GTA 5', 'GTA 6', 'Portal 3')
    AND p.nickname = 'Andi';

Insert INTO link_player_game (player_id, game_id)
SELECT p.id, g.id
FROM game g
         INNER JOIN player p on g.name in ('Daten versenken')
    AND p.nickname = 'Fratzenbuch';


INSERT into friends (source_player_id, destination_player_id)
SELECT p1.id, p2.id
FROM player p1
         INNER JOIN player p2 ON p1.nickname = 'JD' and p2.nickname != 'JD';

INSERT into friends (source_player_id, destination_player_id)
SELECT p1.id, p2.id
FROM player p1
         INNER JOIN player p2 ON p1.nickname = 'Mutti' and p2.nickname = 'Andi';

INSERT into friends (source_player_id, destination_player_id)
SELECT p1.id, p2.id
FROM player p1
         INNER JOIN player p2 ON p1.nickname = 'PenguinMaster' and p2.nickname = 'herzbeben';

INSERT into friends (source_player_id, destination_player_id)
SELECT p1.id, p2.id
FROM player p1
         INNER JOIN player p2 ON p1.nickname = 'Mutti' and p2.nickname = 'Fratzenbuch';


CREATE OR REPLACE VIEW hyper_secure_user_data_with_hashed_password AS
SELECT id, email, first_name, last_name, nickname, MD5(password_plain) as secret, date_of_birth
FROM player;


SELECT *
FROM hyper_secure_user_data_with_hashed_password;
