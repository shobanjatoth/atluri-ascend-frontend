// /* ==========================================
//    ATLURI ASCEND
//    EMPLOYEE ATTENDANCE
// ========================================== */

// document.addEventListener(
//     "DOMContentLoaded",
//     initializeAttendancePage
// );


// let attendanceRecords = [];


// /* ==========================================
//    INITIALIZE
// ========================================== */

// async function initializeAttendancePage() {

//     setupMobileMenu();

//     setupLogout();

//     setupButtons();

//     displayCurrentDate();

//     displayCurrentUser();

//     await loadAttendance();

// }


// /* ==========================================
//    MOBILE MENU
// ========================================== */

// function setupMobileMenu() {

//     const button =
//         document.getElementById(
//             "mobileMenuButton"
//         );

//     const sidebar =
//         document.getElementById(
//             "employeeSidebar"
//         );

//     if (!button || !sidebar) {
//         return;
//     }

//     button.addEventListener(
//         "click",
//         function () {

//             sidebar.classList.toggle(
//                 "open"
//             );

//         }
//     );

// }


// /* ==========================================
//    LOGOUT
// ========================================== */

// function setupLogout() {

//     const button =
//         document.getElementById(
//             "logoutButton"
//         );

//     if (!button) {
//         return;
//     }

//     button.addEventListener(
//         "click",
//         function () {

//             if (
//                 typeof logout === "function"
//             ) {

//                 logout();

//                 return;
//             }

//             localStorage.removeItem(
//                 APP_CONFIG.TOKEN_KEY
//             );

//             localStorage.removeItem(
//                 APP_CONFIG.USER_KEY
//             );

//             window.location.href =
//                 "../login.html";

//         }
//     );

// }


// /* ==========================================
//    BUTTONS
// ========================================== */

// function setupButtons() {

//     const refreshButton =
//         document.getElementById(
//             "refreshButton"
//         );

//     const retryButton =
//         document.getElementById(
//             "retryButton"
//         );

//     if (refreshButton) {

//         refreshButton.addEventListener(
//             "click",
//             loadAttendance
//         );

//     }

//     if (retryButton) {

//         retryButton.addEventListener(
//             "click",
//             loadAttendance
//         );

//     }

// }


// /* ==========================================
//    DATE
// ========================================== */

// function displayCurrentDate() {

//     const element =
//         document.getElementById(
//             "currentDate"
//         );

//     if (!element) {
//         return;
//     }

//     const now = new Date();

//     element.textContent =
//         now.toLocaleDateString(
//             "en-IN",
//             {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric"
//             }
//         );

// }


// /* ==========================================
//    USER
// ========================================== */

// function displayCurrentUser() {

//     const usernameElement =
//         document.getElementById(
//             "currentUsername"
//         );

//     const avatarElement =
//         document.getElementById(
//             "employeeAvatar"
//         );

//     let user = null;

//     try {

//         const storedUser =
//             localStorage.getItem(
//                 APP_CONFIG.USER_KEY
//             );

//         if (storedUser) {

//             user =
//                 JSON.parse(
//                     storedUser
//                 );

//         }

//     } catch (error) {

//         console.error(
//             "Unable to read user:",
//             error
//         );

//     }

//     const username =
//         user?.username || "Employee";

//     if (usernameElement) {

//         usernameElement.textContent =
//             username;

//     }

//     if (avatarElement) {

//         avatarElement.textContent =
//             username
//                 .charAt(0)
//                 .toUpperCase();

//     }

// }


// /* ==========================================
//    LOAD ATTENDANCE
// ========================================== */

// async function loadAttendance() {

//     showLoading();

//     try {

//         const response =
//             await apiRequest(
//                 "/api/attendance/my-attendance"
//             );

//         attendanceRecords =
//             Array.isArray(response)
//                 ? response
//                 : [];

//         hideError();

//         updateSummary();

//         updateTodayStatus();

//         renderAttendanceTable();

//     } catch (error) {

//         console.error(
//             "Attendance error:",
//             error
//         );

//         showError(
//             error.message ||
//             "Unable to load attendance records."
//         );

