DROP DATABASE IF EXISTS `matcha`;

CREATE DATABASE `matcha`;

USE `matcha`;

CREATE TABLE `USER` (
  id                INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  firstname         VARCHAR(255) NOT NULL,
  lastname          VARCHAR(255) NOT NULL,
  mail              VARCHAR(255) NOT NULL,
  passwd            CHAR(128) NOT NULL,
  birthdate         DATE NOT NULL,
  gender TINYINT    NOT NULL,
  sexualOrientation TINYINT DEFAULT 2 NOT NULL,
  profilePhoto      INT,
  bio               TEXT,
  verify            INT,
  forgot            INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `PHOTO` (
  id        INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  id_user   INT NOT NULL,
  data      LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `TAGS` (
  id    INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name  varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `TAGS` (`name`) VALUES
    ('test'),
    ('moto'),
    ('heyyyy'),
    ('nope'),
    ('lol'),
    ('online'),
    ('wow'),
    ('sucks'),
    ('YOLOSWAG'),
    ('yolo');

CREATE TABLE `USER_TAGS` (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  id_user INT NOT NULL,
  id_tag INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
