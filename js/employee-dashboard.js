// ============================================================
// Atluri ASCEND™
// Employee Dashboard
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    function () {
        initializeEmployeeDashboard();
    }
);


// ============================================================
// INITIALIZATION
// ============================================================

async function initializeEmployeeDashboard() {

    if (!requireAuth()) {
        return;
    }

    setupEmployeeUser();
    setupCurrentDate();
    setupEventListeners();

    await loadEmployeeAttendance();
}


// ============================================================
// USER
// ============================================================

function setupEmployeeUser() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const username =
        user.username || "Employee";


    const usernameElement =
        document.getElementById("currentUsername");

    if (usernameElement) {
        usernameElement.textContent = username;
    }


    const welcomeName =
        document.getElementById("welcomeName");

    if (welcomeName) {
        welcomeName.textContent =
            username;
    }


    const avatar =
        document.getElementById("employeeAvatar");

    if (avatar) {
        avatar.textContent =
            getInitials(username);
    }
}


// ============================================================
// DATE
// ============================================================

function setupCurrentDate() {

    const today = new Date();

    const formattedDate =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    const currentDate =
        document.getElementById("currentDate");

    if (currentDate) {
        currentDate.textContent =
            formattedDate;
    }


    const welcomeDate =
        document.getElementById("welcomeDate");

    if (welcomeDate) {
        welcomeDate.textContent =
            formattedDate;
    }
}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            function () {
                logout();
            }
        );
    }


    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "employeeSidebar"
        );

    if (mobileMenuButton && sidebar) {

        mobileMenuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }


    const retryButton =
        document.getElementById(
            "retryButton"
        );

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            async function () {

                hideDashboardError();

                await loadEmployeeAttendance();
            }
        );
    }
}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadEmployeeAttendance() {

    try {

        const response =
            await apiRequest(
                "/api/attendance/history"
            );


        const records =
            extractAttendanceRecords(
                response
            );


        const todayRecord =
            findTodayRecord(records);


        updateDashboard(todayRecord);

        hideDashboardError();

    } catch (error) {

        console.error(
            "Failed to load employee attendance:",
            error
        );

        showDashboardError(
            error.message ||
            "Unable to load your attendance."
        );
    }
}


// ============================================================
// EXTRACT RECORDS
// ============================================================

function extractAttendanceRecords(response) {

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
        Array.isArray(response.data)
    ) {
        return response.data;
    }


    return [];
}


// ============================================================
// FIND TODAY'S RECORD
// ============================================================

