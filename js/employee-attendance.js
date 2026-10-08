/* ============================================
   EMPLOYEE ATTENDANCE HISTORY
   Atluri ASCEND™
============================================ */

document.addEventListener("DOMContentLoaded", function () {

    /* -----------------------------------------
       AUTHENTICATION
    ----------------------------------------- */

    if (typeof requireAuth === "function") {
        if (!requireAuth()) {
            return;
        }
    } else {
        const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);

        if (!token) {
            window.location.href = "/login.html";
            return;
        }
    }


    /* -----------------------------------------
       ELEMENTS
    ----------------------------------------- */

    const currentUsername =
        document.getElementById("currentUsername");

    const currentDate =
        document.getElementById("currentDate");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const attendanceTableBody =
        document.getElementById("attendanceTableBody");

    const emptyState =
        document.getElementById("emptyState");

    const totalRecords =
        document.getElementById("totalRecords");

    const presentDays =
        document.getElementById("presentDays");

    const totalHours =
        document.getElementById("totalHours");

    const lateDays =
        document.getElementById("lateDays");

    const startDate =
        document.getElementById("startDate");

    const endDate =
        document.getElementById("endDate");

    const statusFilter =
        document.getElementById("statusFilter");

    const searchInput =
        document.getElementById("searchInput");

    const clearFiltersButton =
        document.getElementById("clearFiltersButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebar =
        document.getElementById("sidebar");


    /* -----------------------------------------
       STATE
    ----------------------------------------- */

    let attendanceRecords = [];


    /* -----------------------------------------
       USER INFORMATION
    ----------------------------------------- */

    function loadUserInformation() {

        let user = null;

        if (typeof getCurrentUser === "function") {
            user = getCurrentUser();
        }

        if (!user) {
            try {
                const storedUser =
                    localStorage.getItem(APP_CONFIG.USER_KEY);

                if (storedUser) {
                    user = JSON.parse(storedUser);
                }
            } catch (error) {
                user = null;
            }
        }

        const username =
            user && user.username
                ? user.username
                : "Employee";

        currentUsername.textContent = username;

        profileAvatar.textContent =
            username.charAt(0).toUpperCase();

    }


    /* -----------------------------------------
       DATE
    ----------------------------------------- */

    function loadCurrentDate() {

        const today = new Date();

        currentDate.textContent =
            today.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

    }


    /* -----------------------------------------
       LOAD ATTENDANCE
    ----------------------------------------- */

    async function loadAttendance() {

        try {

            showLoading();

            /*
             * The backend endpoint returns the
             * authenticated employee's history.
             */
            const response =
                await apiRequest("/api/attendance/history");

            attendanceRecords =
                normalizeAttendanceResponse(response);

            updateSummary(attendanceRecords);

            renderAttendance(attendanceRecords);

        } catch (error) {

            console.error(
                "Attendance history error:",
                error
            );

            showError(
                error.message ||
                "Unable to load attendance history."
            );

        }

    }


    /* -----------------------------------------
       NORMALIZE RESPONSE
    ----------------------------------------- */

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


    /* -----------------------------------------
       SUMMARY
    ----------------------------------------- */

    function updateSummary(records) {

        totalRecords.textContent =
            records.length;


        let presentCount = 0;
        let lateCount = 0;
        let minutes = 0;


        records.forEach(function (record) {

            /*
             * A record itself represents a
             * recorded attendance day.
             */
            if (record.attendance_date) {
                presentCount++;
            }


            if (record.is_late === true) {
                lateCount++;
            }


            if (
                record.working_minutes !== null &&
                record.working_minutes !== undefined
            ) {
                const value =
                    Number(record.working_minutes);

                if (!Number.isNaN(value)) {
                    minutes += value;
                }
            }

        });


        presentDays.textContent =
            presentCount;

        lateDays.textContent =
            lateCount;

        totalHours.textContent =
            formatTotalHours(minutes);

    }


    /* -----------------------------------------
       TOTAL HOURS
    ----------------------------------------- */

    function formatTotalHours(minutes) {

        if (!minutes || minutes <= 0) {
            return "0h";
        }

        const hours =
            Math.floor(minutes / 60);

        const remainingMinutes =
            minutes % 60;


        if (remainingMinutes === 0) {
            return `${hours}h`;
        }


        return `${hours}h ${remainingMinutes}m`;

    }


    /* -----------------------------------------
       RENDER TABLE
    ----------------------------------------- */

    function renderAttendance(records) {

        const filteredRecords =
            applyFilters(records);


        if (filteredRecords.length === 0) {

            attendanceTableBody.innerHTML = "";

            emptyState.style.display = "block";

            return;

        }


        emptyState.style.display = "none";


        attendanceTableBody.innerHTML =
            filteredRecords
                .map(function (record) {

                    return createAttendanceRow(record);

                })
                .join("");

    }


    /* -----------------------------------------
       CREATE TABLE ROW
    ----------------------------------------- */

    function createAttendanceRow(record) {

        const date =
            record.attendance_date || "—";

        const checkIn =
            formatTime(record.check_in);

        const checkOut =
            formatTime(record.check_out);

        const workingMinutes =
            record.working_minutes;


        const workingHours =
            formatWorkingHours(workingMinutes);


        const status =
            String(record.status || "OUTSIDE")
                .toUpperCase();


        const statusClass =
            status === "INSIDE"
                ? "inside"
                : "outside";


        const attendanceClass =
            record.is_late === true
                ? "late"
                : "normal";


        const attendanceText =
            record.is_late === true
                ? "Late"
                : "On Time";


        return `
            <tr>

                <td>
                    <span class="attendance-date">
                        ${escapeHtml(formatDate(date))}
                    </span>

                    <span class="attendance-day">
                        ${escapeHtml(formatDay(date))}
                    </span>
                </td>


                <td>
                    <span class="${checkIn === "—"
                        ? "muted-value"
                        : "time-value"}">
                        ${escapeHtml(checkIn)}
                    </span>
                </td>


                <td>
                    <span class="${checkOut === "—"
                        ? "muted-value"
                        : "time-value"}">
                        ${escapeHtml(checkOut)}
                    </span>
                </td>


                <td>
                    <span class="working-hours">
                        ${escapeHtml(workingHours)}
                    </span>

                    ${
                        workingMinutes !== null &&
                        workingMinutes !== undefined
                            ? `
                                <span class="working-minutes">
                                    ${escapeHtml(
                                        String(workingMinutes)
                                    )} minutes
                                </span>
                              `
                            : ""
                    }
                </td>


                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHtml(
                            status === "INSIDE"
                                ? "Inside"
                                : "Checked Out"
                        )}
                    </span>
                </td>


                <td>
                    <span class="status-badge ${attendanceClass}">
                        ${attendanceText}
                    </span>
                </td>

            </tr>
        `;

    }


    /* -----------------------------------------
       FILTERS
    ----------------------------------------- */

    function applyFilters(records) {

        const from =
            startDate.value;

        const to =
            endDate.value;

        const status =
            statusFilter.value.toUpperCase();

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        return records.filter(function (record) {

            const recordDate =
                record.attendance_date || "";


            if (from && recordDate < from) {
                return false;
            }


            if (to && recordDate > to) {
                return false;
            }


            if (status) {

                const recordStatus =
                    String(
                        record.status || ""
                    ).toUpperCase();


                if (recordStatus !== status) {
                    return false;
                }

            }


            if (search) {

                const searchableText =
                    [
                        recordDate,
                        record.status,
                        record.check_in,
                        record.check_out,
                        record.working_minutes
                    ]
                        .join(" ")
                        .toLowerCase();


                if (
                    !searchableText.includes(search)
                ) {
                    return false;
                }

            }


            return true;

        });

    }


    /* -----------------------------------------
       FILTER EVENTS
    ----------------------------------------- */

    startDate.addEventListener(
        "change",
        function () {
            renderAttendance(attendanceRecords);
        }
    );


    endDate.addEventListener(
        "change",
        function () {
            renderAttendance(attendanceRecords);
        }
    );


    statusFilter.addEventListener(
        "change",
        function () {
            renderAttendance(attendanceRecords);
        }
    );


    searchInput.addEventListener(
        "input",
        function () {
            renderAttendance(attendanceRecords);
        }
    );


    clearFiltersButton.addEventListener(
        "click",
        function () {

            startDate.value = "";
            endDate.value = "";
            statusFilter.value = "";
            searchInput.value = "";

            renderAttendance(attendanceRecords);

        }
    );


    /* -----------------------------------------
       FORMAT DATE
    ----------------------------------------- */

    function formatDate(dateString) {

        if (!dateString) {
            return "—";
        }

        const date =
            new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return dateString;
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


    /* -----------------------------------------
       DAY
    ----------------------------------------- */

    function formatDay(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long"
            }
        );

    }


    /* -----------------------------------------
       FORMAT TIME
    ----------------------------------------- */

    function formatTime(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
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


    /* -----------------------------------------
       WORKING HOURS
    ----------------------------------------- */

    function formatWorkingHours(minutes) {

        if (
            minutes === null ||
            minutes === undefined ||
            Number.isNaN(Number(minutes))
        ) {
            return "—";
        }


        const totalMinutes =
            Number(minutes);


        if (totalMinutes <= 0) {
            return "0h";
        }


        const hours =
            Math.floor(totalMinutes / 60);

        const remainingMinutes =
            totalMinutes % 60;


        if (remainingMinutes === 0) {
            return `${hours}h`;
        }


        return `${hours}h ${remainingMinutes}m`;

    }


    /* -----------------------------------------
       LOADING
    ----------------------------------------- */

    function showLoading() {

        emptyState.style.display = "none";

        attendanceTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="loading-row"
                >
                    Loading attendance...
                </td>
            </tr>
        `;

    }


    /* -----------------------------------------
       ERROR
    ----------------------------------------- */

    function showError(message) {

        attendanceTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="loading-row"
                >
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;

        emptyState.style.display = "none";

        showToast(message);

    }


    /* -----------------------------------------
       TOAST
    ----------------------------------------- */

    function showToast(message) {

        const toast =
            document.getElementById("attendanceToast");

        const toastMessage =
            document.getElementById("toastMessage");

        toastMessage.textContent = message;

        toast.classList.add("show");


        setTimeout(function () {
            toast.classList.remove("show");
        }, 4000);

    }


    /* -----------------------------------------
       ESCAPE HTML
    ----------------------------------------- */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* -----------------------------------------
       LOGOUT
    ----------------------------------------- */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

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
                    "/login.html";

            }
        );

    }


    /* -----------------------------------------
       MOBILE MENU
    ----------------------------------------- */

    if (
        mobileMenuButton &&
        sidebar
    ) {

        mobileMenuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle("mobile-open");

            }
        );

    }


    /* -----------------------------------------
       PROFILE LINK
    ----------------------------------------- */

    const employeeProfileLink =
        document.getElementById(
            "employeeProfileLink"
        );

    if (employeeProfileLink) {

        employeeProfileLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showToast(
                    "Profile management will be available soon."
                );

            }
        );

    }


    /* -----------------------------------------
       INITIALIZE
    ----------------------------------------- */

    loadUserInformation();

    loadCurrentDate();

    loadAttendance();

});