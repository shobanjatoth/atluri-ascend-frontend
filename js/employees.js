/* =====================================================
   EMPLOYEES PAGE
===================================================== */


let allEmployees = [];

let selectedEmployeeId = null;


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ---------------------------------------------
    // AUTH CHECK
    // ---------------------------------------------

    const token =
        localStorage.getItem(APP_CONFIG.TOKEN_KEY);

    if (!token) {
        window.location.href = "../login.html";
        return;
    }


    // ---------------------------------------------
    // CURRENT USER
    // ---------------------------------------------

    loadCurrentUser();


    // ---------------------------------------------
    // DATE
    // ---------------------------------------------

    displayCurrentDate();


    // ---------------------------------------------
    // EVENT LISTENERS
    // ---------------------------------------------

    setupEventListeners();


    // ---------------------------------------------
    // LOAD DATA
    // ---------------------------------------------

    await loadDepartments();

    await loadEmployees();

});


// =====================================================
// CURRENT USER
// =====================================================

function loadCurrentUser() {

    const userData =
        localStorage.getItem(APP_CONFIG.USER_KEY);

    if (!userData) {
        return;
    }


    try {

        const user =
            JSON.parse(userData);

        const usernameElement =
            document.getElementById("currentUsername");

        if (
            usernameElement &&
            user.username
        ) {
            usernameElement.textContent =
                user.username;
        }

    } catch (error) {

        console.error(
            "Unable to read user information:",
            error
        );

    }
}


// =====================================================
// CURRENT DATE
// =====================================================

function displayCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {

    // Search

    const searchInput =
        document.getElementById("employeeSearch");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    // Department filter

    const departmentFilter =
        document.getElementById("departmentFilter");

    if (departmentFilter) {

        departmentFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // Status filter

    const statusFilter =
        document.getElementById("statusFilter");

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // Clear filters

    const clearButton =
        document.getElementById(
            "clearFiltersButton"
        );

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    // Refresh

    const refreshButton =
        document.getElementById(
            "refreshEmployeesButton"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadEmployees();

            }
        );

    }


    // Add employee

    const addButton =
        document.getElementById(
            "addEmployeeButton"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "employee-form.html";

            }
        );

    }


    // Close modal

    const closeModalButton =
        document.getElementById(
            "closeDeactivateModal"
        );

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeDeactivateModal
        );

    }


    // Cancel modal

    const cancelButton =
        document.getElementById(
            "cancelDeactivateButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeDeactivateModal
        );

    }


    // Confirm deactivate

    const confirmButton =
        document.getElementById(
            "confirmDeactivateButton"
        );

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            confirmDeactivate
        );

    }


    // Logout

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                logout();

            }
        );

    }


    // Mobile menu

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById("sidebar");

    if (
        mobileMenuButton &&
        sidebar
    ) {

        mobileMenuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }
        );

    }
}


// =====================================================
// LOAD DEPARTMENTS
// =====================================================

async function loadDepartments() {

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    if (!departmentFilter) {
        return;
    }


    try {

        const departments =
            await getDepartments();


        departments.forEach(function (department) {

            const option =
                document.createElement("option");

            option.value =
                department.id;

            option.textContent =
                department.name;

            departmentFilter.appendChild(
                option
            );

        });

    } catch (error) {

        console.error(
            "Unable to load departments:",
            error
        );

    }
}


// =====================================================
// LOAD EMPLOYEES
// =====================================================

async function loadEmployees() {

    const tableBody =
        document.getElementById(
            "employeesTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="table-message">
                    Loading employees...
                </td>
            </tr>
        `;

    }


    try {

        const employees =
            await getEmployees();


        allEmployees =
            Array.isArray(employees)
                ? employees
                : [];


        updateSummary(
            allEmployees
        );


        applyFilters();

    } catch (error) {

        console.error(
            "Unable to load employees:",
            error
        );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-message">
                        Unable to load employees.
                    </td>
                </tr>
            `;

        }

    }
}


// =====================================================
// SUMMARY
// =====================================================