//     }

// }


// /* ==========================================
//    SUMMARY
// ========================================== */

// function updateSummary() {

//     const total =
//         attendanceRecords.length;

//     const present =
//         attendanceRecords.filter(
//             function (record) {

//                 return Boolean(
//                     record.check_in
//                 );

//             }
//         ).length;

//     const late =
//         attendanceRecords.filter(
//             function (record) {

//                 return record.is_late === true;

//             }
//         ).length;

//     let totalMinutes = 0;

//     attendanceRecords.forEach(
//         function (record) {

//             if (
//                 record.working_minutes !==
//                 null &&
//                 record.working_minutes !==
//                 undefined
//             ) {

//                 totalMinutes +=
//                     Number(
//                         record.working_minutes
//                     ) || 0;

//             }

//         }
//     );


//     const totalElement =
//         document.getElementById(
//             "totalRecords"
//         );

//     const presentElement =
//         document.getElementById(
//             "presentDays"
//         );

//     const lateElement =
//         document.getElementById(
//             "lateDays"
//         );

//     const hoursElement =
//         document.getElementById(
//             "totalHours"
//         );


//     if (totalElement) {
//         totalElement.textContent =
//             total;
//     }

//     if (presentElement) {
//         presentElement.textContent =
//             present;
//     }

//     if (lateElement) {
//         lateElement.textContent =
//             late;
//     }

//     if (hoursElement) {
//         hoursElement.textContent =
//             formatHours(
//                 totalMinutes
//             );
//     }

// }


// /* ==========================================
//    TODAY STATUS
// ========================================== */

// function updateTodayStatus() {

//     const today =
//         getTodayDate();

//     const record =
//         attendanceRecords.find(
//             function (item) {

//                 return (
//                     item.attendance_date ===
//                     today
//                 );

//             }
//         );


//     const title =
//         document.getElementById(
//             "currentStatusTitle"
//         );

//     const message =
//         document.getElementById(
//             "currentStatusMessage"
//         );

//     const checkIn =
//         document.getElementById(
//             "todayCheckIn"
//         );

//     const checkOut =
//         document.getElementById(
//             "todayCheckOut"
//         );

//     const icon =
//         document.getElementById(
//             "currentStatusIcon"
//         );


//     if (!record) {

//         if (title) {
//             title.textContent =
//                 "Not Checked In";
//         }

//         if (message) {
//             message.textContent =
//                 "You have not recorded attendance today.";
//         }

//         if (checkIn) {
//             checkIn.textContent = "—";
//         }

//         if (checkOut) {
//             checkOut.textContent = "—";
//         }

//         if (icon) {
//             icon.textContent = "○";
//         }

//         return;
//     }


//     if (checkIn) {

//         checkIn.textContent =
//             formatTime(
//                 record.check_in
//             );

//     }

//     if (checkOut) {

//         checkOut.textContent =
//             formatTime(
//                 record.check_out
//             );

//     }


//     if (record.status === "INSIDE") {

//         if (title) {
//             title.textContent =
//                 "Currently Inside";
//         }

//         if (message) {
//             message.textContent =
//                 "Your check-in has been recorded. Scan again when leaving.";
//         }

//         if (icon) {
//             icon.textContent = "✓";
//         }

//     } else {

//         if (title) {
//             title.textContent =
//                 "Attendance Completed";
//         }

//         if (message) {
//             message.textContent =
//                 "Today's check-in and check-out have been recorded.";
//         }

//         if (icon) {
//             icon.textContent = "✓";
//         }

//     }

// }


// /* ==========================================
//    TABLE
// ========================================== */

// function renderAttendanceTable() {

//     const body =
//         document.getElementById(
//             "attendanceTableBody"
//         );

//     const empty =
//         document.getElementById(
//             "attendanceEmpty"
//         );

//     const count =
//         document.getElementById(
//             "recordCount"
//         );


//     if (!body) {
//         return;
//     }


//     if (count) {

//         count.textContent =
//             attendanceRecords.length === 1
//                 ? "1 record"
//                 : `${attendanceRecords.length} records`;

