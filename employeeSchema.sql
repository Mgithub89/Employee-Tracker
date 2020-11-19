DROP DATABASE IF EXISTS Employee_DB;
 
 CREATE DATABASE Employee_DB;

 use Employee_DB;

 CREATE TABLE employee (
     id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
     first_name VARCHAR(30) NOT NULL, 
     last_name VARCHAR(30) NOT NULL,
     role_id INT ,
     manager_id INT
 )

 CREATE TABLE role (
     id INT NOT NULL AUTO_INCREMENT,
     title VARCHAR(30) NOT NULL,
     salary DECIMAL(50,2),
     department_id INT
     PRIMARY KEY (id)
 )

 CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT, 
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
 )