function updateSummary(employees) {

    const total =
        employees.length;


    let active =
        0;

    let inactive =
        0;


    employees.forEach(function (employee) {

        if (employee.status === "ACTIVE") {

            active++;

        } else {

            inactive++;

        }

    });


    const totalElement =
        document.getElementById(
            "employeeTotal"
        );

    const activeElement =
        document.getElementById(
            "employeeActive"
        );

    const inactiveElement =
        document.getElementById(
            "employeeInactive"
        );


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (activeElement) {
        activeElement.textContent = active;
    }

    if (inactiveElement) {
        inactiveElement.textContent = inactive;
    }
}


// =====================================================
// APPLY FILTERS
// =====================================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "employeeSearch"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const departmentId =
        departmentFilter
            ? departmentFilter.value
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const filteredEmployees =
        allEmployees.filter(
            function (employee) {

                // Search

                const matchesSearch =
                    !search ||
                    String(
                        employee.name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        employee.employee_code || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        employee.email || ""
                    )
                        .toLowerCase()
                        .includes(search);


                // Department

                const matchesDepartment =
                    !departmentId ||
                    String(
                        employee.department_id
                    ) === String(
                        departmentId
                    );


                // Status

                const matchesStatus =
                    !status ||
                    employee.status === status;


                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesStatus
                );

            }
        );


    renderEmployees(
        filteredEmployees
    );
}


// =====================================================
// RENDER EMPLOYEES
// =====================================================

