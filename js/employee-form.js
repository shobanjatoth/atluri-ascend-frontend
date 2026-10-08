document.addEventListener("DOMContentLoaded", () => {
    initializeEmployeeForm();
});


let editMode = false;
let employeeId = null;


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeEmployeeForm() {

    setupMobileMenu();
    setupLogout();
    setupButtons();
    setupPasswordToggle();
    setupFormValidation();

    displayCurrentDate();
    displayCurrentUser();

    detectEditMode();

    await loadDepartments();

    if (editMode) {
        await loadEmployee();
    }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button = document.getElementById("mobileMenuButton");
    const sidebar = document.getElementById("sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button = document.getElementById("logoutButton");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {

        if (typeof logout === "function") {
            logout();
            return;
        }

        localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
        localStorage.removeItem(APP_CONFIG.USER_KEY);

        window.location.href = "../login.html";
    });
}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    const backButton = document.getElementById("backButton");
    const cancelButton = document.getElementById("cancelButton");

    if (backButton) {
        backButton.addEventListener("click", goBack);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", goBack);
    }
}


function goBack() {

    window.location.href = "employees.html";
}


/* =========================================================
   DATE
========================================================= */

function displayCurrentDate() {

    const element = document.getElementById("currentDate");

    if (!element) {
        return;
    }

    const now = new Date();

    element.textContent = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================================================
   CURRENT USER
========================================================= */

function displayCurrentUser() {

    const element = document.getElementById("currentUsername");

    if (!element) {
        return;
    }

    try {

        const storedUser = localStorage.getItem(APP_CONFIG.USER_KEY);

        if (!storedUser) {
            return;
        }

        const user = JSON.parse(storedUser);

        if (user.username) {
            element.textContent = user.username;
        }

    } catch (error) {

        console.error("Unable to load current user:", error);

    }
}


/* =========================================================
   DETECT ADD / EDIT MODE
========================================================= */

function detectEditMode() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (id) {

        editMode = true;
        employeeId = id;

        setEditMode();

    } else {

        editMode = false;
        employeeId = null;

        setAddMode();
    }
}


/* =========================================================
   ADD MODE
========================================================= */

function setAddMode() {

    setText("pageTitle", "Add Employee");
    setText("formHeading", "Add New Employee");

    setText(
        "formDescription",
        "Create an employee account and assign their organizational details."
    );

    setText("saveButtonText", "Create Employee");

    const loginSection = document.getElementById("loginSection");

    if (loginSection) {
        loginSection.style.display = "";
    }
}


/* =========================================================
   EDIT MODE
========================================================= */

function setEditMode() {

    setText("pageTitle", "Edit Employee");
    setText("formHeading", "Edit Employee");

    setText(
        "formDescription",
        "Update employee information and organizational details."
    );

    setText("saveButtonText", "Update Employee");

    /*
     * Login credentials are only required while creating
     * a new employee.
     */

    const loginSection = document.getElementById("loginSection");

    if (loginSection) {
        loginSection.style.display = "none";
    }

    const passwordField = document.getElementById("password");

    if (passwordField) {
        passwordField.required = false;
    }

    const usernameField = document.getElementById("username");

    if (usernameField) {
        usernameField.required = false;
    }
}


/* =========================================================
   LOAD DEPARTMENTS
========================================================= */

async function loadDepartments() {

    const select = document.getElementById("departmentId");

    if (!select) {
        return;
    }

    try {

        const departments = await apiRequest("/api/departments");

        if (!Array.isArray(departments)) {
            return;
        }

        departments.forEach(department => {

            const option = document.createElement("option");

            option.value = department.id;

            option.textContent = department.name;

            select.appendChild(option);
        });

    } catch (error) {

        console.error("Failed to load departments:", error);

        showFormError(
            "Unable to load departments. Please refresh the page."
        );
    }
}


/* =========================================================
   LOAD EMPLOYEE
========================================================= */

async function loadEmployee() {

    try {

        const employee = await apiRequest(
            `/api/employees/${employeeId}`
        );

        populateEmployeeForm(employee);

    } catch (error) {

        console.error("Failed to load employee:", error);

        showFormError(
            error.message || "Unable to load employee information."
        );
    }
}


/* =========================================================
   POPULATE FORM
========================================================= */

function populateEmployeeForm(employee) {

    setValue("name", employee.name);
    setValue("email", employee.email);
    setValue("phone", employee.phone);
    setValue("employeeCode", employee.employee_code);
    setValue("designation", employee.designation);
    setValue("joiningDate", employee.joining_date);
    setValue("status", employee.status);

    const departmentId =
        employee.department_id ??
        employee.department?.id ??
        "";

    setValue("departmentId", departmentId);
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    const button = document.getElementById("togglePassword");
    const input = document.getElementById("password");

    if (!button || !input) {
        return;
    }

    button.addEventListener("click", () => {

        if (input.type === "password") {

            input.type = "text";
            button.textContent = "Hide";

        } else {

            input.type = "password";
            button.textContent = "Show";
        }
    });
}


/* =========================================================
   FORM VALIDATION
========================================================= */

