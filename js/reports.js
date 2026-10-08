// ============================================================
// ATLURI ASCEND™
// REPORTS PAGE
// ============================================================

let reportRecords = [];


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeReportsPage();
});


async function initializeReportsPage() {

    setupMobileMenu();

    setupLogout();

    setupReportFilters();

    setupQuickDateFilters();

    setupExportButtons();

    updateCurrentDate();

    loadCurrentUser();

    setDefaultDateRange();

    await loadReportData();
}


// ============================================================
// MOBILE MENU
// ============================================================

function setupMobileMenu() {

    const button =
        document.getElementById("mobileMenuButton");

    const sidebar =
        document.getElementById("sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });
}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {

        logout();

    });
}


// ============================================================
// REPORT FILTER SETUP
// ============================================================

function setupReportFilters() {

    const generateButton =
        document.getElementById(
            "applyReportFilter"
        );

    if (!generateButton) {
        return;
    }

    generateButton.addEventListener(
        "click",
        async () => {

            await loadReportData();

        }
    );
}


// ============================================================
// QUICK DATE FILTERS
// ============================================================

function setupQuickDateFilters() {

    const buttons =
        document.querySelectorAll(
            ".quick-date-button"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const range =
                    button.dataset.range;

                setQuickDateRange(range);

                setActiveQuickButton(button);

                await loadReportData();

            }
        );

    });
}


// ============================================================
// EXPORT BUTTONS
// ============================================================

function setupExportButtons() {

    const attendanceButton =
        document.getElementById(
            "attendanceReportButton"
        );

    const employeeButton =
        document.getElementById(
            "employeeReportButton"
        );

    const departmentButton =
        document.getElementById(
            "departmentReportButton"
        );

    const summaryButton =
        document.getElementById(
            "summaryReportButton"
        );


    if (attendanceButton) {

        attendanceButton.addEventListener(
            "click",
            () => {

                exportAttendanceReport();

            }
        );

    }


    if (employeeButton) {

        employeeButton.addEventListener(
            "click",
            () => {

                exportEmployeeReport();

            }
        );

    }


    if (departmentButton) {

        departmentButton.addEventListener(
            "click",
            () => {

                exportDepartmentReport();

            }
        );

    }


    if (summaryButton) {

        summaryButton.addEventListener(
            "click",
            () => {

                exportSummaryReport();

            }
        );

    }
}


// ============================================================
// CURRENT DATE
// ============================================================

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) {
        return;
    }

    const today = new Date();

    element.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


// ============================================================
// CURRENT USER
// ============================================================

function loadCurrentUser() {

    const element =
        document.getElementById(
            "currentUsername"
        );

    if (!element) {
        return;
    }

    try {

        const storedUser =
            localStorage.getItem(
                APP_CONFIG.USER_KEY
            );

        if (!storedUser) {
            return;
        }

        const user =
            JSON.parse(storedUser);

        if (user.username) {

            element.textContent =
                user.username;

        }

    } catch (error) {

        console.error(
            "Unable to load current user:",
            error
        );

    }
}


// ============================================================
// DEFAULT DATE RANGE
// ============================================================

function setDefaultDateRange() {

    const today =
        new Date();

    const startDate =
        document.getElementById(
            "startDate"
        );

    const endDate =
        document.getElementById(
            "endDate"
        );

    if (!startDate || !endDate) {
        return;
    }


    const formattedToday =
        formatDateForInput(today);


    startDate.value =
        formattedToday;

    endDate.value =
        formattedToday;


    setActiveQuickButton(
        document.querySelector(
            '[data-range="today"]'
        )
    );
}


// ============================================================
// QUICK DATE RANGE
// ============================================================

