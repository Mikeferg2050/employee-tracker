const inquirer = require("inquirer");
const db = require("./db/connection");

// Function to start the application and display the main menu
function startApp() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Update an Employee Role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View All Departments":
          viewDepartments();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "View All Employees":
          viewEmployees();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Update an Employee Role":
          updateEmployeeRole();
          break;
        default:
          db.end();
      }
    });
}

// Function to view all departments
function viewDepartments() {
  const sql = "SELECT id, name FROM department";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.table(results.rows);
    startApp(); // Go back to the main menu
  });
}

// Function to view all roles
function viewRoles() {
  const sql = `
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
    `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.table(results.rows);
    startApp();
  });
}

// Function to view all employees
function viewEmployees() {
  const sql = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
               CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON manager.id = employee.manager_id
    `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.table(results.rows);
    startApp();
  });
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the name of the department:",
        validate: (input) => (input ? true : "This field cannot be empty"),
      },
    ])
    .then((answer) => {
      const sql = "INSERT INTO department (name) VALUES ($1)";
      db.query(sql, [answer.name], (err, results) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log("Department added successfully!");
        startApp();
      });
    });
}

// Function to add a role
function addRole() {
  const sqlDept = "SELECT id, name FROM department";
  db.query(sqlDept, (err, results) => {
    if (err) {
      console.error(err.message);
      return;
    }

    const departments = results.rows.map(({ id, name }) => ({
      name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the role:",
          validate: (input) => (input ? true : "This field cannot be empty"),
        },
        {
          type: "input",
          name: "salary",
          message: "Enter the salary for the role:",
          validate: (input) =>
            !isNaN(input) ? true : "Please enter a valid number",
        },
        {
          type: "list",
          name: "department_id",
          message: "Select the department for the role:",
          choices: departments,
        },
      ])
      .then((answer) => {
        const sql =
          "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)";
        db.query(
          sql,
          [answer.title, answer.salary, answer.department_id],
          (err, results) => {
            if (err) {
              console.error(err.message);
              return;
            }
            console.log("Role added successfully!");
            startApp();
          }
        );
      });
  });
}

// Function to add an employee
function addEmployee() {
  const sqlRole = "SELECT id, title FROM role";
  const sqlEmployee =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee";

  db.query(sqlRole, (err, roleResults) => {
    if (err) {
      console.error(err.message);
      return;
    }

    db.query(sqlEmployee, (err, employeeResults) => {
      if (err) {
        console.error(err.message);
        return;
      }

      const roles = roleResults.rows.map(({ id, title }) => ({
        name: title,
        value: id,
      }));
      const managers = employeeResults.rows.map(({ id, name }) => ({
        name,
        value: id,
      }));
      managers.push({ name: "None", value: null });

      inquirer
        .prompt([
          {
            type: "input",
            name: "first_name",
            message: "Enter the first name of the employee:",
            validate: (input) => (input ? true : "This field cannot be empty"),
          },
          {
            type: "input",
            name: "last_name",
            message: "Enter the last name of the employee:",
            validate: (input) => (input ? true : "This field cannot be empty"),
          },
          {
            type: "list",
            name: "role_id",
            message: "Select the role for the employee:",
            choices: roles,
          },
          {
            type: "list",
            name: "manager_id",
            message: "Select the manager for the employee:",
            choices: managers,
          },
        ])
        .then((answer) => {
          const sql =
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)";
          db.query(
            sql,
            [
              answer.first_name,
              answer.last_name,
              answer.role_id,
              answer.manager_id,
            ],
            (err, results) => {
              if (err) {
                console.error(err.message);
                return;
              }
              console.log("Employee added successfully!");
              startApp();
            }
          );
        });
    });
  });
}

// Function to update an employee's role
function updateEmployeeRole() {
  const sqlEmployee =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee";
  const sqlRole = "SELECT id, title FROM role";

  db.query(sqlEmployee, (err, employeeResults) => {
    if (err) {
      console.error(err.message);
      return;
    }

    db.query(sqlRole, (err, roleResults) => {
      if (err) {
        console.error(err.message);
        return;
      }

      const employees = employeeResults.rows.map(({ id, name }) => ({
        name,
        value: id,
      }));
      const roles = roleResults.rows.map(({ id, title }) => ({
        name: title,
        value: id,
      }));

      inquirer
        .prompt([
          {
            type: "list",
            name: "employee_id",
            message: "Select the employee whose role you want to update:",
            choices: employees,
          },
          {
            type: "list",
            name: "role_id",
            message: "Select the new role for the employee:",
            choices: roles,
          },
        ])
        .then((answer) => {
          const sql = "UPDATE employee SET role_id = $1 WHERE id = $2";
          db.query(
            sql,
            [answer.role_id, answer.employee_id],
            (err, results) => {
              if (err) {
                console.error(err.message);
                return;
              }
              console.log("Employee role updated successfully!");
              startApp();
            }
          );
        });
    });
  });
}

// Start the application
startApp();