//     }


//     if (
//         attendanceRecords.length === 0
//     ) {

//         body.innerHTML = "";

//         if (empty) {
//             empty.hidden = false;
//         }

//         return;
//     }


//     if (empty) {
//         empty.hidden = true;
//     }


//     body.innerHTML = "";


//     attendanceRecords.forEach(
//         function (record) {

//             const row =
//                 document.createElement(
//                     "tr"
//                 );


//             const dateCell =
//                 document.createElement(
//                     "td"
//                 );

//             dateCell.className =
//                 "date-cell";

//             dateCell.textContent =
//                 formatDate(
//                     record.attendance_date
//                 );


//             const checkInCell =
//                 document.createElement(
//                     "td"
//                 );

//             checkInCell.className =
//                 "time-cell";

//             checkInCell.textContent =
//                 formatTime(
//                     record.check_in
//                 );


//             const checkOutCell =
//                 document.createElement(
//                     "td"
//                 );

//             checkOutCell.className =
//                 "time-cell";

//             checkOutCell.textContent =
//                 formatTime(
//                     record.check_out
//                 );


//             const workingCell =
//                 document.createElement(
//                     "td"
//                 );

//             workingCell.className =
//                 "working-cell";

//             workingCell.textContent =
//                 formatWorkingTime(
//                     record.working_minutes
//                 );


//             const statusCell =
//                 document.createElement(
//                     "td"
//                 );

//             const statusBadge =
//                 document.createElement(
//                     "span"
//                 );

//             statusBadge.className =
//                 "status-badge " +
//                 (
//                     record.status === "INSIDE"
//                         ? "status-inside"
//                         : "status-outside"
//                 );

//             statusBadge.textContent =
//                 record.status || "—";

//             statusCell.appendChild(
//                 statusBadge
//             );


//             const attendanceCell =
//                 document.createElement(
//                     "td"
//                 );

//             const attendanceBadge =
//                 document.createElement(
//                     "span"
//                 );


//             if (record.is_late) {

//                 attendanceBadge.className =
//                     "attendance-badge attendance-late";

//                 attendanceBadge.textContent =
//                     "Late";

//             } else {

//                 attendanceBadge.className =
//                     "attendance-badge attendance-present";

//                 attendanceBadge.textContent =
//                     "Present";

//             }


//             attendanceCell.appendChild(
//                 attendanceBadge
//             );


//             row.appendChild(
//                 dateCell
//             );

//             row.appendChild(
//                 checkInCell
//             );

//             row.appendChild(
//                 checkOutCell
//             );

//             row.appendChild(
//                 workingCell
//             );

//             row.appendChild(
//                 statusCell
//             );

//             row.appendChild(
//                 attendanceCell
//             );


//             body.appendChild(
//                 row
//             );

//         }
//     );

// }


// /* ==========================================
//    LOADING
// ========================================== */

// function showLoading() {

//     const body =
//         document.getElementById(
//             "attendanceTableBody"
//         );

//     const empty =
//         document.getElementById(
//             "attendanceEmpty"
//         );

//     const error =
//         document.getElementById(
//             "attendanceError"
//         );


//     if (empty) {
//         empty.hidden = true;
//     }

//     if (error) {
//         error.hidden = true;
//     }


//     if (body) {

//         body.innerHTML = `
//             <tr>
//                 <td colspan="6" class="table-loading">
//                     <div class="loading-spinner"></div>
//                     Loading attendance...
//                 </td>
//             </tr>
//         `;

//     }

// }


// /* ==========================================
//    ERROR
// ========================================== */

// function showError(message) {

//     const body =
//         document.getElementById(
//             "attendanceTableBody"
//         );

//     const error =
//         document.getElementById(
//             "attendanceError"
//         );

//     const errorMessage =
//         document.getElementById(
//             "attendanceErrorMessage"
//         );


//     if (body) {
//         body.innerHTML = "";
//     }

//     if (errorMessage) {

//         errorMessage.textContent =
//             message;

//     }

//     if (error) {
//         error.hidden = false;
//     }

// }


