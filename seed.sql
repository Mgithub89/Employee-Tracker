use Employee_DB;

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("Mark", "James", 1, 2),("Kelly", "John", 2, 3);

INSERT INTO role(title, salary, department_id)
VALUES ("Sales", 100000, 5), ("Accounant", 150000, 8);

INSERT INTO department(name)
VALUES("Accounting"), ("Engineering");