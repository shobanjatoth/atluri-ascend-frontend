document.addEventListener("DOMContentLoaded", () => {
    initializeAuditLogs();
});


let allAuditLogs = [];
let filteredAuditLogs = [];


async function initializeAuditLogs() {

    setupMobileMenu();
    setupLogout();
    setupFilters();
    setupRefreshButton();

    displayCurrentDate();
    displayCurrentUser();

    await loadAuditLogs();
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

    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {

        if (typeof logout === "function") {
            logout();
        } else {
            localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
            localStorage.removeItem(APP_CONFIG.USER_KEY);

            window.location.href = "../login.html";
        }
    });
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
   FILTER SETUP
========================================================= */

function setupFilters() {

    const searchInput = document.getElementById("auditSearch");
    const actionFilter = document.getElementById("actionFilter");
    const dateFilter = document.getElementById("dateFilter");
    const userFilter = document.getElementById("userFilter");
    const clearButton = document.getElementById("clearAuditFilters");

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (actionFilter) {
        actionFilter.addEventListener("change", applyFilters);
    }

    if (dateFilter) {
        dateFilter.addEventListener("change", applyFilters);
    }

    if (userFilter) {
        userFilter.addEventListener("input", applyFilters);
    }

    if (clearButton) {

        clearButton.addEventListener("click", () => {

            if (searchInput) {
                searchInput.value = "";
            }

            if (actionFilter) {
                actionFilter.value = "";
            }

            if (dateFilter) {
                dateFilter.value = "";
            }

            if (userFilter) {
                userFilter.value = "";
            }

            applyFilters();
        });
    }
}


/* =========================================================
   REFRESH
========================================================= */

function setupRefreshButton() {

    const refreshButton = document.getElementById("refreshAuditButton");

    if (!refreshButton) {
        return;
    }

    refreshButton.addEventListener("click", async () => {
        await loadAuditLogs();
    });
}


/* =========================================================
   LOAD AUDIT LOGS
========================================================= */

async function loadAuditLogs() {

    showLoadingState();

    try {

        /*
         * IMPORTANT:
         * Backend route is:
         *
         * GET /api/audit
         *
         * NOT:
         * /api/audit-logs
         */

        const response = await apiRequest("/api/audit?limit=500");

        allAuditLogs = Array.isArray(response) ? response : [];

        filteredAuditLogs = [...allAuditLogs];

        updateSummaryCards();

        applyFilters();

    } catch (error) {

        console.error("Failed to load audit logs:", error);

        showErrorState(
            error.message || "Unable to load audit logs."
        );
    }
}


/* =========================================================
   FILTER LOGS
========================================================= */

