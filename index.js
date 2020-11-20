const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");
// const { allowedNodeEnvironmentFlags } = require("process");

//create database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "yourRootPassword",
    database: "Employee_DB"
});

//connect to mysql server
connection.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected as id " + connection.threadId);
        start();
    }
});

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
            "Exit"
        ]
    })
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
                case "Exit":
                    connection.end();
            }
        })
}

function viewEmployees() {
    let allEmployee = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,CONCAT(m.first_name, " ", m.last_name) AS manager
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON m.id = employee.manager_id`
    connection.query(allEmployee, (err, data) => {
        if (err) throw err;
        // let employeeArr = [];
        // for (const employee of data) {
        //     let employeeTable =
        //     {
        //         id: employee.id,
        //         first_name: employee.first_name,
        //         last_name: employee.last_name,
        //         role_id: employee.role_id,
        //         manager_id: employee.manager_id

        //     }
        //     employeeArr.push(employeeTable);

        // }
        // console.table(employeeArr);
        console.table(data);
        start();
    })
}

function addDepartment() {
    inquirer.prompt({
        type: "input",
        name: "add",
        message: "What department you would like to add?"
    }).then(answer => {
        let dep = 'INSERT INTO department SET ?';
        connection.query(dep, { name: answer.add }, (err) => {
            if (err) throw err;
            console.log("New department added!");
            start();
        })
    })
}

function addRole() {
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
            type: "input",
            name: "dep",
            message: "What is the department id of this role?"
        }
    ])
        .then(answer => {
            let role = 'INSERT INTO role SET ?';
            connection.query(role, {
                title: answer.title,
                salary: answer.salary,
                department_id: answer.dep
            }, (err) => {
                if (err) throw err;
                console.log("New role added!");
                start();
            })
        })
}

function addEmployee() {
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
            type: "input",
            name: "roleid",
            message: "What is the role id for this employee?"
        },
        {
            type: "input",
            name: "managerid",
            message: "What is the manager id for this employee?"
        }
    ])
        .then(answer => {
            let emplo = 'INSERT INTO employee SET ?';
            connection.query(emplo, {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.roleid,
                manager_id: answer.managerid
            }, (err) => {
                if (err) throw err;
                console.log("New epmloyee added!");
                start();
            })
        })
}

function viewDepartment() {
    let department = 'SELECT * FROM department';
    connection.query(department, (err, data) => {
        if (err) throw err;
        // let deptArr = [];
        // for (const dept of data) {
        //     let deptTable =
        //     {
        //         id: dept.id,
        //         name: dept.name
        //     }
        //     deptArr.push(deptTable);

        // }
        // console.table(deptArr);
        console.table(data);
        start();
    })
}

function viewRoles() {
    let role = 'SELECT * FROM role';
    connection.query(role, (err, data) => {
        if (err) throw err;
        // let roleArr = [];
        // for (const role of data) {
        //     let roleTable =
        //     {
        //         id: role.id,
        //         title: role.title,
        //         salary: role.salary,
        //         department_id: role.department_id
        //     }
        //     roleArr.push(roleTable);
        // }
        // console.table(roleArr);
        console.table(data);
        start();
    })

}

function updateRole() {

}