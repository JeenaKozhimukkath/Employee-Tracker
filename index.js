const inquirer = require("inquirer");
const mysql = require("mysql2");
const table = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Uot_camp",
    database: "employee_db"
})

connection.connect(function (err) {
    if (err) throw err;
    console.log("-------EMPLOYEE TRACKER-------")
    
    userPrompt();
});


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
                "View All Employees by Department",
                "View All Employees by Role", 
                "Add Department",
                "Add Role",
                "Add Employee",
                "Update Employee Role",
                "Exit"
            ]
        }
    ]).then(function(answers) {
        switch (answers.userinput) {
            
            case "View All Departments":
                console.log("viewAllDepartments");
                viewAllDepartments();
            break;

            case "View All Roles":
                viewAllRoles();
            break;

            case "View All Employees":
                viewAllEmployees();
            break;

            case "View All Employees by Department":
                viewEmplByDept();
            break;

            case "View All Employees by Role":
                viewEmpByRole();
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
                updateEmployeeRole();
            break;

            case "Exit":
                connection.end();
            break;

        }
    })
};

function viewAllDepartments() {
    connection.query("SELECT id AS ID, dept_name AS Department FROM department;",
    function(err,res){
        if (err) {throw err};
        console.log("----Department List----");
        console.table(res);
        userPrompt();
    })
}

function viewAllRoles() {
    connection.query("SELECT role.id AS ID, role.title as Title, department.dept_name AS Department,role.salary as Salary FROM role JOIN department ON role.department_id = department.id;",
    function(err,res){
        if (err) {throw err};
        console.log("----Role List----");
        console.table(res);
        userPrompt();
    })
}

function viewAllEmployees() {
    connection.query(`SELECT employees.first_name AS First_Name, employees.last_name AS Last_Name, role.title AS Title, role.salary AS Salary, department.dept_name AS Department, CONCAT(e.first_Name, ' ' ,e.last_Name) AS Manager 
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

function viewEmplByDept() {
    connection.query("SELECT employees.first_name AS First_Name, employees.last_name AS Last_Name, department.dept_name AS Department FROM employees JOIN role ON employees.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY department.id;", 
    function(err, res) {
      if (err) throw err
      console.log ("");
      console.log("----Employees List by Department----")
      console.log ("");
      console.table(res)
      userPrompt()
    })
  }

  function viewEmpByRole() {
    connection.query("SELECT employees.first_name AS First_Name, employees.last_name AS Last_Name, role.title AS Title FROM employees JOIN role ON employees.role_id = role.id ORDER BY role.id", 
    function(err, res) {
    if (err) throw err
    console.log("----Employees List by Role----")
    console.table(res);
    userPrompt()
    })
  }

function addDepartment() {
    inquirer.prompt(
        {
            name: 'name',
            message: 'What is the department name?',
            type: 'input'
        }
    ).then(function({name}){
        connection.query(`INSERT INTO department (dept_name) VALUES ('${name}')`, function (err, res) {
            if (err) throw err;
            console.log("----Department Added----");
            userPrompt();
        })
    })
}



function addRole() {
    let ListDept;
    connection.query(`SELECT * FROM department`, function(err, res){
        if (err) throw err;
         ListDept = res.map( data => ({
            name: data.dept_name,
            value: data.id 
        })
        )
        inquirer.prompt ([
        {
            name: 'title',
            message: "What is the role?",
            type: 'input'
        },
        {
            name: 'salary',
            message: 'What is the salary?',
            type: 'input'
        },
        {
            name: 'department_id',
            message: 'Select department:',
            type: 'list',
            choices: ListDept
        }

    ]).then(function(answer){
        console.log(answer);
        //let deptId = answer.id;
        console.log()
        connection.query(`INSERT INTO role (title, salary, department_id) VALUES ('${answer.title}', '${answer.salary}', ${answer.department_id})`, function (err, res) {
            if (err) throw err;
            console.log('Role added')
            userPrompt();
        })
    })
    });
   
}

function addEmployee() {
    let listRole;
    let listManager;
    connection.query("SELECT * FROM role", function(err, res) {
        if (err) throw err
        listRole = res.map( data => ({
            value: data.id, name: data.title
        }));
        connection.query("SELECT id, first_name, last_name FROM employees", function(err, res) {
            if (err) throw err
            listManager = res.map( data => ({
                value: data.id, name: data.first_name + " " + data.last_name
            })
            )
            inquirer
            .prompt([
              {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?"
              },
              {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?"
              },
              {
                type: "list",
                name: "roleId",
                message: "What is the employee's role?",
                choices: listRole
              },
              {
                name: "managerId",
                type: "rawlist",
                message: "Who is managing the new employee? ",
                choices: listManager
            }
            ])
            .then(function (answer) {
              console.log(answer);
        
              var query = `INSERT INTO employees SET ?`
              // when finished prompting, insert a new item into the db with that info
              connection.query(query,
                {
                  first_name: answer.first_name,
                  last_name: answer.last_name,
                  role_id: answer.roleId,
                  manager_id: answer.managerId,
                },
                function (err, res) {
                  if (err) throw err;
        
                  console.table(res);
                  console.log(res.insertedRows + "Inserted successfully!\n");
        
                  userPrompt();
                });
            });

          })
    })



   
}

function updateEmployeeRole() {
    let listEmp;
    connection.query("SELECT id, first_name, last_name FROM employees", function(err, res) {
        if (err) throw err
        listEmp = res.map( data => ({
            value: data.id, name: data.first_name + " " + data.last_name
        }));
        let listRole;
        connection.query("SELECT * FROM role", function(err, res) {
            if (err) throw err
            listRole = res.map( data => ({
                value: data.id, name: data.title
            }));
            connection.query("SELECT employees.first_name, employees.last_name, role.title FROM employees JOIN role ON employees.role_id = role.id;", 
            (err, res) => {
            if (err) throw err;
 
            inquirer.prompt([
                {
                    name: "emp",
                    type: "list",
                    choices: listEmp,
                    message: "What is the employee's name? ",
                },
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's new title? ",
                    choices:  listRole
                },
            ]).then(function (answers) {
                
                connection.query(`UPDATE employees SET role_id=${answers.role} WHERE ?`,
                    {
                        id:answers.emp
                    },
        
                    function (err) {
                        if (err)
                            throw err;
                        console.table(answers);
                        console.log(res.insertedRows + "Updated successfully!\n");
        
                        userPrompt();
                    });
            });
        });

        })
    })




    
  }

  