function setQuickDateRange(range) {

    const startDate =
        document.getElementById(
            "startDate"
        );

    const endDate =
        document.getElementById(
            "endDate"
        );

    if (!startDate || !endDate) {
        return;
    }


    const today =
        new Date();

    let start =
        new Date(today);

    let end =
        new Date(today);


    // --------------------------------------------------------
    // TODAY
    // --------------------------------------------------------

    if (range === "today") {

        start =
            new Date(today);

        end =
            new Date(today);

    }


    // --------------------------------------------------------
    // YESTERDAY
    // --------------------------------------------------------

    else if (range === "yesterday") {

        start =
            new Date(today);

        start.setDate(
            start.getDate() - 1
        );

        end =
            new Date(start);

    }


    // --------------------------------------------------------
    // THIS WEEK
    // --------------------------------------------------------

    else if (range === "week") {

        const day =
            today.getDay();

        const difference =
            day === 0 ? 6 : day - 1;

        start =
            new Date(today);

        start.setDate(
            start.getDate() - difference
        );

        end =
            new Date(today);

    }


    // --------------------------------------------------------
    // THIS MONTH
    // --------------------------------------------------------

    else if (range === "month") {

        start =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

        end =
            new Date(today);

    }


    startDate.value =
        formatDateForInput(start);

    endDate.value =
        formatDateForInput(end);
}


// ============================================================
// ACTIVE QUICK BUTTON
// ============================================================

function setActiveQuickButton(button) {

    const buttons =
        document.querySelectorAll(
            ".quick-date-button"
        );

    buttons.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    if (button) {

        button.classList.add(
            "active"
        );

    }
}


// ============================================================
// FORMAT DATE FOR INPUT
// ============================================================

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================================
// LOAD REPORT DATA
// ============================================================

async function loadReportData() {

    const startDate =
        document.getElementById(
            "startDate"
        )?.value;

    const endDate =
        document.getElementById(
            "endDate"
        )?.value;

    const departmentId =
        document.getElementById(
            "departmentFilter"
        )?.value;

    const employeeId =
        document.getElementById(
            "employeeFilter"
        )?.value;


    if (!startDate || !endDate) {

        showReportError(
            "Please select a start date and end date."
        );

        return;

    }


    if (startDate > endDate) {

        showReportError(
            "Start date cannot be later than end date."
        );

        return;

    }


    setReportLoading(true);

    setReportStatus(
        "Loading...",
        "loading"
    );


    try {

        /*
         * The current backend exposes:
         *
         * GET /api/attendance
         *
         * for admin attendance records.
         *
         * We retrieve the records and apply the selected
         * report filters in the frontend.
         */

        const response =
            await apiRequest(
                "/api/attendance"
            );


        if (!Array.isArray(response)) {

            throw new Error(
                "Unexpected attendance response."
            );

        }


        reportRecords =
            response.filter(
                record => {

                    return isRecordInsideDateRange(
                        record,
                        startDate,
                        endDate
                    );

                }
            );


        // ----------------------------------------------------
        // EMPLOYEE FILTER
        // ----------------------------------------------------

        if (employeeId) {

            reportRecords =
                reportRecords.filter(
                    record =>
                        String(
                            record.employee_id
                        ) ===
                        String(employeeId)
                );

        }


        // ----------------------------------------------------
        // DEPARTMENT FILTER
        //
        // Department filtering is applied only when the
        // employee data available to the page contains the
        // required department information.
        // ----------------------------------------------------

        if (departmentId) {

            reportRecords =
                reportRecords.filter(
                    record => {

                        return (
                            String(
                                record.department_id
                            ) ===
                            String(departmentId)
                        );

                    }
                );

        }


        renderReport(
            reportRecords,
            startDate,
            endDate
        );


        setReportStatus(
            "Ready",
            "ready"
        );


    } catch (error) {

        console.error(
            "Unable to load report:",
            error
        );


        reportRecords = [];


        showReportError(
            error.message ||
            "Unable to load report data."
        );


        setReportStatus(
            "Error",
            "error"
        );

    } finally {

        setReportLoading(false);

    }
}


// ============================================================
// DATE RANGE CHECK
// ============================================================

function isRecordInsideDateRange(
    record,
    startDate,
    endDate
) {

    if (!record.attendance_date) {
        return false;
    }


    const recordDate =
        String(
            record.attendance_date
        ).substring(0, 10);


    return (
        recordDate >= startDate &&
        recordDate <= endDate
    );
}


// ============================================================
// RENDER REPORT
// ============================================================

function renderReport(
    records,
    startDate,
    endDate
) {

    updatePreviewPeriod(
        startDate,
        endDate
    );


    updateSummaryCards(
        records
    );


    renderReportTable(
        records
    );


    clearReportError();
}


// ============================================================
// UPDATE PREVIEW PERIOD
// ============================================================

