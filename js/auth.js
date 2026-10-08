// ============================================================
// Atluri ASCEND™
// Shared Authentication Utilities
// ============================================================


// ============================================================
// CHECK AUTHENTICATION
// ============================================================

function isAuthenticated() {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);

    return Boolean(token);
}


// ============================================================
// GET CURRENT USER
// ============================================================

function getCurrentUser() {
    const userData =
        localStorage.getItem(APP_CONFIG.USER_KEY);

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch (error) {
        console.error(
            "Unable to parse current user:",
            error
        );

        return null;
    }
}


// ============================================================
// GET CURRENT USERNAME
// ============================================================

function getCurrentUsername() {
    const user = getCurrentUser();

    if (!user) {
        return "";
    }

    return user.username || "";
}


// ============================================================
// GET CURRENT USER ROLE
// ============================================================

function getCurrentUserRole() {
    const user = getCurrentUser();

    if (!user) {
        return "";
    }

    return user.role || "";
}


// ============================================================
// REQUIRE AUTHENTICATION
// ============================================================

function requireAuth() {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }

    return true;
}


// ============================================================
// REQUIRE ADMIN ROLE
// ============================================================

function requireAdmin() {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }

    const role = getCurrentUserRole();

    if (role !== "ADMIN") {
        console.warn(
            "Admin access required."
        );

        redirectToLogin();
        return false;
    }

    return true;
}


// ============================================================
// REDIRECT TO LOGIN
// ============================================================

function redirectToLogin() {
    const currentPath =
        window.location.pathname;

    if (currentPath.includes("/pages/")) {
        window.location.href = "../login.html";
    } else {
        window.location.href = "login.html";
    }
}


// ============================================================
// AUTHENTICATION REDIRECT
// ============================================================

function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = "index.html";
    }
}


// ============================================================
// DISPLAY USER INFORMATION
// ============================================================

function displayCurrentUser(
    usernameElementId = "currentUsername"
) {
    const element =
        document.getElementById(
            usernameElementId
        );

    if (!element) {
        return;
    }

    const username =
        getCurrentUsername();

    element.textContent =
        username || "Admin";
}


// ============================================================
// DISPLAY CURRENT DATE
// ============================================================

function displayCurrentDate(
    elementId = "currentDate"
) {
    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    const today = new Date();

    element.textContent =
        today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}