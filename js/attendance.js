document.addEventListener("DOMContentLoaded", async function () {
    setupPage();
    await initializeAttendancePage();
});


/* =========================================================
   GLOBAL STATE
========================================================= */

let allAttendanceRecords = [];
let allEmployees = [];
let allDepartments = [];

let employeeMap = {};
let departmentMap = {};


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

async function initializeAttendancePage() {

    showLoading(true);
    hideAttendanceError();
    hideFilterError();

    try {

        await loadCurrentUser();

        await loadEmployees();

        await loadDepartments();

        populateEmployeeFilter();

        populateDepartmentFilter();

        await loadAttendance();

    } catch (error) {

        console.error(
            "Attendance initialization failed:",
            error
        );

        showAttendanceError(
            getErrorMessage(error)
        );

    } finally {

        showLoading(false);
    }
}


/* =========================================================
   PAGE SETUP
========================================================= */

function setupPage() {

    setCurrentDate();

    setupMobileMenu();

    setupLogout();

    setupFilterButtons();
}


/* =========================================================
   CURRENT DATE
========================================================= */

function setCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) {
        return;
    }

    const today = new Date();

    element.textContent =
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


/* =========================================================
   CURRENT USER
========================================================= */

async function loadCurrentUser() {

    const usernameElement =
        document.getElementById(
            "currentUsername"
        );

    if (!usernameElement) {
        return;
    }

    try {

        /*
         * Prefer the locally stored user.
         */

        const storedUser =
            getCurrentUser();

        if (
            storedUser &&
            storedUser.username
        ) {

            usernameElement.textContent =
                storedUser.username;

            return;
        }


        /*
         * If no stored user exists,
         * ask the backend.
         */

        const user =
            await apiRequest(
                "/api/auth/me"
            );

        if (
            user &&
            user.username
        ) {

            usernameElement.textContent =
                user.username;
        }

    } catch (error) {

        console.warn(
            "Unable to load current user:",
            error
        );

        usernameElement.textContent =
            "Admin";
    }
}


/* =========================================================
   LOAD EMPLOYEES
========================================================= */

async function loadEmployees() {

    const response =
        await getEmployees();

    allEmployees =
        normalizeListResponse(
            response,
            [
                "employees",
                "records",
                "data"
            ]
        );

    employeeMap = {};

    allEmployees.forEach(employee => {

        employeeMap[
            String(employee.id)
        ] = employee;
    });


    console.log(
        "Employees loaded:",
        allEmployees
    );
}


/* =========================================================
   LOAD DEPARTMENTS
========================================================= */

async function loadDepartments() {

    const response =
        await getDepartments();

    allDepartments =
        normalizeListResponse(
            response,
            [
                "departments",
                "records",
                "data"
            ]
        );

    departmentMap = {};

    allDepartments.forEach(department => {

        departmentMap[
            String(department.id)
        ] = department;
    });


    console.log(
        "Departments loaded:",
        allDepartments
    );
}


/* =========================================================
   POPULATE EMPLOYEE FILTER
========================================================= */

function populateEmployeeFilter() {

    const select =
        document.getElementById(
            "employeeFilter"
        );

    if (!select) {
        return;
    }

    select.innerHTML =
        '<option value="">All Employees</option>';


    allEmployees
        .sort(function (a, b) {

            return String(
                a.name || ""
            ).localeCompare(
                String(b.name || "")
            );

        })
        .forEach(function (employee) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                employee.id;

            const name =
                employee.name ||
                "Unknown Employee";

            const code =
                employee.employee_code ||
                "-";

            option.textContent =
                `${name} (${code})`;

            select.appendChild(
                option
            );
        });
}


/* =========================================================
   POPULATE DEPARTMENT FILTER
========================================================= */

function populateDepartmentFilter() {

    const select =
        document.getElementById(
            "departmentFilter"
        );

    if (!select) {
        return;
    }

    select.innerHTML =
        '<option value="">All Departments</option>';


    allDepartments
        .sort(function (a, b) {

            return String(
                a.name || ""
            ).localeCompare(
                String(b.name || "")
            );

        })
        .forEach(function (department) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department.id;

            option.textContent =
                department.name;

            select.appendChild(
                option
            );
        });
}


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

