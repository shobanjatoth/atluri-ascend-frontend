document.addEventListener("DOMContentLoaded", () => {
    initializeProfilePage();
});


/* =========================================================
   INITIALIZE
========================================================= */

function initializeProfilePage() {

    setupMobileMenu();
    setupLogout();
    setupRetryButton();
    setCurrentDate();

    loadProfile();
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {

    showLoadingState();
    hideProfileError();

    try {

        // Get employee information
        const employee = await apiRequest(
            "/api/employees/me"
        );

        console.log("Employee profile:", employee);

        // Get logged-in user information
        let user = null;

        try {

            user = await apiRequest(
                "/api/auth/me"
            );

            console.log("User profile:", user);

        } catch (error) {

            console.warn(
                "Unable to load user account information:",
                error
            );
        }


        // Populate employee information
        populateEmployeeProfile(employee);


        // Populate account information
        if (user) {
            populateAccountInformation(user);
        }


        // Load department name
        await loadDepartment(employee.department_id);


    } catch (error) {

        console.error(
            "Profile loading failed:",
            error
        );

        showProfileError(
            error.message ||
            "Unable to load your profile."
        );

    }
}


/* =========================================================
   POPULATE EMPLOYEE PROFILE
========================================================= */

function populateEmployeeProfile(employee) {

    if (!employee) {
        return;
    }


    /* -----------------------------------------------------
       NAME
    ----------------------------------------------------- */

    const employeeName =
        employee.name || "Employee";

    setText(
        "profileName",
        employeeName
    );

    setText(
        "infoName",
        employeeName
    );


    /* -----------------------------------------------------
       DESIGNATION
    ----------------------------------------------------- */

    const designation =
        employee.designation || "—";

    setText(
        "profileDesignation",
        designation
    );

    setText(
        "infoDesignation",
        designation
    );


    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    setText(
        "infoEmail",
        employee.email || "—"
    );


    /* -----------------------------------------------------
       PHONE
    ----------------------------------------------------- */

    setText(
        "infoPhone",
        employee.phone || "—"
    );


    /* -----------------------------------------------------
       EMPLOYEE CODE
    ----------------------------------------------------- */

    setText(
        "profileEmployeeCode",
        employee.employee_code || "—"
    );


    /* -----------------------------------------------------
       STATUS
    ----------------------------------------------------- */

    const status =
        employee.status || "ACTIVE";

    setText(
        "profileStatus",
        formatStatus(status)
    );


    /* -----------------------------------------------------
       JOINING DATE
    ----------------------------------------------------- */

    setText(
        "infoJoiningDate",
        formatDate(employee.joining_date)
    );


    /* -----------------------------------------------------
       AVATARS
    ----------------------------------------------------- */

    const initial =
        getInitial(employeeName);

    setText(
        "employeeAvatar",
        initial
    );

    setText(
        "largeProfileAvatar",
        initial
    );


    /* -----------------------------------------------------
       TOPBAR NAME
    ----------------------------------------------------- */

    setText(
        "currentUsername",
        employeeName
    );
}


/* =========================================================
   ACCOUNT INFORMATION
========================================================= */

function populateAccountInformation(user) {

    if (!user) {
        return;
    }


    /* -----------------------------------------------------
       USERNAME
    ----------------------------------------------------- */

    setText(
        "infoUsername",
        user.username || "—"
    );


    /* -----------------------------------------------------
       ACCOUNT STATUS
    ----------------------------------------------------- */

    setText(
        "infoAccountStatus",
        user.is_active
            ? "Active"
            : "Inactive"
    );


    /* -----------------------------------------------------
       USER ID
    ----------------------------------------------------- */

    setText(
        "infoUserId",
        user.id ?? "—"
    );


    /* -----------------------------------------------------
       TOPBAR USERNAME
    ----------------------------------------------------- */

    if (user.username) {

        setText(
            "currentUsername",
            user.username
        );
    }
}


/* =========================================================
   DEPARTMENT
========================================================= */

async function loadDepartment(departmentId) {

    const departmentElement =
        document.getElementById("infoDepartment");

    if (!departmentElement) {
        return;
    }


    if (!departmentId) {

        departmentElement.textContent = "—";

        return;
    }


    try {

        const departments = await apiRequest(
            "/api/departments"
        );


        if (!Array.isArray(departments)) {

            departmentElement.textContent =
                `Department #${departmentId}`;

            return;
        }


        const department =
            departments.find(
                item => item.id === departmentId
            );


        if (department) {

            departmentElement.textContent =
                department.name;

        } else {

            departmentElement.textContent =
                `Department #${departmentId}`;
        }


    } catch (error) {

        console.warn(
            "Unable to load department name:",
            error
        );


        // Do not fail the whole profile
        departmentElement.textContent =
            `Department #${departmentId}`;
    }
}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoadingState() {

    setText(
        "profileName",
        "Loading..."
    );

    setText(
        "profileDesignation",
        "—"
    );

    setText(
        "profileEmployeeCode",
        "—"
    );

    setText(
        "infoName",
        "—"
    );

    setText(
        "infoEmail",
        "—"
    );

    setText(
        "infoPhone",
        "—"
    );

    setText(
        "infoDepartment",
        "—"
    );

    setText(
        "infoDesignation",
        "—"
    );

    setText(
        "infoJoiningDate",
        "—"
    );

    setText(
        "infoUsername",
        "—"
    );

    setText(
        "infoAccountStatus",
        "—"
    );

    setText(
        "infoUserId",
        "—"
    );
}


/* =========================================================
   ERROR
========================================================= */

function showProfileError(message) {

    const errorBox =
        document.getElementById("profileError");

    const errorMessage =
        document.getElementById("profileErrorMessage");


    if (errorMessage) {

        errorMessage.textContent =
            message;
    }


    if (errorBox) {

        errorBox.hidden = false;
    }
}


function hideProfileError() {

    const errorBox =
        document.getElementById("profileError");

    if (errorBox) {

        errorBox.hidden = true;
    }
}


/* =========================================================
   RETRY
========================================================= */

function setupRetryButton() {

    const retryButton =
        document.getElementById(
            "retryProfileButton"
        );


    if (!retryButton) {
        return;
    }


    retryButton.addEventListener(
        "click",
        () => {

            loadProfile();

        }
    );
}


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) {
        return;
    }


    const now = new Date();


    dateElement.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {

    if (!status) {
        return "Active";
    }


    return status
        .toString()
        .charAt(0)
        .toUpperCase()
        +
        status
            .toString()
            .slice(1)
            .toLowerCase();
}


/* =========================================================
   GET INITIAL
========================================================= */

function getInitial(name) {

    if (!name) {
        return "E";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.textContent =
        value ?? "—";
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "employeeSidebar"
        );


    if (!menuButton || !sidebar) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            if (
                typeof logout ===
                "function"
            ) {

                logout();

                return;
            }


            localStorage.removeItem(
                APP_CONFIG.TOKEN_KEY
            );

            localStorage.removeItem(
                APP_CONFIG.USER_KEY
            );


            window.location.href =
                "../login.html";
        }
    );
}