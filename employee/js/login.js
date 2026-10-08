document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("employeeLoginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    const loginAlert = document.getElementById("loginAlert");

    const loginButton = document.getElementById("employeeLoginButton");
    const loginButtonText = document.getElementById("loginButtonText");

    const togglePassword = document.getElementById("togglePassword");


    /* ==========================================
       PASSWORD VISIBILITY
    ========================================== */

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            togglePassword.textContent = "Hide";

        } else {

            passwordInput.type = "password";
            togglePassword.textContent = "Show";

        }

    });


    /* ==========================================
       CLEAR FIELD ERROR
    ========================================== */

    usernameInput.addEventListener("input", () => {
        usernameError.textContent = "";
        usernameInput.classList.remove("invalid");
    });

    passwordInput.addEventListener("input", () => {
        passwordError.textContent = "";
        passwordInput.classList.remove("invalid");
    });


    /* ==========================================
       SHOW ALERT
    ========================================== */

    function showAlert(message) {

        loginAlert.textContent = message;
        loginAlert.classList.remove("hidden");

    }


    function hideAlert() {

        loginAlert.textContent = "";
        loginAlert.classList.add("hidden");

    }


    /* ==========================================
       VALIDATION
    ========================================== */

    function validateForm() {

        let valid = true;

        usernameError.textContent = "";
        passwordError.textContent = "";

        usernameInput.classList.remove("invalid");
        passwordInput.classList.remove("invalid");

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username) {

            usernameError.textContent = "Username is required.";
            usernameInput.classList.add("invalid");

            valid = false;
        }

        if (!password) {

            passwordError.textContent = "Password is required.";
            passwordInput.classList.add("invalid");

            valid = false;
        }

        return valid;
    }


    /* ==========================================
       LOGIN
    ========================================== */

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        hideAlert();

        if (!validateForm()) {
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        loginButton.disabled = true;
        loginButtonText.textContent = "Signing in...";


        try {

            /*
             * api.js already contains the working
             * login() helper used by the admin portal.
             */

            const response = await login(username, password);

            if (!response) {

                throw new Error("Login failed.");

            }


            /*
             * Employee users should enter the
             * employee dashboard.
             */

            if (response.role === "ADMIN") {

                window.location.href = "../index.html";

                return;
            }


            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("Employee login error:", error);

            showAlert(
                error.message ||
                "Unable to sign in. Please check your credentials."
            );

        } finally {

            loginButton.disabled = false;
            loginButtonText.textContent = "Sign In";

        }

    });

});