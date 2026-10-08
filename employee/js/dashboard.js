// document.addEventListener("DOMContentLoaded", async () => {

//     const currentDate = document.getElementById("currentDate");
//     const currentUsername = document.getElementById("currentUsername");
//     const welcomeName = document.getElementById("welcomeName");
//     const employeeAvatar = document.getElementById("employeeAvatar");

//     const attendanceStatus =
//         document.getElementById("attendanceStatus");

//     const attendanceMessage =
//         document.getElementById("attendanceMessage");

//     const checkInTime =
//         document.getElementById("checkInTime");

//     const checkOutTime =
//         document.getElementById("checkOutTime");

//     const attendanceTableBody =
//         document.getElementById("attendanceTableBody");

//     const mobileMenuButton =
//         document.getElementById("mobileMenuButton");

//     const employeeSidebar =
//         document.getElementById("employeeSidebar");

//     const logoutButton =
//         document.getElementById("logoutButton");


//     /* ==========================================
//        MOBILE MENU
//     ========================================== */

//     if (mobileMenuButton) {

//         mobileMenuButton.addEventListener("click", () => {

//             employeeSidebar.classList.toggle("mobile-open");

//         });

//     }


//     /* ==========================================
//        LOGOUT
//     ========================================== */

//     if (logoutButton) {

//         logoutButton.addEventListener("click", () => {

//             if (typeof logout === "function") {

//                 logout();

//             } else {

//                 localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
//                 localStorage.removeItem(APP_CONFIG.USER_KEY);

//                 window.location.href = "login.html";

//             }

//         });

//     }


//     /* ==========================================
//        DATE
//     ========================================== */

//     function setCurrentDate() {

//         const today = new Date();

//         currentDate.textContent =
//             today.toLocaleDateString("en-IN", {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric"
//             });

//     }


//     /* ==========================================
//        USER
//     ========================================== */

//     function loadUser() {

//         let user = null;

//         try {

//             const storedUser =
//                 localStorage.getItem(APP_CONFIG.USER_KEY);

//             if (storedUser) {

//                 user = JSON.parse(storedUser);

//             }

//         } catch (error) {

//             console.error("Unable to read user:", error);

//         }


//         if (!user) {
//             return;
//         }


//         const username =
//             user.username ||
//             user.name ||
//             "Employee";


//         currentUsername.textContent = username;
//         welcomeName.textContent = username;

//         employeeAvatar.textContent =
//             username.charAt(0).toUpperCase();

//     }


//     /* ==========================================
//        FORMAT TIME
//     ========================================== */

//     function formatTime(value) {

//         if (!value) {
//             return "—";
//         }

//         const date = new Date(value);

//         if (Number.isNaN(date.getTime())) {
//             return "—";
//         }

//         return date.toLocaleTimeString("en-IN", {
//             hour: "2-digit",
//             minute: "2-digit"
//         });

//     }


//     /* ==========================================
//        FORMAT DATE
//     ========================================== */

//     function formatDate(value) {

//         if (!value) {
//             return "—";
//         }

//         const date = new Date(`${value}T00:00:00`);

//         if (Number.isNaN(date.getTime())) {
//             return value;
//         }

//         return date.toLocaleDateString("en-IN", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric"
//         });

//     }


//     /* ==========================================
//        WORKING TIME
//     ========================================== */

//     function formatWorkingTime(minutes) {

//         if (
//             minutes === null ||
//             minutes === undefined
//         ) {
//             return "—";
//         }

//         const hours = Math.floor(minutes / 60);
//         const mins = minutes % 60;

//         if (hours === 0) {
//             return `${mins} min`;
//         }

//         return `${hours}h ${mins}m`;

//     }


//     /* ==========================================
//        STATUS BADGE
//     ========================================== */

//     function getStatusBadge(status) {

//         const value =
//             String(status || "")
//                 .toUpperCase();


//         if (value === "INSIDE") {

//             return `
//                 <span class="attendance-status inside">
//                     Inside
//                 </span>
//             `;