// function hideError() {

//     const error =
//         document.getElementById(
//             "attendanceError"
//         );

//     if (error) {
//         error.hidden = true;
//     }

// }


// /* ==========================================
//    DATE HELPERS
// ========================================== */

// function getTodayDate() {

//     const now = new Date();

//     const year =
//         now.getFullYear();

//     const month =
//         String(
//             now.getMonth() + 1
//         ).padStart(2, "0");

//     const day =
//         String(
//             now.getDate()
//         ).padStart(2, "0");

//     return `${year}-${month}-${day}`;

// }


// function formatDate(value) {

//     if (!value) {
//         return "—";
//     }

//     const date =
//         new Date(
//             value + "T00:00:00"
//         );

//     if (
//         Number.isNaN(
//             date.getTime()
//         )
//     ) {

//         return value;

//     }

//     return date.toLocaleDateString(
//         "en-IN",
//         {
//             day: "2-digit",
//             month: "short",
//             year: "numeric"
//         }
//     );

// }


// /* ==========================================
//    TIME
// ========================================== */

// function formatTime(value) {

//     if (!value) {
//         return "—";
//     }

//     const date =
//         new Date(value);

//     if (
//         Number.isNaN(
//             date.getTime()
//         )
//     ) {

//         return value;

//     }

//     return date.toLocaleTimeString(
//         "en-IN",
//         {
//             hour: "2-digit",
//             minute: "2-digit"
//         }
//     );

// }


// /* ==========================================
//    WORKING TIME
// ========================================== */

// function formatWorkingTime(minutes) {

//     if (
//         minutes === null ||
//         minutes === undefined
//     ) {

//         return "—";

//     }

//     const total =
//         Number(minutes);

//     if (Number.isNaN(total)) {
//         return "—";
//     }

//     const hours =
//         Math.floor(
//             total / 60
//         );

//     const remaining =
//         total % 60;


//     if (hours === 0) {

//         return `${remaining} min`;

//     }

//     return `${hours}h ${remaining}m`;

// }


// /* ==========================================
//    TOTAL HOURS
// ========================================== */

// function formatHours(minutes) {

//     if (!minutes) {
//         return "0h";
//     }

//     const hours =
//         Math.floor(
//             minutes / 60
//         );

//     const remaining =
//         minutes % 60;


//     if (remaining === 0) {

//         return `${hours}h`;

//     }

//     return `${hours}h ${remaining}m`;

// }
























/* ==========================================
   ATLURI ASCEND
   EMPLOYEE ATTENDANCE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeAttendancePage
);


let attendanceRecords = [];


/* ==========================================
   INITIALIZE
========================================== */

async function initializeAttendancePage() {

    setupMobileMenu();

    setupLogout();

    setupButtons();

    displayCurrentDate();

    displayCurrentUser();

    await loadAttendance();

}


/* ==========================================
   MOBILE MENU
========================================== */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "employeeSidebar"
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


/* ==========================================
   LOGOUT
========================================== */

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

            if (
                typeof logout === "function"
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


/* ==========================================
   BUTTONS
========================================== */

function setupButtons() {

    const refreshButton =
        document.getElementById(
            "refreshButton"
        );

    const retryButton =
        document.getElementById(
            "retryButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                loadAttendance();

            }
        );

    }


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            function () {

                loadAttendance();

            }
        );

    }

}


/* ==========================================
   DATE
========================================== */

function displayCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) {
        return;
    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


/* ==========================================
   USER
========================================== */

function displayCurrentUser() {

    const usernameElement =
        document.getElementById(
            "currentUsername"
        );

    const avatarElement =
        document.getElementById(
            "employeeAvatar"
        );


    let user = null;


    try {

        const storedUser =
            localStorage.getItem(
                APP_CONFIG.USER_KEY
            );


        if (storedUser) {

            user =
                JSON.parse(
                    storedUser
                );

        }

    } catch (error) {

        console.error(
            "Unable to read stored user:",
            error
        );

    }


    const username =
        user?.username ||
        "Employee";


    if (usernameElement) {

        usernameElement.textContent =
            username;

    }


    if (avatarElement) {

        avatarElement.textContent =
            username
                .charAt(0)
                .toUpperCase();

    }

}


/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadAttendance() {

    showLoading();


    try {

        const response =
            await apiRequest(
                "/api/attendance/my-attendance"
            );


        attendanceRecords =
            Array.isArray(response)
                ? response
                : [];


        hideError();


        updateSummary();

        updateTodayStatus();

        renderAttendanceTable();


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );


        attendanceRecords = [];


        updateSummary();

        updateTodayStatus();


        showError(
            error.message ||
            "Unable to load attendance records."
        );

    }

}


