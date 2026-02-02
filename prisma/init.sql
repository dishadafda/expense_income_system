-- MySQL initialization script for Expense & Income Management System
-- This script creates the database and all required tables
-- matching the structures provided in the specification.

-- Adjust database name as needed
CREATE DATABASE IF NOT EXISTS expense_income_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE expense_income_db;

-- Drop tables if they already exist (optional; comment out in production)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS incomes;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS sub_categories;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS peoples;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- users table
CREATE TABLE users (
  UserID        INT NOT NULL AUTO_INCREMENT,
  UserName      VARCHAR(250) NOT NULL,
  EmailAddress  VARCHAR(500) NOT NULL,
  Password      VARCHAR(50) NOT NULL,
  MobileNo      VARCHAR(50) NOT NULL,
  ProfileImage  VARCHAR(500) NULL,
  Created       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- peoples table
CREATE TABLE peoples (
  PeopleID    INT NOT NULL AUTO_INCREMENT,
  PeopleCode  VARCHAR(50) NULL,
  Password    VARCHAR(50) NOT NULL,
  PeopleName  VARCHAR(250) NOT NULL,
  Email       VARCHAR(150) NOT NULL,
  MobileNo    VARCHAR(50) NOT NULL,
  Description VARCHAR(500) NULL,
  UserID      INT NOT NULL,
  Created     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  IsActive    BIT NULL DEFAULT 1,
  PRIMARY KEY (PeopleID),
  CONSTRAINT fk_peoples_users
    FOREIGN KEY (UserID) REFERENCES users(UserID)
      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- categories table
CREATE TABLE categories (
  CategoryID   INT NOT NULL AUTO_INCREMENT,
  CategoryName VARCHAR(250) NOT NULL,
  LogoPath     VARCHAR(250) NULL,
  IsExpense    BIT NOT NULL,
  IsIncome     BIT NOT NULL,
  IsActive     BIT NOT NULL DEFAULT 1,
  Description  VARCHAR(500) NULL,
  UserID       INT NOT NULL,
  Created      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  Sequence     DECIMAL(10,2) NULL,
  PRIMARY KEY (CategoryID),
  CONSTRAINT fk_categories_users
    FOREIGN KEY (UserID) REFERENCES users(UserID)
      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- projects table
CREATE TABLE projects (
  ProjectID       INT NOT NULL AUTO_INCREMENT,
  ProjectName     VARCHAR(250) NOT NULL,
  ProjectLogo     VARCHAR(250) NULL,
  ProjectStartDate DATETIME NULL,
  ProjectEndDate   DATETIME NULL,
  ProjectDetail   VARCHAR(500) NULL,
  Description     VARCHAR(500) NULL,
  UserID          INT NOT NULL,
  Created         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  IsActive        BIT NULL DEFAULT 1,
  PRIMARY KEY (ProjectID),
  CONSTRAINT fk_projects_users
    FOREIGN KEY (UserID) REFERENCES users(UserID)
      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sub_categories table
CREATE TABLE sub_categories (
  SubCategoryID   INT NOT NULL AUTO_INCREMENT,
  CategoryID      INT NOT NULL,
  SubCategoryName VARCHAR(250) NOT NULL,
  LogoPath        VARCHAR(250) NULL,
  IsExpense       BIT NOT NULL,
  IsIncome        BIT NOT NULL,
  IsActive        BIT NOT NULL DEFAULT 1,
  Description     VARCHAR(500) NULL,
  UserID          INT NOT NULL,
  Created         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  Sequence        DECIMAL(10,2) NULL,
  PRIMARY KEY (SubCategoryID),
  CONSTRAINT fk_sub_categories_categories
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sub_categories_users
    FOREIGN KEY (UserID) REFERENCES users(UserID)
      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- expenses table
CREATE TABLE expenses (
  ExpenseID      INT NOT NULL AUTO_INCREMENT,
  ExpenseDate    DATETIME NOT NULL,
  CategoryID     INT NULL,
  SubCategoryID  INT NULL,
  PeopleID       INT NOT NULL,
  ProjectID      INT NULL,
  Amount         DECIMAL(18,2) NOT NULL,
  ExpenseDetail  VARCHAR(500) NULL,
  AttachmentPath VARCHAR(250) NULL,
  Description    VARCHAR(500) NULL,
  UserID         INT NOT NULL,
  Created        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ExpenseID),
  CONSTRAINT fk_expenses_categories
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_expenses_sub_categories
    FOREIGN KEY (SubCategoryID) REFERENCES sub_categories(SubCategoryID)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_expenses_peoples
    FOREIGN KEY (PeopleID) REFERENCES peoples(PeopleID)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_expenses_projects
    FOREIGN KEY (ProjectID) REFERENCES projects(ProjectID)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_expenses_users
    FOREIGN KEY (UserID) REFERENCES users(UserID)
      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- incomes table
CREATE TABLE incomes (
  IncomeID       INT NOT NULL AUTO_INCREMENT,
  IncomeDate     DATETIME NOT NULL,
  CategoryID     INT NULL,
  SubCategoryID  INT NULL,
  PeopleID       INT NOT NULL,
  ProjectID      INT NULL,
  Amount         DECIMAL(18,2) NOT NULL,
  IncomeDetail   VARCHAR(500) NULL,
  AttachmentPath VARCHAR(250) NULL,
  Description    VARCHAR(500) NULL,
  UserID         INT NOT NULL,
  Created        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Modified       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (IncomeID),
  CONSTRAINT fk_incomes_categories
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_incomes_sub_categories
    FOREIGN KEY (SubCategoryID) REFERENCES sub_categories(SubCategoryID)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_incomes_peoples
    FOREIGN KEY (PeopleID) REFERENCES peoples(PeopleID)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_incomes_projects
    FOREIGN KEY (ProjectID) REFERENCES projects(ProjectID)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_incomes_users
    FOREIGN KEY (UserID) REFERENCES users(UserID)
      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: seed an initial admin user (adjust credentials!)
-- INSERT INTO users (UserName, EmailAddress, Password, MobileNo)
-- VALUES ('admin', 'admin@example.com', 'admin123', '0000000000');