async function loadAttendance() {

    showLoading(true);

    hideAttendanceError();


    try {

        /*
         * Backend endpoint:
         *
         * GET /api/attendance
         *
         * Actual backend response:
         *
         * [
         *   {
         *      "id": 2,
         *      "employee_id": 1,
         *      "attendance_date": "2026-10-08",
         *      "check_in": "...",
         *      "check_out": null,
         *      "working_minutes": null,
         *      "status": "INSIDE",
         *      "is_late": false
         *   }
         * ]
         */

        const response =
            await apiRequest(
                "/api/attendance"
            );


        console.log(
            "Attendance API response:",
            response
        );


        allAttendanceRecords =
            normalizeAttendanceResponse(
                response
            );


        console.log(
            "Normalized attendance:",
            allAttendanceRecords
        );


        /*
         * Enrich attendance records with
         * employee and department information.
         */

        const enrichedRecords =
            enrichAttendanceRecords(
                allAttendanceRecords
            );


        /*
         * Apply filters.
         */

        const filteredRecords =
            applyAttendanceFilters(
                enrichedRecords
            );


        /*
         * Update dashboard numbers.
         */

        updateSummary(
            filteredRecords
        );


        /*
         * Render table.
         */

        renderAttendanceTable(
            filteredRecords
        );


    } catch (error) {

        console.error(
            "Failed to load attendance:",
            error
        );


        updateSummary([]);

        renderAttendanceTable([]);

        showAttendanceError(
            getErrorMessage(error)
        );

    } finally {

        showLoading(false);
    }
}


/* =========================================================
   NORMALIZE ATTENDANCE RESPONSE
========================================================= */

function normalizeAttendanceResponse(response) {

    if (Array.isArray(response)) {
        return response;
    }


    if (
        response &&
        Array.isArray(response.records)
    ) {

        return response.records;
    }


    if (
        response &&
        Array.isArray(response.attendance)
    ) {

        return response.attendance;
    }


    if (
        response &&
        Array.isArray(response.data)
    ) {

        return response.data;
    }


    return [];
}


/* =========================================================
   NORMALIZE GENERAL LIST RESPONSE
========================================================= */

function normalizeListResponse(
    response,
    possibleKeys
) {

    if (Array.isArray(response)) {
        return response;
    }


    if (
        response &&
        typeof response === "object"
    ) {

        for (
            let i = 0;
            i < possibleKeys.length;
            i++
        ) {

            const key =
                possibleKeys[i];

            if (
                Array.isArray(
                    response[key]
                )
            ) {

                return response[key];
            }
        }
    }


    return [];
}


/* =========================================================
   ENRICH ATTENDANCE
========================================================= */

function enrichAttendanceRecords(
    records
) {

    return records.map(
        function (record) {

            const employee =
                employeeMap[
                    String(
                        record.employee_id
                    )
                ];


            let department = null;


            if (employee) {

                department =
                    departmentMap[
                        String(
                            employee.department_id
                        )
                    ];
            }


            return {
                ...record,

                employee_name:
                    employee?.name ||
                    "Unknown Employee",

                employee_code:
                    employee?.employee_code ||
                    "-",

                department_id:
                    employee?.department_id ||
                    null,

                department_name:
                    department?.name ||
                    "Unassigned"
            };
        }
    );
}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyAttendanceFilters(
    records
) {

    const date =
        document.getElementById(
            "attendanceDate"
        )?.value || "";


    const departmentId =
        document.getElementById(
            "departmentFilter"
        )?.value || "";


    const employeeId =
        document.getElementById(
            "employeeFilter"
        )?.value || "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "";


    let filtered =
        records.slice();


    /*
     * Date
     */

    if (date) {

        filtered =
            filtered.filter(
                function (record) {

                    return (
                        record.attendance_date ===
                        date
                    );
                }
            );
    }


    /*
     * Department
     */

    if (departmentId) {

        filtered =
            filtered.filter(
                function (record) {

                    return (
                        String(
                            record.department_id
                        ) ===
                        String(
                            departmentId
                        )
                    );
                }
            );
    }


    /*
     * Employee
     */

    if (employeeId) {

        filtered =
            filtered.filter(
                function (record) {

                    return (
                        String(
                            record.employee_id
                        ) ===
                        String(
                            employeeId
                        )
                    );
                }
            );
    }


    /*
     * Status
     */

    if (status) {

        filtered =
            filtered.filter(
                function (record) {

                    return (
                        record.status ===
                        status
                    );
                }
            );
    }


    return filtered;
}