function setupFormValidation() {

    const form = document.getElementById("employeeForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearErrors();

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        await saveEmployee();
    });
}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateForm() {

    let valid = true;

    const name = getValue("name");
    const email = getValue("email");
    const employeeCode = getValue("employeeCode");
    const phone = getValue("phone");
    const username = getValue("username");
    const password = getValue("password");


    /* NAME */

    if (!name) {

        showFieldError(
            "name",
            "nameError",
            "Full name is required."
        );

        valid = false;
    }


    /* EMAIL */

    if (!email) {

        showFieldError(
            "email",
            "emailError",
            "Email address is required."
        );

        valid = false;

    } else if (!isValidEmail(email)) {

        showFieldError(
            "email",
            "emailError",
            "Enter a valid email address."
        );

        valid = false;
    }


    /* PHONE */

    if (phone && !isValidPhone(phone)) {

        showFieldError(
            "phone",
            "phoneError",
            "Enter a valid phone number."
        );

        valid = false;
    }


    /* EMPLOYEE CODE */

    if (!employeeCode) {

        showFieldError(
            "employeeCode",
            "employeeCodeError",
            "Employee code is required."
        );

        valid = false;
    }


    /* USERNAME + PASSWORD */

    if (!editMode) {

        if (!username) {

            showFieldError(
                "username",
                "usernameError",
                "Username is required."
            );

            valid = false;
        }


        if (!password) {

            showFieldError(
                "password",
                "passwordError",
                "Temporary password is required."
            );

            valid = false;

        } else if (password.length < 6) {

            showFieldError(
                "password",
                "passwordError",
                "Password must contain at least 6 characters."
            );

            valid = false;
        }
    }


    return valid;
}


/* =========================================================
   SAVE EMPLOYEE
========================================================= */

async function saveEmployee() {

    const button = document.getElementById("saveEmployeeButton");
    const buttonText = document.getElementById("saveButtonText");

    if (button) {
        button.disabled = true;
    }

    if (buttonText) {
        buttonText.textContent = editMode
            ? "Updating..."
            : "Creating...";
    }


    try {

        const employeeData = {
            employee_code: getValue("employeeCode"),
            name: getValue("name"),
            email: getValue("email"),
            phone: getValue("phone") || null,
            department_id: getNumberValue("departmentId"),
            designation: getValue("designation") || null,
            joining_date: getValue("joiningDate") || null,
            status: getValue("status")
        };


        /*
         * Login information is required only when
         * creating a new employee.
         */

        if (!editMode) {

            employeeData.username = getValue("username");
            employeeData.password = getValue("password");
        }


        let response;


        if (editMode) {

            response = await apiRequest(
                `/api/employees/${employeeId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(employeeData)
                }
            );

        } else {

            response = await apiRequest(
                "/api/employees",
                {
                    method: "POST",
                    body: JSON.stringify(employeeData)
                }
            );
        }


        console.log(
            editMode
                ? "Employee updated:"
                : "Employee created:",
            response
        );


        showSuccessAndRedirect(
            editMode
                ? "Employee updated successfully."
                : "Employee created successfully."
        );


    } catch (error) {

        console.error("Employee save failed:", error);

        showFormError(
            error.message ||
            "Unable to save employee. Please try again."
        );

    } finally {

        if (button) {
            button.disabled = false;
        }

        if (buttonText) {
            buttonText.textContent = editMode
                ? "Update Employee"
                : "Create Employee";
        }
    }
}


/* =========================================================
   SUCCESS
========================================================= */

function showSuccessAndRedirect(message) {

    const alert = document.getElementById("formError");

    if (alert) {

        alert.classList.remove("hidden");

        alert.style.borderColor = "#c9dfca";
        alert.style.background = "#f1faf1";
        alert.style.color = "#3d7142";

        alert.textContent = message;
    }


    setTimeout(() => {

        window.location.href = "employees.html";

    }, 1000);
}


/* =========================================================
   FORM ERROR
========================================================= */

function showFormError(message) {

    const alert = document.getElementById("formError");

    if (!alert) {
        return;
    }

    alert.classList.remove("hidden");

    alert.style.borderColor = "";
    alert.style.background = "";
    alert.style.color = "";

    alert.textContent = message;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   FIELD ERROR
========================================================= */

function showFieldError(inputId, errorId, message) {

    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.classList.add("invalid");
    }

    if (error) {
        error.textContent = message;
    }
}


/* =========================================================
   CLEAR ERRORS
========================================================= */

function clearErrors() {

    const inputs = document.querySelectorAll(
        ".form-field input, .form-field select"
    );

    inputs.forEach(input => {
        input.classList.remove("invalid");
    });


    const errors = document.querySelectorAll(".field-error");

    errors.forEach(error => {
        error.textContent = "";
    });


    const formError = document.getElementById("formError");

    if (formError) {
        formError.classList.add("hidden");
    }
}


/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function setValue(id, value) {

    const element = document.getElementById(id);

    if (!element || value === null || value === undefined) {
        return;
    }

    element.value = value;
}


function getNumberValue(id) {

    const value = getValue(id);

    if (!value) {
        return null;
    }

    const number = Number(value);

    return Number.isNaN(number)
        ? null
        : number;
}


function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isValidPhone(phone) {

    return /^[0-9+\-\s()]{7,20}$/.test(phone);
}