function applyFilters() {

    const searchInput = document.getElementById("auditSearch");
    const actionFilter = document.getElementById("actionFilter");
    const dateFilter = document.getElementById("dateFilter");
    const userFilter = document.getElementById("userFilter");

    const searchValue = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const actionValue = actionFilter
        ? actionFilter.value
        : "";

    const dateValue = dateFilter
        ? dateFilter.value
        : "";

    const userValue = userFilter
        ? userFilter.value.trim()
        : "";


    filteredAuditLogs = allAuditLogs.filter((log) => {

        /* SEARCH */

        if (searchValue) {

            const searchableText = [
                log.action,
                log.ip_address,
                log.device_info,
                log.user_id
            ]
                .filter(value => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase();

            if (!searchableText.includes(searchValue)) {
                return false;
            }
        }


        /* ACTION */

        if (actionValue && log.action !== actionValue) {
            return false;
        }


        /* DATE */

        if (dateValue) {

            if (!log.created_at) {
                return false;
            }

            const logDate = new Date(log.created_at);

            const formattedDate = logDate.toISOString().split("T")[0];

            if (formattedDate !== dateValue) {
                return false;
            }
        }


        /* USER ID */

        if (userValue) {

            if (String(log.user_id || "") !== userValue) {
                return false;
            }
        }


        return true;
    });


    renderAuditTable();
    updateResultCount();
}


/* =========================================================
   SUMMARY CARDS
========================================================= */

function updateSummaryCards() {

    const totalEvents = allAuditLogs.length;

    const successfulActions = allAuditLogs.filter(log => {

        return log.action !== "LOGIN_FAILED";

    }).length;


    const loginFailures = allAuditLogs.filter(log => {

        return log.action === "LOGIN_FAILED";

    }).length;


    const uniqueUsers = new Set();

    allAuditLogs.forEach(log => {

        if (log.user_id !== null && log.user_id !== undefined) {
            uniqueUsers.add(log.user_id);
        }

    });


    setText("totalEvents", totalEvents);
    setText("successfulActions", successfulActions);
    setText("loginFailures", loginFailures);
    setText("activeUsers", uniqueUsers.size);
}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderAuditTable() {

    const tableBody = document.getElementById("auditTableBody");

    const loadingState = document.getElementById("auditLoading");
    const emptyState = document.getElementById("auditEmpty");
    const errorState = document.getElementById("auditError");


    if (loadingState) {
        loadingState.hidden = true;
    }

    if (errorState) {
        errorState.hidden = true;
    }


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (filteredAuditLogs.length === 0) {

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }


    if (emptyState) {
        emptyState.hidden = true;
    }


    filteredAuditLogs.forEach(log => {

        const row = document.createElement("tr");


        /* EVENT */

        const eventCell = document.createElement("td");

        eventCell.innerHTML = `
            <div class="audit-event-cell">
                <div class="audit-event-icon ${getActionClass(log.action)}">
                    ${getActionIcon(log.action)}
                </div>

                <div class="audit-event-details">
                    <strong>${escapeHtml(formatAction(log.action))}</strong>
                    <span>Event #${escapeHtml(log.id)}</span>
                </div>
            </div>
        `;


        /* USER */

        const userCell = document.createElement("td");

        userCell.innerHTML = `
            <div class="audit-user-cell">
                <strong>${escapeHtml(
                    log.user_id !== null && log.user_id !== undefined
                        ? `User #${log.user_id}`
                        : "System"
                )}</strong>
            </div>
        `;


        /* ACTION */

        const actionCell = document.createElement("td");

        actionCell.innerHTML = `
            <span class="audit-action-badge ${getActionClass(log.action)}">
                ${escapeHtml(formatAction(log.action))}
            </span>
        `;


        /* IP */

        const ipCell = document.createElement("td");

        ipCell.innerHTML = `
            <span class="audit-ip">
                ${escapeHtml(log.ip_address || "—")}
            </span>
        `;


        /* DEVICE */

        const deviceCell = document.createElement("td");

        deviceCell.innerHTML = `
            <span class="audit-device" title="${escapeHtml(
                log.device_info || ""
            )}">
                ${escapeHtml(
                    shortenDevice(log.device_info)
                )}
            </span>
        `;


        /* DATE */

        const dateCell = document.createElement("td");

        dateCell.innerHTML = `
            <div class="audit-datetime">
                ${formatDateTime(log.created_at)}
            </div>
        `;


        row.appendChild(eventCell);
        row.appendChild(userCell);
        row.appendChild(actionCell);
        row.appendChild(ipCell);
        row.appendChild(deviceCell);
        row.appendChild(dateCell);

        tableBody.appendChild(row);
    });
}


/* =========================================================
   LOADING
========================================================= */

function showLoadingState() {

    const loadingState = document.getElementById("auditLoading");
    const emptyState = document.getElementById("auditEmpty");
    const errorState = document.getElementById("auditError");
    const tableBody = document.getElementById("auditTableBody");


    if (loadingState) {
        loadingState.hidden = false;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    if (errorState) {
        errorState.hidden = true;
    }

    if (tableBody) {
        tableBody.innerHTML = "";
    }
}


/* =========================================================
   ERROR
========================================================= */

function showErrorState(message) {

    const loadingState = document.getElementById("auditLoading");
    const emptyState = document.getElementById("auditEmpty");
    const errorState = document.getElementById("auditError");
    const errorMessage = document.getElementById("auditErrorMessage");
    const tableBody = document.getElementById("auditTableBody");


    if (loadingState) {
        loadingState.hidden = true;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    if (tableBody) {
        tableBody.innerHTML = "";
    }


    if (errorState) {

        errorState.hidden = false;

        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
}


/* =========================================================
   RESULT COUNT
========================================================= */

function updateResultCount() {

    const element = document.getElementById("auditResultCount");

    if (!element) {
        return;
    }

    element.textContent =
        `${filteredAuditLogs.length} event${filteredAuditLogs.length === 1 ? "" : "s"}`;
}


/* =========================================================
   ACTION FORMATTING
========================================================= */

function formatAction(action) {

    if (!action) {
        return "Unknown";
    }

    return action
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, letter => letter.toUpperCase());
}


function getActionClass(action) {

    if (!action) {
        return "";
    }

    if (action === "LOGIN") {
        return "login";
    }

    if (action === "LOGIN_FAILED") {
        return "failed";
    }

    if (
        action === "CHECK_IN" ||
        action === "CHECK_OUT"
    ) {
        return "attendance";
    }

    if (action === "QR_GENERATED") {
        return "qr";
    }

    if (
        action === "EMPLOYEE_CREATED" ||
        action === "EMPLOYEE_UPDATED" ||
        action === "EMPLOYEE_DEACTIVATED"
    ) {
        return "employee";
    }

    return "";
}


function getActionIcon(action) {

    if (action === "LOGIN") {
        return "→";
    }

    if (action === "LOGIN_FAILED") {
        return "!";
    }

    if (action === "CHECK_IN") {
        return "↓";
    }

    if (action === "CHECK_OUT") {
        return "↑";
    }

    if (action === "QR_GENERATED") {
        return "▣";
    }

    if (
        action === "EMPLOYEE_CREATED" ||
        action === "EMPLOYEE_UPDATED" ||
        action === "EMPLOYEE_DEACTIVATED"
    ) {
        return "♙";
    }

    return "•";
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   DEVICE FORMAT
========================================================= */

function shortenDevice(device) {

    if (!device) {
        return "—";
    }

    if (device.length <= 55) {
        return device;
    }

    return device.substring(0, 52) + "...";
}


/* =========================================================
   HTML ESCAPE
========================================================= */

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


/* =========================================================
   HELPER
========================================================= */

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}