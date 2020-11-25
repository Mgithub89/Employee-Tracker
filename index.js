//Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");
require("dotenv").config();
const chalk = require('chalk');
const figlet = require('figlet');

//create database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB
});

//connect to mysql server
connection.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected as id " + connection.threadId);
        // run start function
        start();
    }
});
console.log(
    chalk.yellow(
        figlet.textSync('Employee Manager', { horizontalLayout: "default", verticalLayout: 'default', })
    )
);
//function to start
function start() {
    inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
            "View employees",
            "Add departments to the database",
            "Add roles to the database",
            "Add employees to the database",
            "View departments",
            "View roles",
            "Update employee roles",
            "View employees by department",
            "View employees by manager",
            "Remove employee",
            "Exit"
        ]
    })
        // run function based on user selection
        .then(answer => {
            switch (answer.action) {
                case "View employees":
                    return viewEmployees();
                    break;
                case "Add departments to the database":
                    return addDepartment();
                    break;
                case "Add roles to the database":
                    return addRole();
                    break;
                case "Add employees to the database":
                    return addEmployee();
                    break;
                case "View departments":
                    return viewDepartment();
                    break;
                case "View roles":
                    return viewRoles();
                    break;
                case "Update employee roles":
                    return updateRole();
                    break;
                case "View employees by department":
                    return viewByDepartment();
                    break;
                case "View employees by manager":
                    return viewByManager();
                    break;
                case "Remove employee":
                    return removeEmployee();
                    break;
                case "Exit":
                    connection.end();
            }
        })
}