//         }


//         if (value === "OUTSIDE") {

//             return `
//                 <span class="attendance-status outside">
//                     Completed
//                 </span>
//             `;

//         }


//         return `
//             <span class="attendance-status">
//                 ${status || "Unknown"}
//             </span>
//         `;

//     }


//     /* ==========================================
//        TODAY RECORD
//     ========================================== */

//     function updateTodayStatus(records) {

//         if (!records || records.length === 0) {

//             attendanceStatus.textContent =
//                 "Not Checked In";

//             attendanceMessage.textContent =
//                 "Scan the entrance QR code to record your attendance.";

//             checkInTime.textContent = "—";
//             checkOutTime.textContent = "—";

//             return;
//         }


//         const today =
//             new Date().toISOString().split("T")[0];


//         const todayRecord =
//             records.find(
//                 record =>
//                     record.attendance_date === today
//             );


//         if (!todayRecord) {

//             attendanceStatus.textContent =
//                 "Not Checked In";

//             attendanceMessage.textContent =
//                 "Scan the entrance QR code to record your attendance.";

//             checkInTime.textContent = "—";
//             checkOutTime.textContent = "—";

//             return;
//         }


//         checkInTime.textContent =
//             formatTime(todayRecord.check_in);

//         checkOutTime.textContent =
//             formatTime(todayRecord.check_out);


//         if (
//             String(todayRecord.status).toUpperCase() ===
//             "INSIDE"
//         ) {

//             attendanceStatus.textContent =
//                 "Currently Inside";

//             attendanceMessage.textContent =
//                 "Your check-in has been recorded. Scan again when leaving.";

//         } else {

//             attendanceStatus.textContent =
//                 "Attendance Completed";

//             attendanceMessage.textContent =
//                 "Your attendance for today has been completed.";

//         }

//     }


//     /* ==========================================
//        TABLE
//     ========================================== */

//     function renderAttendance(records) {

//         if (!records || records.length === 0) {

//             attendanceTableBody.innerHTML = `
//                 <tr>
//                     <td
//                         colspan="5"
//                         class="table-loading"
//                     >
//                         No attendance records found.
//                     </td>
//                 </tr>
//             `;

//             return;
//         }


//         const recentRecords =
//             records.slice(0, 5);


//         attendanceTableBody.innerHTML =
//             recentRecords.map(record => {

//                 return `
//                     <tr>

//                         <td>
//                             ${formatDate(record.attendance_date)}
//                         </td>

//                         <td>
//                             ${formatTime(record.check_in)}
//                         </td>

//                         <td>
//                             ${formatTime(record.check_out)}
//                         </td>

//                         <td>
//                             ${formatWorkingTime(record.working_minutes)}
//                         </td>

//                         <td>
//                             ${getStatusBadge(record.status)}
//                         </td>

//                     </tr>
//                 `;

//             }).join("");

//     }


//     /* ==========================================
//        LOAD ATTENDANCE
//     ========================================== */

//     async function loadAttendance() {

//         try {

//             const records =
//                 await apiRequest(
//                     "/api/attendance/my-attendance"
//                 );

//             updateTodayStatus(records);
//             renderAttendance(records);

//         } catch (error) {

//             console.error(
//                 "Unable to load attendance:",
//                 error
//             );

//             attendanceTableBody.innerHTML = `
//                 <tr>
//                     <td
//                         colspan="5"
//                         class="table-loading"
//                     >
//                         Unable to load attendance records.
//                     </td>
//                 </tr>
//             `;

//         }

//     }


//     /* ==========================================
//        INITIALIZE
//     ========================================== */

//     setCurrentDate();
//     loadUser();

//     await loadAttendance();

// });



