function findTodayRecord(records) {

    const today =
        getLocalDateString();


    for (
        let i = 0;
        i < records.length;
        i++
    ) {

        const record =
            records[i];


        const attendanceDate =
            record.attendance_date ||
            record.date;


        if (
            attendanceDate &&
            String(attendanceDate)
                .substring(0, 10) === today
        ) {
            return record;
        }
    }


    return null;
}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard(record) {

    if (!record) {

        updateText(
            "attendanceStatus",
            "Not Checked In"
        );

        setStatusClass(
            "attendanceStatus",
            ""
        );


        updateText(
            "checkInTime",
            "—"
        );

        updateText(
            "checkOutTime",
            "—"
        );

        updateText(
            "workingTime",
            "—"
        );

        updateText(
            "lateStatus",
            "Not Recorded"
        );

        updateText(
            "checkInMessage",
            "Scan the QR code to check in"
        );

        updateText(
            "checkOutMessage",
            "Available after check-in"
        );

        updateText(
            "lateMessage",
            "Today's attendance status"
        );


        updateText(
            "overviewAttendance",
            "Not Checked In"
        );

        updateText(
            "overviewCheckIn",
            "—"
        );

        updateText(
            "overviewCheckOut",
            "—"
        );

        updateText(
            "overviewWorkingTime",
            "—"
        );

        return;
    }


    const status =
        String(
            record.status || ""
        ).toUpperCase();


    const checkIn =
        record.check_in ||
        null;


    const checkOut =
        record.check_out ||
        null;


    const workingMinutes =
        record.working_minutes;


    const isLate =
        Boolean(record.is_late);


    // --------------------------------------------------------
    // ATTENDANCE STATUS
    // --------------------------------------------------------

    let displayStatus =
        "Attendance Recorded";


    if (status === "INSIDE") {
        displayStatus = "Currently Inside";
    }

    if (status === "OUTSIDE") {
        displayStatus = "Checked Out";
    }


    if (isLate) {
        displayStatus += " · Late";
    }


    updateText(
        "attendanceStatus",
        displayStatus
    );


    if (status === "INSIDE") {

        setStatusClass(
            "attendanceStatus",
            "inside"
        );

    } else if (status === "OUTSIDE") {

        setStatusClass(
            "attendanceStatus",
            "outside"
        );

    } else if (isLate) {

        setStatusClass(
            "attendanceStatus",
            "late"
        );

    } else {

        setStatusClass(
            "attendanceStatus",
            ""
        );
    }


    // --------------------------------------------------------
    // CHECK IN
    // --------------------------------------------------------

    updateText(
        "checkInTime",
        formatTime(checkIn)
    );


    updateText(
        "checkInMessage",
        checkIn
            ? "Today's check-in time"
            : "Not checked in"
    );


    // --------------------------------------------------------
    // CHECK OUT
    // --------------------------------------------------------

    updateText(
        "checkOutTime",
        formatTime(checkOut)
    );


    updateText(
        "checkOutMessage",
        checkOut
            ? "Today's check-out time"
            : "Not checked out"
    );


    // --------------------------------------------------------
    // WORKING TIME
    // --------------------------------------------------------

    updateText(
        "workingTime",
        formatWorkingTime(
            workingMinutes
        )
    );


    // --------------------------------------------------------
    // LATE
    // --------------------------------------------------------

    if (isLate) {

        updateText(
            "lateStatus",
            "Late"
        );

        updateText(
            "lateMessage",
            "Check-in was after the late threshold"
        );

    } else {

        updateText(
            "lateStatus",
            "On Time"
        );

        updateText(
            "lateMessage",
            "Today's check-in was on time"
        );
    }


    // --------------------------------------------------------
    // OVERVIEW
    // --------------------------------------------------------

    updateText(
        "overviewAttendance",
        status === "INSIDE"
            ? "Inside"
            : status === "OUTSIDE"
                ? "Checked Out"
                : "Recorded"
    );


    updateText(
        "overviewCheckIn",
        formatTime(checkIn)
    );


    updateText(
        "overviewCheckOut",
        formatTime(checkOut)
    );


    updateText(
        "overviewWorkingTime",
        formatWorkingTime(
            workingMinutes
        )
    );
}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
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
// FORMAT WORKING TIME
// ============================================================

function formatWorkingTime(minutes) {

    if (
        minutes === null ||
        minutes === undefined ||
        minutes === ""
    ) {
        return "—";
    }


    const totalMinutes =
        Number(minutes);


    if (
        Number.isNaN(totalMinutes) ||
        totalMinutes < 0
    ) {
        return "—";
    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const remainingMinutes =
        totalMinutes % 60;


    if (hours === 0) {
        return `${remainingMinutes} min`;
    }


    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }


    return `${hours} hr ${remainingMinutes} min`;
}


// ============================================================
// LOCAL DATE
// ============================================================

function getLocalDateString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// ============================================================
// TEXT UPDATE
// ============================================================

function updateText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        value;
}


// ============================================================
// STATUS CLASS
// ============================================================

function setStatusClass(
    elementId,
    className
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }


    element.classList.remove(
        "inside",
        "outside",
        "late"
    );


    if (className) {
        element.classList.add(
            className
        );
    }
}


// ============================================================
// ERROR
// ============================================================

function showDashboardError(message) {

    const errorBox =
        document.getElementById(
            "dashboardError"
        );

    const messageElement =
        document.getElementById(
            "dashboardErrorMessage"
        );


    if (messageElement) {
        messageElement.textContent =
            message;
    }


    if (errorBox) {
        errorBox.hidden = false;
    }
}


function hideDashboardError() {

    const errorBox =
        document.getElementById(
            "dashboardError"
        );

    if (errorBox) {
        errorBox.hidden = true;
    }
}


// ============================================================
// INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {
        return "EM";
    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}