// view all employees
function viewEmployees() {
    let allEmployee = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,CONCAT(m.first_name, " ", m.last_name) AS manager
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON m.id = employee.manager_id`
    connection.query(allEmployee, (err, data) => {
        if (err) throw err;
        console.log(chalk.green("viewing all Employees"));
        console.table(data);
        start();
    })
}

//view employess by departement
function viewByDepartment() {
    connection.query('SELECT * FROM department', (err, data) => {
        if (err) throw err;
        // creating department array
        let deptArr = [];
        for (let i = 0; i < data.length; i++) {
            let dept = data[i].name;
            deptArr.push(dept);
        }
        inquirer.prompt(
            {
                type: "list",
                name: "departments",
                message: "Which department employees would like to see?",
                choices: deptArr
            }
        )
            .then(answer => {

                let query = `SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id WHERE department.name = ?
                ORDER BY department.name`

                connection.query(query, [answer.departments], (err, data) => {
                    if (err) throw err;
                    console.log(chalk.green(`Here is all employees in ${answer.departments} departement.`))
                    console.table(data);
                    start();
                })
            })
    })
};

//view employees by manager
function viewByManager() {
    connection.query("SELECT * FROM employee", (err, employees) => {
        if (err) throw err;
        //creating employee array
        let empArr = [];
        for (var i = 0; i < employees.length; i++) {
            let emp = `${employees[i].first_name} ${employees[i].last_name}`;
            empArr.push(emp);
        }
        inquirer.prompt(
            {
                type: 'list',
                name: "byManager",
                message: 'under which manager would like to see?',
                choices: empArr
            }
        )
            .then(answer => {
                connection.query("SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?", [answer.byManager], (err, data) => {
                    if (err) throw err;
                    connection.query("SELECT * FROM employee WHERE manager_id = ?", [data[0].id], (err, employees) => {
                        if (err) throw err;
                        console.log(chalk.green(`Here is all employees under ${answer.byManager}`));
                        console.table(employees);
                        start();
                    })

                })
            })

    })
}

//Add department to the DB
function addDepartment() {
    inquirer.prompt({
        type: "input",
        name: "add",
        message: "What is the department you would like to add?"
    }).then(answer => {
        // add thr response to the department table
        let dep = 'INSERT INTO department SET ?';
        connection.query(dep, { name: answer.add }, (err) => {
            if (err) throw err;
            console.log(chalk.green("NEW DEPARTMENT ADEDED!"));
            start();
        })
    })
}

// Add role to the DB
function addRole() {
    connection.query('SELECT * FROM department', (err, data) => {
        if (err) throw err;
        //creating department array
        let deptArr = [];
        for (let i = 0; i < data.length; i++) {
            let dept = data[i].name;
            deptArr.push(dept);
        }

        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "What is the title of the role you would like to add?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of this role?"
            },
            {
                type: "list",
                name: "deptName",
                message: "What is the department of this role?",
                choices: deptArr,
            }
        ])
            .then(answer => {
                let role = 'INSERT INTO role SET ?';
                let deptID;
                for (let dept = 0; dept < data.length; dept++) {
                    if (data[dept].name === answer.deptName) {
                        deptID = data[dept].id;
                    }
                }
                connection.query(role, {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: deptID
                }, (err) => {
                    if (err) throw err;
                    console.log(chalk.green("New role added!"));
                    start();
                })
            })
    })
}

// Add employee to the DB
function addEmployee() {
    let employeesArr = ["none"];
    connection.query(`SELECT * FROM employee `, (err, employees) => {
        if (err) throw err;
        // creat manager arr to assign a manager for the new employee to be added
        for (const employee of employees) {
            let empl = `${employee.first_name} ${employee.last_name}`
            employeesArr.push(empl)
        }
    })
    connection.query('SELECT * FROM role', (err, data) => {
        if (err) throw err;
        //creat roll array to assign role for the new employee to be added
        let roleArr = [];
        for (let i = 0; i < data.length; i++) {
            let role = data[i].title;
            roleArr.push(role);
        };
        //collecting new employee information from the prompt
        inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "What is the first name?"
            },
            {
                type: "input",
                name: "lastName",
                message: "What is the last name?"
            },
            {
                type: "list",
                name: "rolename",
                message: "What is the role for this employee?",
                choices: roleArr
            },
            {
                type: "list",
                name: "managerName",
                message: "What is the manager name for this employee?",
                choices: employeesArr
            }
        ])
            .then(answer => {
                let roleID;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].title === answer.rolename) {
                        roleID = data[i].id;
                    }
                }
                connection.query('SELECT * FROM employee WHERE CONCAT(first_name, " ", last_name) = ?', [answer.managerName], (err, manager) => {
                    if (err) throw err;
                    //adding new employee to the employee table
                    let emplo = 'INSERT INTO employee SET ?';
                    connection.query(emplo,
                        {
                            first_name: answer.firstName,
                            last_name: answer.lastName,
                            role_id: roleID || null,
                            manager_id: answer.managerName !== "None" ? manager[0].id : null
                        },
                        (err) => {
                            if (err) throw err;
                            console.log("==========================================================================");
                            console.log(chalk.green(`${answer.firstName} ${answer.lastName} with the ${answer.rolename} role added to the DB under ${answer.managerName}`));
                            console.log("==========================================================================");
                            start();
                        })
                })
            })
    });
}

//view all department 
function viewDepartment() {
    let department = 'SELECT * FROM department';
    connection.query(department, (err, data) => {
        if (err) throw err;
        console.log(chalk.green("viewing all Department"));
        console.table(data);
        start();
    })
}

//view all roles by left joining department table
function viewRoles() {
    let role = 'SELECT role.id, role.title, department.name AS Department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id'
    connection.query(role, (err, data) => {
        if (err) throw err;
        console.log(chalk.green("viewing all Roles"));
        console.table(data);
        start();
    })

}

//update role
function updateRole() {
    connection.query("SELECT * FROM employee", (err, data) => {
        if (err) throw err;
        //creating employee array by grabing first name
        let employeesArr = [];
        for (const employee of data) {
            let epmloyeeFN = employee.first_name;
            employeesArr.push(epmloyeeFN)
        }
        inquirer.prompt(
            {
                type: "list",
                name: "employeeName",
                message: "What is the first name of employee would you like to update role? ",
                choices: employeesArr
            }
        )
            .then(answer => {
                connection.query("SELECT * FROM role", (err, roles) => {
                    if (err) throw err;
                    //creating role array
                    let rolesArr = [];
                    for (let i = 0; i < roles.length; i++) {
                        let role = roles[i].title;
                        rolesArr.push(role);
                    };

                    inquirer.prompt(
                        {
                            type: "list",
                            name: "roleName",
                            message: "what is the new role for this employee?",
                            choices: rolesArr
                        }
                    )
                        .then(res => {
                            connection.query("SELECT * FROM role WHERE role.title = ?", [res.roleName], (err, data) => {
                                if (err) throw err;
                                // console.log(data);
                                let newRoleId = data[0].id
                                connection.query(`UPDATE employee SET employee.role_id = '${newRoleId}' 
                                  WHERE employee.first_name = ?`, [answer.employeeName], (err) => {
                                    if (err) throw err;
                                    console.log(chalk.green("role successfully updated"));
                                    start();
                                })
                            })
                        })
                })
            })

    })
}

// remove employee from the DB
function removeEmployee() {
    connection.query("SELECT * FROM employee", (err, data) => {
        if (err) throw err;
        let employeeArr = [];
        for (const employee of data) {
            let epmloyeeFN = `${employee.first_name} ${employee.last_name}`;
            employeeArr.push(epmloyeeFN)
        }
        inquirer.prompt(
            {
                type: "list",
                name: "delete",
                message: "What is the name of employee would you like to delete? ",
                choices: employeeArr
            }
        )
            .then(answer => {
                connection.query("DELETE FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?", [answer.delete], (err) => {
                    if (err) throw err;
                    console.log(chalk.green("selected employee succesfully deleted!"));
                    start();
                })
            })
    })

}