document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const currentDate =
        document.getElementById("currentDate");

    const currentUsername =
        document.getElementById("currentUsername");

    const welcomeName =
        document.getElementById("welcomeName");

    const employeeAvatar =
        document.getElementById("employeeAvatar");

    const attendanceStatus =
        document.getElementById("attendanceStatus");

    const attendanceMessage =
        document.getElementById("attendanceMessage");

    const checkInTime =
        document.getElementById("checkInTime");

    const checkOutTime =
        document.getElementById("checkOutTime");

    const attendanceTableBody =
        document.getElementById("attendanceTableBody");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const employeeSidebar =
        document.getElementById("employeeSidebar");

    const logoutButton =
        document.getElementById("logoutButton");


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (mobileMenuButton && employeeSidebar) {

        mobileMenuButton.addEventListener("click", () => {

            employeeSidebar.classList.toggle(
                "mobile-open"
            );

        });

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            if (typeof logout === "function") {

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

        });

    }


    /* =====================================================
       CURRENT DATE
    ===================================================== */

    function setCurrentDate() {

        if (!currentDate) {
            return;
        }

        const today = new Date();

        currentDate.textContent =
            today.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    /* =====================================================
       LOAD EMPLOYEE PROFILE
    ===================================================== */

    async function loadEmployeeProfile() {

        try {

            const employee =
                await apiRequest(
                    "/api/employees/me"
                );


            console.log(
                "Employee profile:",
                employee
            );


            if (!employee) {
                return;
            }


            const employeeName =
                employee.name || "Employee";


            /*
             * Topbar name
             */

            if (currentUsername) {

                currentUsername.textContent =
                    employeeName;

            }


            /*
             * Welcome message
             */

            if (welcomeName) {

                welcomeName.textContent =
                    employeeName;

            }


            /*
             * Avatar
             */

            if (employeeAvatar) {

                employeeAvatar.textContent =
                    getInitial(employeeName);

            }

        } catch (error) {

            console.error(
                "Unable to load employee profile:",
                error
            );


            /*
             * If profile API fails,
             * fall back to stored login user.
             */

            loadStoredUser();

        }

    }


    /* =====================================================
       FALLBACK USER
    ===================================================== */

    function loadStoredUser() {

        let user = null;


        try {

            const storedUser =
                localStorage.getItem(
                    APP_CONFIG.USER_KEY
                );


            if (storedUser) {

                user =
                    JSON.parse(storedUser);

            }

        } catch (error) {

            console.error(
                "Unable to read stored user:",
                error
            );

        }


        if (!user) {
            return;
        }


        const username =
            user.username ||
            user.name ||
            "Employee";


        if (currentUsername) {

            currentUsername.textContent =
                username;

        }


        if (welcomeName) {

            welcomeName.textContent =
                username;

        }


        if (employeeAvatar) {

            employeeAvatar.textContent =
                getInitial(username);

        }

    }


    /* =====================================================
       INITIAL / LOCAL DATE
    ===================================================== */

    function getLocalDateString() {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                today.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

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

            return "—";
        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(
                `${value}T00:00:00`
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


    /* =====================================================
       FORMAT WORKING TIME
    ===================================================== */

    function formatWorkingTime(minutes) {

        if (
            minutes === null ||
            minutes === undefined
        ) {

            return "—";

        }


        const totalMinutes =
            Number(minutes);


        if (
            Number.isNaN(
                totalMinutes
            )
        ) {

            return "—";

        }


        const hours =
            Math.floor(
                totalMinutes / 60
            );


        const mins =
            totalMinutes % 60;


        if (hours === 0) {

            return `${mins} min`;

        }


        return `${hours}h ${mins}m`;

    }


    /* =====================================================
       STATUS BADGE
    ===================================================== */

    function getStatusBadge(status) {

        const value =
            String(status || "")
                .toUpperCase();


        if (value === "INSIDE") {

            return `
                <span class="attendance-status inside">
                    Inside
                </span>
            `;

        }


        if (value === "OUTSIDE") {

            return `
                <span class="attendance-status outside">
                    Completed
                </span>
            `;

        }


        return `
            <span class="attendance-status">
                ${status || "Unknown"}
            </span>
        `;

    }


    /* =====================================================
       TODAY ATTENDANCE
    ===================================================== */

    function updateTodayStatus(records) {

        /*
         * Default state
         */

        if (!records || records.length === 0) {

            attendanceStatus.textContent =
                "Not Checked In";

            attendanceMessage.textContent =
                "Scan the entrance QR code to record your attendance.";

            checkInTime.textContent =
                "—";

            checkOutTime.textContent =
                "—";

            return;

        }


        /*
         * Get today's date in local time.
         *
         * Do NOT use:
         * new Date().toISOString()
         *
         * because that uses UTC.
         */

        const today =
            getLocalDateString();


        /*
         * Find today's attendance record.
         */

        const todayRecord =
            records.find(
                record =>
                    record.attendance_date === today
            );


        /*
         * No record today
         */

        if (!todayRecord) {

            attendanceStatus.textContent =
                "Not Checked In";

            attendanceMessage.textContent =
                "Scan the entrance QR code to record your attendance.";

            checkInTime.textContent =
                "—";

            checkOutTime.textContent =
                "—";

            return;

        }


        /*
         * Today's check-in/out
         */

        checkInTime.textContent =
            formatTime(
                todayRecord.check_in
            );


        checkOutTime.textContent =
            formatTime(
                todayRecord.check_out
            );


        /*
         * Employee is currently inside
         */

        if (
            String(
                todayRecord.status
            ).toUpperCase() === "INSIDE"
        ) {

            attendanceStatus.textContent =
                "Currently Inside";

            attendanceMessage.textContent =
                "Your check-in has been recorded. Scan again when leaving.";

            return;

        }


        /*
         * Attendance completed
         */

        if (
            String(
                todayRecord.status
            ).toUpperCase() === "OUTSIDE"
        ) {

            attendanceStatus.textContent =
                "Attendance Completed";

            attendanceMessage.textContent =
                "Your attendance for today has been completed.";

            return;

        }


        /*
         * Other status
         */

        attendanceStatus.textContent =
            todayRecord.status || "Attendance Recorded";

        attendanceMessage.textContent =
            "Your attendance record has been recorded.";

    }


    /* =====================================================
       ATTENDANCE TABLE
    ===================================================== */

    function renderAttendance(records) {

        if (
            !records ||
            records.length === 0
        ) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="table-loading"
                    >
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;

        }


        /*
         * Backend normally returns newest records first.
         *
         * Show only the latest 5 on dashboard.
         */

        const recentRecords =
            records.slice(0, 5);


        attendanceTableBody.innerHTML =
            recentRecords
                .map(record => {

                    return `
                        <tr>

                            <td>
                                ${formatDate(
                                    record.attendance_date
                                )}
                            </td>

                            <td>
                                ${formatTime(
                                    record.check_in
                                )}
                            </td>

                            <td>
                                ${formatTime(
                                    record.check_out
                                )}
                            </td>

                            <td>
                                ${formatWorkingTime(
                                    record.working_minutes
                                )}
                            </td>

                            <td>
                                ${getStatusBadge(
                                    record.status
                                )}
                            </td>

                        </tr>
                    `;

                })
                .join("");

    }


    /* =====================================================
       LOAD ATTENDANCE
    ===================================================== */

    async function loadAttendance() {

        try {

            const records =
                await apiRequest(
                    "/api/attendance/my-attendance"
                );


            console.log(
                "Employee attendance:",
                records
            );


            updateTodayStatus(
                records
            );


            renderAttendance(
                records
            );


        } catch (error) {

            console.error(
                "Unable to load attendance:",
                error
            );


            attendanceStatus.textContent =
                "Unable to load";


            attendanceMessage.textContent =
                "We could not retrieve your attendance information.";


            checkInTime.textContent =
                "—";


            checkOutTime.textContent =
                "—";


            attendanceTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="table-loading"
                    >
                        Unable to load attendance records.
                    </td>
                </tr>
            `;

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setCurrentDate();

    await loadEmployeeProfile();

    await loadAttendance();

});


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