/* ==========================================
   SUMMARY
========================================== */

function updateSummary() {

    const total =
        attendanceRecords.length;


    let present = 0;

    let late = 0;

    let totalMinutes = 0;


    attendanceRecords.forEach(
        function (record) {

            if (record.check_in) {

                present++;

            }


            if (record.is_late === true) {

                late++;

            }


            if (
                record.working_minutes !== null &&
                record.working_minutes !== undefined
            ) {

                totalMinutes +=
                    Number(
                        record.working_minutes
                    ) || 0;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "totalRecords"
        );

    const presentElement =
        document.getElementById(
            "presentDays"
        );

    const lateElement =
        document.getElementById(
            "lateDays"
        );

    const hoursElement =
        document.getElementById(
            "totalHours"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (presentElement) {

        presentElement.textContent =
            present;

    }


    if (lateElement) {

        lateElement.textContent =
            late;

    }


    if (hoursElement) {

        hoursElement.textContent =
            formatHours(
                totalMinutes
            );

    }

}


/* ==========================================
   TODAY STATUS
========================================== */

function updateTodayStatus() {

    const today =
        getTodayDate();


    const record =
        attendanceRecords.find(
            function (item) {

                return (
                    item.attendance_date ===
                    today
                );

            }
        );


    const title =
        document.getElementById(
            "currentStatusTitle"
        );

    const message =
        document.getElementById(
            "currentStatusMessage"
        );

    const checkIn =
        document.getElementById(
            "todayCheckIn"
        );

    const checkOut =
        document.getElementById(
            "todayCheckOut"
        );

    const icon =
        document.getElementById(
            "currentStatusIcon"
        );


    if (!record) {

        if (title) {

            title.textContent =
                "Not Checked In";

        }


        if (message) {

            message.textContent =
                "You have not recorded attendance today.";

        }


        if (checkIn) {

            checkIn.textContent =
                "—";

        }


        if (checkOut) {

            checkOut.textContent =
                "—";

        }


        if (icon) {

            icon.textContent =
                "○";

        }


        return;

    }


    if (checkIn) {

        checkIn.textContent =
            formatTime(
                record.check_in
            );

    }


    if (checkOut) {

        checkOut.textContent =
            formatTime(
                record.check_out
            );

    }


    if (record.status === "INSIDE") {

        if (title) {

            title.textContent =
                "Currently Inside";

        }


        if (message) {

            message.textContent =
                "Your check-in has been recorded. Scan again when leaving.";

        }


        if (icon) {

            icon.textContent =
                "✓";

        }

    } else {

        if (title) {

            title.textContent =
                "Attendance Completed";

        }


        if (message) {

            message.textContent =
                "Today's check-in and check-out have been recorded.";

        }


        if (icon) {

            icon.textContent =
                "✓";

        }

    }

}


/* ==========================================
   TABLE
========================================== */

function renderAttendanceTable() {

    const body =
        document.getElementById(
            "attendanceTableBody"
        );

    const empty =
        document.getElementById(
            "attendanceEmpty"
        );

    const count =
        document.getElementById(
            "recordCount"
        );


    if (!body) {
        return;
    }


    const total =
        attendanceRecords.length;


    if (count) {

        count.textContent =
            total === 1
                ? "1 record"
                : `${total} records`;

    }


    if (total === 0) {

        body.innerHTML = "";


        if (empty) {

            empty.hidden =
                false;

        }


        return;

    }


    if (empty) {

        empty.hidden =
            true;

    }


    body.innerHTML = "";


    attendanceRecords.forEach(
        function (record) {

            const row =
                document.createElement(
                    "tr"
                );


            /* DATE */

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.className =
                "date-cell";

            dateCell.textContent =
                formatDate(
                    record.attendance_date
                );


            /* CHECK IN */

            const checkInCell =
                document.createElement(
                    "td"
                );

            checkInCell.className =
                "time-cell";

            checkInCell.textContent =
                formatTime(
                    record.check_in
                );


            /* CHECK OUT */

            const checkOutCell =
                document.createElement(
                    "td"
                );

            checkOutCell.className =
                "time-cell";

            checkOutCell.textContent =
                formatTime(
                    record.check_out
                );


            /* WORKING TIME */

            const workingCell =
                document.createElement(
                    "td"
                );

            workingCell.className =
                "working-cell";

            workingCell.textContent =
                formatWorkingTime(
                    record.working_minutes
                );


            /* STATUS */

            const statusCell =
                document.createElement(
                    "td"
                );


            const statusBadge =
                document.createElement(
                    "span"
                );


            if (
                record.status ===
                "INSIDE"
            ) {

                statusBadge.className =
                    "status-badge status-inside";

            } else {

                statusBadge.className =
                    "status-badge status-outside";

            }


            statusBadge.textContent =
                record.status ||
                "—";


            statusCell.appendChild(
                statusBadge
            );


            /* ATTENDANCE */

            const attendanceCell =
                document.createElement(
                    "td"
                );


            const attendanceBadge =
                document.createElement(
                    "span"
                );


            if (record.is_late === true) {

                attendanceBadge.className =
                    "attendance-badge attendance-late";

                attendanceBadge.textContent =
                    "Late";

            } else {

                attendanceBadge.className =
                    "attendance-badge attendance-present";

                attendanceBadge.textContent =
                    "Present";

            }


            attendanceCell.appendChild(
                attendanceBadge
            );


            /* ROW */

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
                attendanceCell
            );


            body.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   LOADING
========================================== */

function showLoading() {

    const body =
        document.getElementById(
            "attendanceTableBody"
        );

    const empty =
        document.getElementById(
            "attendanceEmpty"
        );

    const error =
        document.getElementById(
            "attendanceError"
        );


    if (empty) {

        empty.hidden =
            true;

    }


    if (error) {

        error.hidden =
            true;

    }


    if (body) {

        body.innerHTML = `
            <tr>
                <td colspan="6" class="table-loading">
                    <div class="loading-spinner"></div>
                    Loading attendance...
                </td>
            </tr>
        `;

    }

}


/* ==========================================
   ERROR
========================================== */

function showError(message) {

    const body =
        document.getElementById(
            "attendanceTableBody"
        );

    const error =
        document.getElementById(
            "attendanceError"
        );

    const errorMessage =
        document.getElementById(
            "attendanceErrorMessage"
        );


    if (body) {

        body.innerHTML =
            "";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    if (error) {

        error.hidden =
            false;

    }

}


function hideError() {

    const error =
        document.getElementById(
            "attendanceError"
        );


    if (error) {

        error.hidden =
            true;

    }

}


/* ==========================================
   DATE
========================================== */

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

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


/* ==========================================
   TIME
========================================== */

function formatTime(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ==========================================
   WORKING TIME
========================================== */

function formatWorkingTime(minutes) {

    if (
        minutes === null ||
        minutes === undefined
    ) {

        return "—";

    }


    const total =
        Number(minutes);


    if (
        Number.isNaN(total)
    ) {

        return "—";

    }


    const hours =
        Math.floor(
            total / 60
        );


    const remaining =
        total % 60;


    if (hours === 0) {

        return `${remaining} min`;

    }


    return (
        `${hours}h ${remaining}m`
    );

}


/* ==========================================
   TOTAL HOURS
========================================== */

function formatHours(minutes) {

    if (!minutes) {

        return "0h";

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if (remaining === 0) {

        return `${hours}h`;

    }


    return (
        `${hours}h ${remaining}m`
    );

}