/* =========================================================
   REFRESH AFTER FILTER
========================================================= */

async function refreshFilteredAttendance() {

    try {

        const response =
            await apiRequest(
                "/api/attendance"
            );


        allAttendanceRecords =
            normalizeAttendanceResponse(
                response
            );


        const enrichedRecords =
            enrichAttendanceRecords(
                allAttendanceRecords
            );


        const filteredRecords =
            applyAttendanceFilters(
                enrichedRecords
            );


        updateSummary(
            filteredRecords
        );


        renderAttendanceTable(
            filteredRecords
        );


    } catch (error) {

        console.error(
            "Failed to refresh attendance:",
            error
        );

        showAttendanceError(
            getErrorMessage(error)
        );
    }
}


/* =========================================================
   SUMMARY CARDS
========================================================= */

function updateSummary(records) {

    const total =
        records.length;


    const checkedOut =
        records.filter(
            function (record) {

                return (
                    record.status ===
                    "OUTSIDE"
                );
            }
        ).length;


    const currentlyInside =
        records.filter(
            function (record) {

                return (
                    record.status ===
                    "INSIDE"
                );
            }
        ).length;


    const late =
        records.filter(
            function (record) {

                return (
                    record.is_late === true
                );
            }
        ).length;


    setText(
        "totalAttendance",
        total
    );


    setText(
        "checkedOutCount",
        checkedOut
    );


    setText(
        "insideCount",
        currentlyInside
    );


    setText(
        "lateCount",
        late
    );


    setText(
        "attendanceResultText",
        `${total} attendance record${
            total === 1 ? "" : "s"
        } found`
    );
}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderAttendanceTable(
    records
) {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tbody) {
        return;
    }


    if (!records.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="attendance-empty"
                >
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }


    /*
     * Sort newest first.
     */

    records.sort(
        function (a, b) {

            const dateA =
                new Date(
                    a.check_in ||
                    `${a.attendance_date}T00:00:00`
                );

            const dateB =
                new Date(
                    b.check_in ||
                    `${b.attendance_date}T00:00:00`
                );

            return dateB - dateA;
        }
    );


    tbody.innerHTML =
        records.map(
            function (record) {

                const employeeName =
                    escapeHtml(
                        record.employee_name
                    );


                const employeeCode =
                    escapeHtml(
                        record.employee_code
                    );


                const department =
                    escapeHtml(
                        record.department_name
                    );


                const date =
                    formatDate(
                        record.attendance_date
                    );


                const checkIn =
                    formatDateTime(
                        record.check_in
                    );


                const checkOut =
                    formatDateTime(
                        record.check_out
                    );


                const workingHours =
                    formatWorkingHours(
                        record.working_minutes
                    );


                const status =
                    record.status ||
                    "-";


                const statusClass =
                    status === "INSIDE"
                        ? "inside"
                        : "outside";


                const lateBadge =
                    record.is_late
                        ? `
                            <span class="attendance-late-badge">
                                Late
                            </span>
                        `
                        : `
                            <span class="attendance-on-time-badge">
                                On Time
                            </span>
                        `;


                return `
                    <tr>

                        <td>
                            <div class="attendance-employee">

                                <div class="attendance-avatar">
                                    ${getInitials(
                                        record.employee_name
                                    )}
                                </div>

                                <div class="attendance-employee-info">

                                    <strong>
                                        ${employeeName}
                                    </strong>

                                    <span>
                                        ${employeeCode}
                                    </span>

                                </div>

                            </div>
                        </td>


                        <td>
                            ${department}
                        </td>


                        <td>
                            ${date}
                        </td>


                        <td>
                            ${checkIn}
                        </td>


                        <td>
                            ${checkOut}
                        </td>


                        <td>
                            ${workingHours}
                        </td>


                        <td>

                            <span
                                class="attendance-status ${statusClass}"
                            >
                                ${escapeHtml(status)}
                            </span>

                        </td>


                        <td>
                            ${lateBadge}
                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* =========================================================
   DATE FORMATTING
========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    /*
     * Attendance date is YYYY-MM-DD.
     *
     * We construct the date manually to avoid
     * timezone shifting the displayed day.
     */

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const parts =
            value.split("-");


        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]) - 1;

        const day =
            Number(parts[2]);


        const date =
            new Date(
                year,
                month,
                day
            );


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
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
   DATE TIME FORMATTING
========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   WORKING HOURS
========================================================= */

function formatWorkingHours(
    minutes
) {

    if (
        minutes === null ||
        minutes === undefined
    ) {

        return "-";
    }


    const numericMinutes =
        Number(minutes);


    if (
        Number.isNaN(
            numericMinutes
        )
    ) {

        return "-";
    }


    const hours =
        Math.floor(
            numericMinutes / 60
        );


    const remainingMinutes =
        numericMinutes % 60;


    if (hours === 0) {

        return `${remainingMinutes}m`;
    }


    if (remainingMinutes === 0) {

        return `${hours}h`;
    }


    return `${hours}h ${remainingMinutes}m`;
}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "?";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


/* =========================================================
   FILTER BUTTONS
========================================================= */

function setupFilterButtons() {

    const applyButton =
        document.getElementById(
            "applyAttendanceFilters"
        );


    if (applyButton) {

        applyButton.addEventListener(
            "click",
            async function () {

                hideFilterError();

                await refreshFilteredAttendance();
            }
        );
    }


    const clearButton =
        document.getElementById(
            "clearAttendanceFilters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            async function () {

                const dateInput =
                    document.getElementById(
                        "attendanceDate"
                    );


                const departmentInput =
                    document.getElementById(
                        "departmentFilter"
                    );


                const employeeInput =
                    document.getElementById(
                        "employeeFilter"
                    );


                const statusInput =
                    document.getElementById(
                        "statusFilter"
                    );


                if (dateInput) {
                    dateInput.value = "";
                }


                if (departmentInput) {
                    departmentInput.value = "";
                }


                if (employeeInput) {
                    employeeInput.value = "";
                }


                if (statusInput) {
                    statusInput.value = "";
                }


                hideFilterError();


                await refreshFilteredAttendance();
            }
        );
    }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!button || !sidebar) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

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

    const button =
        document.getElementById(
            "logoutButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            logout();
        }
    );
}


/* =========================================================
   LOADING
========================================================= */

function showLoading(show) {

    const loading =
        document.getElementById(
            "attendanceLoading"
        );


    if (!loading) {
        return;
    }


    loading.hidden =
        !show;
}


/* =========================================================
   ATTENDANCE ERROR
========================================================= */

function showAttendanceError(
    message
) {

    const element =
        document.getElementById(
            "attendanceError"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.hidden =
        false;
}


function hideAttendanceError() {

    const element =
        document.getElementById(
            "attendanceError"
        );


    if (!element) {
        return;
    }


    element.hidden =
        true;
}


/* =========================================================
   FILTER ERROR
========================================================= */

function showFilterError(
    message
) {

    const element =
        document.getElementById(
            "attendanceFilterError"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.hidden =
        false;
}


function hideFilterError() {

    const element =
        document.getElementById(
            "attendanceFilterError"
        );


    if (!element) {
        return;
    }


    element.hidden =
        true;
}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(error) {

    if (!error) {
        return "Unable to load attendance records.";
    }


    if (error.message) {
        return error.message;
    }


    return "Unable to load attendance records.";
}
