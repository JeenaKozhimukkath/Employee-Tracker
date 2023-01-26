const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employee_db"
})

function userPrompt() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "userinput",
            choices: [
                "View All Departments",
                "View All Roles",
                "View All Employees", 
                "Add Department",
                "Add Role",
                "Add Employee",
                "Update Employee Role",
                "Exit"
            ]
        }
    ]).then(function(answers) {
        switch (answers.action) {
            case "View All Departments":
                viewAllDepartments();
            break;

            case "View All Roles":
                viewAllRoles();
            break;

            case "View All Employees":
                viewAllEmployees();
            break;

            case "Add Department":
                addDepartment();
            break;
            
            case "Add Role":
                addRole();
            break;

            case "Add Employee":
                addEmployee();
            break;

            case "Update Employee Role":
                updateRole();
            break;

            case "Exit":
                connection.end();
            break;

        }
    })
};

function viewAllDepartments() {
    connection.query("SELECT id AS ID, name AS Department FROM department;",
    function(err,res){
        if (err) {throw err};
        console.log("----Department List----");
        console.table(res);
        userPrompt();
    })
}

function viewAllRoles() {
    connection.query("SELECT role.id AS ID, role.title as Title, department.name AS Department,role.salary as Salary FROM role JOIN department ON role.department_id = deapartment.id;",
    function(err,res){
        if (err) {throw err};
        console.log("----Role List----");
        console.table(res);
        userPrompt();
    })
}

function viewAllEmployees() {
    connection.query(`SELECT employees.first_name AS First_Name, employees.last_name AS Last_Name, role.title AS Title, role.salary AS Salary, department.name AS Department, CONCAT(e.firstName, ' ' ,e.lastName) AS Manager 
    FROM employees 
    INNER JOIN role on role.id = employees.role_id 
    INNER JOIN department on department.id = role.department_id 
    LEFT JOIN employees e on employees.manager_id = e.id;`,
    function(err,res){
        if (err) {throw err};
        console.log("----Employee List----");
        console.table(res);
        userPrompt();
    })
}

function addDepartment() {
    inquirer.prompt([
        
    ])
}