function updatePreviewPeriod(
    startDate,
    endDate
) {

    const element =
        document.getElementById(
            "previewPeriod"
        );

    if (!element) {
        return;
    }


    if (startDate === endDate) {

        element.textContent =
            formatDisplayDate(startDate);

        return;

    }


    element.textContent =
        `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
}


// ============================================================
// FORMAT DISPLAY DATE
// ============================================================

function formatDisplayDate(
    dateString
) {

    if (!dateString) {
        return "—";
    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {
        return dateString;
    }


    return `${parts[2]} ${getMonthName(
        Number(parts[1])
    )} ${parts[0]}`;
}


// ============================================================
// MONTH NAME
// ============================================================

function getMonthName(month) {

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    return months[month - 1] || "";
}


// ============================================================
// SUMMARY CARDS
// ============================================================

function updateSummaryCards(records) {

    const total =
        records.length;


    const present =
        records.filter(
            record =>
                record.check_in
        ).length;


    const late =
        records.filter(
            record =>
                record.is_late === true
        ).length;


    const completed =
        records.filter(
            record =>
                record.check_in &&
                record.check_out
        ).length;


    setElementText(
        "totalRecords",
        total
    );


    setElementText(
        "presentCount",
        present
    );


    setElementText(
        "lateCount",
        late
    );


    setElementText(
        "completedCount",
        completed
    );
}


// ============================================================
// RENDER REPORT TABLE
// ============================================================

function renderReportTable(records) {

    const tableWrapper =
        document.getElementById(
            "reportTableWrapper"
        );

    const tableBody =
        document.getElementById(
            "reportTableBody"
        );

    const emptyState =
        document.getElementById(
            "reportEmptyState"
        );

    const tableFooter =
        document.getElementById(
            "reportTableFooter"
        );

    const recordCount =
        document.getElementById(
            "reportRecordCount"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    // --------------------------------------------------------
    // EMPTY STATE
    // --------------------------------------------------------

    if (!records.length) {

        if (tableWrapper) {

            tableWrapper.hidden = true;

        }

        if (tableFooter) {

            tableFooter.hidden = true;

        }

        if (emptyState) {

            emptyState.hidden = false;

            const heading =
                emptyState.querySelector("h4");

            const paragraph =
                emptyState.querySelector("p");

            if (heading) {

                heading.textContent =
                    "No attendance records found";

            }

            if (paragraph) {

                paragraph.textContent =
                    "No attendance data matches the selected report filters.";

            }

        }

        return;
    }


    // --------------------------------------------------------
    // SHOW TABLE
    // --------------------------------------------------------

    if (emptyState) {

        emptyState.hidden = true;

    }

    if (tableWrapper) {

        tableWrapper.hidden = false;

    }

    if (tableFooter) {

        tableFooter.hidden = false;

    }


    // --------------------------------------------------------
    // CREATE ROWS
    // --------------------------------------------------------

    records.forEach(record => {

        const row =
            document.createElement("tr");


        const employeeCell =
            document.createElement("td");

        employeeCell.innerHTML =
            createEmployeeCell(
                record
            );


        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            formatDisplayDate(
                record.attendance_date
            );


        const checkInCell =
            document.createElement("td");

        checkInCell.textContent =
            formatDateTime(
                record.check_in
            );


        const checkOutCell =
            document.createElement("td");

        checkOutCell.textContent =
            formatDateTime(
                record.check_out
            );


        const workingCell =
            document.createElement("td");

        workingCell.textContent =
            formatWorkingMinutes(
                record.working_minutes
            );


        const statusCell =
            document.createElement("td");

        statusCell.innerHTML =
            createStatusBadge(
                record.status
            );


        const lateCell =
            document.createElement("td");

        lateCell.innerHTML =
            createLateBadge(
                record.is_late
            );


        row.appendChild(
            employeeCell
        );

        row.appendChild(
            dateCell
        );

        row.appendChild(
            checkInCell
        );

        row.appendChild(
            checkOutCell
        );

        row.appendChild(
            workingCell
        );

        row.appendChild(
            statusCell
        );

        row.appendChild(
            lateCell
        );


        tableBody.appendChild(
            row
        );

    });


    // --------------------------------------------------------
    // FOOTER COUNT
    // --------------------------------------------------------

    if (recordCount) {

        recordCount.textContent =
            `${records.length} ${
                records.length === 1
                    ? "record"
                    : "records"
            }`;

    }
}


// ============================================================
// EMPLOYEE CELL
// ============================================================

function createEmployeeCell(record) {

    const employeeName =
        record.employee_name ||
        record.employee ||
        `Employee #${record.employee_id}`;


    const initials =
        getInitials(
            employeeName
        );


    return `
        <div class="report-employee-cell">

            <div class="report-employee-avatar">
                ${escapeHtml(initials)}
            </div>

            <span class="report-employee-name">
                ${escapeHtml(employeeName)}
            </span>

        </div>
    `;
}