function renderEmployees(employees) {

    const tableBody =
        document.getElementById(
            "employeesTableBody"
        );


    const resultCount =
        document.getElementById(
            "employeeResultCount"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (resultCount) {

        resultCount.textContent =
            `${employees.length} employee${
                employees.length === 1
                    ? ""
                    : "s"
            } found`;

    }


    if (employees.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="table-message">
                    No employees match the selected filters.
                </td>
            </tr>
        `;

        return;
    }


    employees.forEach(function (employee) {

        const row =
            document.createElement("tr");


        // -----------------------------------------
        // EMPLOYEE
        // -----------------------------------------

        const employeeCell =
            document.createElement("td");


        const employeeWrapper =
            document.createElement("div");

        employeeWrapper.className =
            "employee-cell";


        const avatar =
            document.createElement("div");

        avatar.className =
            "employee-avatar";

        avatar.textContent =
            getInitials(employee.name);


        const employeeDetails =
            document.createElement("div");


        const name =
            document.createElement("span");

        name.className =
            "employee-name";

        name.textContent =
            employee.name || "—";


        const email =
            document.createElement("span");

        email.className =
            "employee-email";

        email.textContent =
            employee.email || "—";


        employeeDetails.appendChild(name);
        employeeDetails.appendChild(email);

        employeeWrapper.appendChild(avatar);
        employeeWrapper.appendChild(employeeDetails);

        employeeCell.appendChild(employeeWrapper);


        // -----------------------------------------
        // CODE
        // -----------------------------------------

        const codeCell =
            document.createElement("td");

        codeCell.textContent =
            employee.employee_code || "—";


        // -----------------------------------------
        // DEPARTMENT
        // -----------------------------------------

        const departmentCell =
            document.createElement("td");

        departmentCell.textContent =
            employee.department_name ||
            employee.department?.name ||
            "—";


        // -----------------------------------------
        // DESIGNATION
        // -----------------------------------------

        const designationCell =
            document.createElement("td");

        designationCell.textContent =
            employee.designation || "—";


        // -----------------------------------------
        // CONTACT
        // -----------------------------------------

        const contactCell =
            document.createElement("td");

        contactCell.textContent =
            employee.phone || "—";


        // -----------------------------------------
        // JOINING DATE
        // -----------------------------------------

        const joiningDateCell =
            document.createElement("td");

        joiningDateCell.textContent =
            formatDate(
                employee.joining_date
            );


        // -----------------------------------------
        // STATUS
        // -----------------------------------------

        const statusCell =
            document.createElement("td");


        const statusBadge =
            document.createElement("span");

        statusBadge.className =
            "employee-status";


        if (employee.status === "ACTIVE") {

            statusBadge.classList.add("active");

            statusBadge.textContent =
                "Active";

        } else {

            statusBadge.classList.add("inactive");

            statusBadge.textContent =
                "Inactive";

        }


        statusCell.appendChild(
            statusBadge
        );


        // -----------------------------------------
        // ACTIONS
        // -----------------------------------------

        const actionCell =
            document.createElement("td");


        const actionWrapper =
            document.createElement("div");

        actionWrapper.className =
            "employee-actions";


        // Edit

        const editButton =
            document.createElement("button");

        editButton.type =
            "button";

        editButton.className =
            "action-button";

        editButton.title =
            "Edit employee";

        editButton.textContent =
            "✎";


        editButton.addEventListener(
            "click",
            function () {

                editEmployee(
                    employee.id
                );

            }
        );


        actionWrapper.appendChild(
            editButton
        );


        // Deactivate

        if (employee.status === "ACTIVE") {

            const deactivateButton =
                document.createElement("button");

            deactivateButton.type =
                "button";

            deactivateButton.className =
                "action-button deactivate";

            deactivateButton.title =
                "Deactivate employee";

            deactivateButton.textContent =
                "⊘";


            deactivateButton.addEventListener(
                "click",
                function () {

                    openDeactivateModal(
                        employee
                    );

                }
            );


            actionWrapper.appendChild(
                deactivateButton
            );

        }


        actionCell.appendChild(
            actionWrapper
        );


        // -----------------------------------------
        // APPEND ROW
        // -----------------------------------------

        row.appendChild(employeeCell);
        row.appendChild(codeCell);
        row.appendChild(departmentCell);
        row.appendChild(designationCell);
        row.appendChild(contactCell);
        row.appendChild(joiningDateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);


        tableBody.appendChild(row);

    });
}


// =====================================================
// EDIT EMPLOYEE
// =====================================================

function editEmployee(employeeId) {

    window.location.href =
        `employee-form.html?id=${employeeId}`;

}


// =====================================================
// DEACTIVATE MODAL
// =====================================================

function openDeactivateModal(employee) {

    selectedEmployeeId =
        employee.id;


    const nameElement =
        document.getElementById(
            "deactivateEmployeeName"
        );


    if (nameElement) {

        nameElement.textContent =
            employee.name;

    }


    const modal =
        document.getElementById(
            "deactivateModal"
        );


    if (modal) {

        modal.classList.remove("hidden");

    }
}


// =====================================================
// CLOSE DEACTIVATE MODAL
// =====================================================

function closeDeactivateModal() {

    selectedEmployeeId =
        null;


    const modal =
        document.getElementById(
            "deactivateModal"
        );


    if (modal) {

        modal.classList.add("hidden");

    }
}


// =====================================================
// CONFIRM DEACTIVATE
// =====================================================

async function confirmDeactivate() {

    if (!selectedEmployeeId) {
        return;
    }


    const confirmButton =
        document.getElementById(
            "confirmDeactivateButton"
        );


    if (confirmButton) {

        confirmButton.disabled = true;

        confirmButton.textContent =
            "Deactivating...";

    }


    try {

        await deactivateEmployee(
            selectedEmployeeId
        );


        closeDeactivateModal();

        await loadEmployees();

    } catch (error) {

        console.error(
            "Unable to deactivate employee:",
            error
        );


        alert(
            error.message ||
            "Unable to deactivate employee."
        );

    } finally {

        if (confirmButton) {

            confirmButton.disabled = false;

            confirmButton.textContent =
                "Deactivate";

        }

    }
}


// =====================================================
// CLEAR FILTERS
// =====================================================

function clearFilters() {

    const searchInput =
        document.getElementById(
            "employeeSearch"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    if (searchInput) {
        searchInput.value = "";
    }


    if (departmentFilter) {
        departmentFilter.value = "";
    }


    if (statusFilter) {
        statusFilter.value = "";
    }


    applyFilters();
}


// =====================================================
// INITIALS
// =====================================================

function getInitials(name) {

    if (!name) {
        return "E";
    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return "—";
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