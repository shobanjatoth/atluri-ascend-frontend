document.addEventListener("DOMContentLoaded", async function () {

    // ==============================
    // AUTH CHECK
    // ==============================

    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // ==============================
    // ELEMENTS
    // ==============================

    const totalEmployees = document.getElementById("totalEmployees");
    const presentToday = document.getElementById("presentToday");
    const currentlyInside = document.getElementById("currentlyInside");
    const lateToday = document.getElementById("lateToday");

    const presentLegend = document.getElementById("presentLegend");
    const insideLegend = document.getElementById("insideLegend");
    const checkoutLegend = document.getElementById("checkoutLegend");

    const attendancePercent = document.getElementById("attendancePercent");
    const attendanceRing = document.getElementById("attendanceRing");

    const departmentList = document.getElementById("departmentList");
    const attendanceTableBody = document.getElementById("attendanceTableBody");

    // ==============================
    // CURRENT USER
    // ==============================

    const user = JSON.parse(
        localStorage.getItem(APP_CONFIG.USER_KEY) || "{}"
    );

    const adminName = document.getElementById("adminName");

    if (adminName) {
        adminName.textContent = user.username || "Admin";
    }

    // ==============================
    // DATE
    // ==============================

    const today = new Date();

    const dateElement = document.getElementById("dashboardDate");

    if (dateElement) {
        dateElement.textContent = today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // ==============================
    // LOAD DASHBOARD
    // ==============================

    async function loadDashboard() {

        try {

            const data = await getDashboard();

            console.log("Dashboard data:", data);

            // ==============================
            // SUMMARY
            // ==============================

            const summary = data.summary || {};

            const total = summary.total_employees || 0;
            const present = summary.present_today || 0;
            const inside = summary.currently_inside || 0;
            const late = summary.late_today || 0;
            const checkedOut = summary.checked_out_today || 0;

            // ==============================
            // KPI CARDS
            // ==============================

            if (totalEmployees) {
                totalEmployees.textContent = total;
            }

            if (presentToday) {
                presentToday.textContent = present;
            }

            if (currentlyInside) {
                currentlyInside.textContent = inside;
            }

            if (lateToday) {
                lateToday.textContent = late;
            }

            // ==============================
            // ATTENDANCE PERCENTAGE
            // ==============================

            let percentage = 0;

            if (summary.active_employees > 0) {
                percentage =
                    (present / summary.active_employees) * 100;
            }

            percentage = Math.round(percentage);

            if (attendancePercent) {
                attendancePercent.textContent = `${percentage}%`;
            }

            // ==============================
            // ATTENDANCE RING
            // ==============================

            if (attendanceRing) {

                attendanceRing.style.background =
                    `conic-gradient(
                        #8b5e3c ${percentage}%,
                        #eee4d8 ${percentage}% 100%
                    )`;

            }

            // ==============================
            // ATTENDANCE LEGEND
            // ==============================

            if (presentLegend) {
                presentLegend.textContent = present;
            }

            if (insideLegend) {
                insideLegend.textContent = inside;
            }

            if (checkoutLegend) {
                checkoutLegend.textContent = checkedOut;
            }

            // ==============================
            // DEPARTMENTS
            // ==============================

            renderDepartments(data.departments || []);

            // ==============================
            // RECENT ATTENDANCE
            // ==============================

            renderRecentAttendance(
                data.recent_attendance || []
            );

        } catch (error) {

            console.error(
                "Dashboard loading failed:",
                error
            );

            showDashboardError(error);
        }
    }

    // ==============================
    // RENDER DEPARTMENTS
    // ==============================

    function renderDepartments(departments) {

        if (!departmentList) {
            return;
        }

        departmentList.innerHTML = "";

        if (departments.length === 0) {

            departmentList.innerHTML = `
                <div class="empty-state">
                    No departments found.
                </div>
            `;

            return;
        }

        departments.forEach(function (department) {

            const item = document.createElement("div");

            item.className = "department-item";

            item.innerHTML = `
                <div class="department-info">
                    <div class="department-icon">
                        ${getDepartmentInitial(
                            department.department_name
                        )}
                    </div>

                    <div>
                        <div class="department-name">
                            ${escapeHtml(
                                department.department_name
                            )}
                        </div>

                        <div class="department-count">
                            ${department.employee_count} employees
                        </div>
                    </div>
                </div>
            `;

            departmentList.appendChild(item);
        });
    }

    // ==============================
    // RENDER RECENT ATTENDANCE
    // ==============================

    function renderRecentAttendance(records) {

        if (!attendanceTableBody) {
            return;
        }

        attendanceTableBody.innerHTML = "";

        if (records.length === 0) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;
        }

        records.forEach(function (record) {

            const row = document.createElement("tr");

            const checkIn = formatTime(record.check_in);
            const checkOut = formatTime(record.check_out);

            let statusClass = "status-outside";
            let statusText = "OUTSIDE";

            if (record.status === "INSIDE") {
                statusClass = "status-inside";
                statusText = "INSIDE";
            }

            row.innerHTML = `
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar">
                            ${getInitials(record.employee_name)}
                        </div>

                        <div>
                            <div class="employee-name">
                                ${escapeHtml(
                                    record.employee_name
                                )}
                            </div>

                            <div class="employee-code">
                                ${escapeHtml(
                                    record.employee_code
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                <td>
                    ${formatDate(record.attendance_date)}
                </td>

                <td>
                    ${checkIn}
                </td>

                <td>
                    ${checkOut}
                </td>

                <td>
                    ${record.working_minutes !== null &&
                    record.working_minutes !== undefined
                        ? `${record.working_minutes} min`
                        : "—"}
                </td>

                <td>
                    <span class="attendance-status ${statusClass}">
                        ${statusText}
                    </span>
                </td>
            `;

            attendanceTableBody.appendChild(row);
        });
    }

    // ==============================
    // FORMAT TIME
    // ==============================

    function formatTime(value) {

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // ==============================
    // FORMAT DATE
    // ==============================

    function formatDate(value) {

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // ==============================
    // DEPARTMENT INITIAL
    // ==============================

    function getDepartmentInitial(name) {

        if (!name) {
            return "D";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    }

    // ==============================
    // EMPLOYEE INITIALS
    // ==============================

    function getInitials(name) {

        if (!name) {
            return "—";
        }

        const words = name.trim().split(" ");

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();
    }

    // ==============================
    // HTML SAFETY
    // ==============================

    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ==============================
    // ERROR STATE
    // ==============================

    function showDashboardError(error) {

        if (totalEmployees) {
            totalEmployees.textContent = "—";
        }

        if (presentToday) {
            presentToday.textContent = "—";
        }

        if (currentlyInside) {
            currentlyInside.textContent = "—";
        }

        if (lateToday) {
            lateToday.textContent = "—";
        }

        console.error(error);
    }

    // ==============================
    // START
    // ==============================

    await loadDashboard();

});