// ============================================================
// INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return "E";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


// ============================================================
// STATUS BADGE
// ============================================================

function createStatusBadge(status) {

    const normalized =
        String(
            status || ""
        ).toUpperCase();


    let className =
        "other";


    if (normalized === "INSIDE") {

        className =
            "inside";

    }

    else if (normalized === "OUTSIDE") {

        className =
            "outside";

    }


    return `
        <span class="report-status-badge ${className}">
            ${escapeHtml(normalized || "UNKNOWN")}
        </span>
    `;
}


// ============================================================
// LATE BADGE
// ============================================================

function createLateBadge(isLate) {

    if (isLate === true) {

        return `
            <span class="report-late-badge">
                Late
            </span>
        `;

    }


    return `
        <span class="report-on-time">
            On time
        </span>
    `;
}


// ============================================================
// FORMAT DATETIME
// ============================================================

function formatDateTime(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (Number.isNaN(
        date.getTime()
    )) {

        return String(value);

    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}


// ============================================================
// FORMAT WORKING MINUTES
// ============================================================

function formatWorkingMinutes(minutes) {

    if (
        minutes === null ||
        minutes === undefined
    ) {

        return "—";

    }


    const numericMinutes =
        Number(minutes);


    if (
        Number.isNaN(
            numericMinutes
        )
    ) {

        return "—";

    }


    const hours =
        Math.floor(
            numericMinutes / 60
        );


    const remainingMinutes =
        numericMinutes % 60;


    if (hours === 0) {

        return `${remainingMinutes} min`;

    }


    return `${hours}h ${remainingMinutes}m`;
}


// ============================================================
// EXPORT ATTENDANCE REPORT
// ============================================================

function exportAttendanceReport() {

    if (!reportRecords.length) {

        showReportError(
            "Generate a report before exporting attendance data."
        );

        return;
    }


    const headers = [
        "Employee ID",
        "Employee",
        "Attendance Date",
        "Check In",
        "Check Out",
        "Working Minutes",
        "Status",
        "Late"
    ];


    const rows =
        reportRecords.map(
            record => [

                record.employee_id ?? "",

                record.employee_name ||
                record.employee ||
                `Employee #${record.employee_id}`,

                record.attendance_date || "",

                record.check_in || "",

                record.check_out || "",

                record.working_minutes ?? "",

                record.status || "",

                record.is_late ? "Yes" : "No"

            ]
        );


    downloadCsv(
        "attendance-report.csv",
        headers,
        rows
    );
}


// ============================================================
// EXPORT EMPLOYEE REPORT
// ============================================================

async function exportEmployeeReport() {

    try {

        const response =
            await apiRequest(
                "/api/employees"
            );


        if (!Array.isArray(response)) {

            throw new Error(
                "Unexpected employee response."
            );

        }


        const headers = [
            "Employee ID",
            "Employee Code",
            "Name",
            "Email",
            "Phone",
            "Department",
            "Designation",
            "Status"
        ];


        const rows =
            response.map(
                employee => [

                    employee.id ?? "",

                    employee.employee_code ?? "",

                    employee.name ?? "",

                    employee.email ?? "",

                    employee.phone ?? "",

                    employee.department_name ||
                    employee.department ||
                    "",

                    employee.designation ?? "",

                    employee.status ?? ""

                ]
            );


        downloadCsv(
            "employee-report.csv",
            headers,
            rows
        );


    } catch (error) {

        console.error(
            "Employee export failed:",
            error
        );


        showReportError(
            error.message ||
            "Unable to export employee report."
        );

    }
}


// ============================================================
// EXPORT DEPARTMENT REPORT
// ============================================================

async function exportDepartmentReport() {

    try {

        const response =
            await apiRequest(
                "/api/departments"
            );


        if (!Array.isArray(response)) {

            throw new Error(
                "Unexpected department response."
            );

        }


        const headers = [
            "Department ID",
            "Department Name",
            "Employee Count"
        ];


        const rows =
            response.map(
                department => [

                    department.id ?? "",

                    department.name ?? "",

                    department.employee_count ??
                    ""

                ]
            );


        downloadCsv(
            "department-report.csv",
            headers,
            rows
        );


    } catch (error) {

        console.error(
            "Department export failed:",
            error
        );


        showReportError(
            error.message ||
            "Unable to export department report."
        );

    }
}


// ============================================================
// EXPORT SUMMARY REPORT
// ============================================================

function exportSummaryReport() {

    if (!reportRecords.length) {

        showReportError(
            "Generate a report before exporting the summary."
        );

        return;
    }


    const total =
        reportRecords.length;


    const present =
        reportRecords.filter(
            record =>
                record.check_in
        ).length;


    const late =
        reportRecords.filter(
            record =>
                record.is_late === true
        ).length;


    const completed =
        reportRecords.filter(
            record =>
                record.check_in &&
                record.check_out
        ).length;


    const headers = [
        "Metric",
        "Value"
    ];


    const rows = [

        [
            "Attendance Records",
            total
        ],

        [
            "Present",
            present
        ],

        [
            "Late Arrivals",
            late
        ],

        [
            "Completed Sessions",
            completed
        ]

    ];


    downloadCsv(
        "attendance-summary.csv",
        headers,
        rows
    );
}


// ============================================================
// CSV DOWNLOAD
// ============================================================

function downloadCsv(
    filename,
    headers,
    rows
) {

    const csvRows = [];


    csvRows.push(
        headers.map(
            value =>
                csvEscape(value)
        ).join(",")
    );


    rows.forEach(row => {

        csvRows.push(
            row.map(
                value =>
                    csvEscape(value)
            ).join(",")
        );

    });


    const csvContent =
        "\uFEFF" +
        csvRows.join("\n");


    const blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );
}


// ============================================================
// CSV ESCAPE
// ============================================================

function csvEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const text =
        String(value);


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return `"${text.replace(
            /"/g,
            '""'
        )}"`;

    }


    return text;
}


// ============================================================
// REPORT LOADING STATE
// ============================================================

function setReportLoading(isLoading) {

    const loading =
        document.getElementById(
            "reportTableLoading"
        );

    const emptyState =
        document.getElementById(
            "reportEmptyState"
        );

    const tableWrapper =
        document.getElementById(
            "reportTableWrapper"
        );


    if (isLoading) {

        if (loading) {

            loading.hidden = false;

        }

        if (emptyState) {

            emptyState.hidden = true;

        }

        if (tableWrapper) {

            tableWrapper.hidden = true;

        }

    } else {

        if (loading) {

            loading.hidden = true;

        }

    }


    const button =
        document.getElementById(
            "applyReportFilter"
        );


    if (button) {

        button.disabled =
            isLoading;

    }
}


// ============================================================
// REPORT STATUS
// ============================================================

function setReportStatus(
    text,
    type
) {

    const status =
        document.getElementById(
            "reportsStatus"
        );

    const dot =
        document.getElementById(
            "reportsStatusDot"
        );


    if (status) {

        status.textContent =
            text;

    }


    if (dot) {

        dot.classList.remove(
            "ready",
            "loading",
            "error"
        );


        if (type) {

            dot.classList.add(
                type
            );

        }

    }
}


// ============================================================
// ERROR MESSAGE
// ============================================================

function showReportError(message) {

    clearReportError();


    const previewCard =
        document.querySelector(
            ".report-preview-card"
        );


    if (!previewCard) {
        return;
    }


    const error =
        document.createElement(
            "div"
        );


    error.className =
        "report-error-message";


    error.id =
        "reportErrorMessage";


    error.textContent =
        message;


    previewCard.insertBefore(
        error,
        previewCard.firstChild
    );
}


// ============================================================
// CLEAR ERROR
// ============================================================

function clearReportError() {

    const existing =
        document.getElementById(
            "reportErrorMessage"
        );


    if (existing) {

        existing.remove();

    }
}


// ============================================================
// SET ELEMENT TEXT
// ============================================================

function setElementText(
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


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
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