







// document.addEventListener("DOMContentLoaded", function () {

//     /* =========================================
//        DOM ELEMENTS
//     ========================================= */

//     const loginForm =
//         document.getElementById("loginForm");

//     const usernameInput =
//         document.getElementById("username");

//     const passwordInput =
//         document.getElementById("password");

//     const usernameError =
//         document.getElementById("usernameError");

//     const passwordError =
//         document.getElementById("passwordError");

//     const loginAlert =
//         document.getElementById("loginAlert");

//     const loginAlertMessage =
//         document.getElementById("loginAlertMessage");

//     const loginButton =
//         document.getElementById("loginButton");

//     const loginButtonText =
//         document.getElementById("loginButtonText");

//     const buttonLoader =
//         document.getElementById("buttonLoader");

//     const passwordToggle =
//         document.getElementById("passwordToggle");


//     /* =========================================
//        SAFETY CHECK
//     ========================================= */

//     if (
//         !loginForm ||
//         !usernameInput ||
//         !passwordInput
//     ) {
//         console.error("Admin login form elements not found.");
//         return;
//     }


//     /* =========================================
//        CLEAR EXISTING SESSION
//     ========================================= */

//     function clearSession() {

//         localStorage.removeItem(
//             APP_CONFIG.TOKEN_KEY
//         );

//         localStorage.removeItem(
//             APP_CONFIG.USER_KEY
//         );
//     }


//     /* =========================================
//        CHECK EXISTING SESSION
//     ========================================= */

//     async function checkExistingSession() {

//         const existingToken =
//             localStorage.getItem(
//                 APP_CONFIG.TOKEN_KEY
//             );

//         if (!existingToken) {
//             return;
//         }

//         try {

//             const user =
//                 await apiRequest("/api/auth/me");

//             /*
//              * Only an ADMIN can continue
//              * to the admin portal.
//              */

//             if (
//                 user &&
//                 String(user.role).toUpperCase() === "ADMIN"
//             ) {

//                 window.location.href =
//                     "index.html";

//                 return;
//             }

//             /*
//              * Employee token found.
//              * Do not allow it into admin portal.
//              */

//             clearSession();

//         } catch (error) {

//             console.log(
//                 "Existing session is invalid."
//             );

//             clearSession();
//         }
//     }


//     /* =========================================
//        PASSWORD SHOW / HIDE
//     ========================================= */

//     if (passwordToggle) {

//         passwordToggle.addEventListener(
//             "click",
//             function () {

//                 if (
//                     passwordInput.type === "password"
//                 ) {

//                     passwordInput.type = "text";

//                     passwordToggle.textContent =
//                         "Hide";

//                     passwordToggle.setAttribute(
//                         "aria-label",
//                         "Hide password"
//                     );

//                 } else {

//                     passwordInput.type =
//                         "password";

//                     passwordToggle.textContent =
//                         "Show";

//                     passwordToggle.setAttribute(
//                         "aria-label",
//                         "Show password"
//                     );
//                 }
//             }
//         );
//     }


//     /* =========================================
//        CLEAR ERRORS
//     ========================================= */

//     function clearErrors() {

//         if (usernameError) {
//             usernameError.textContent = "";
//         }

//         if (passwordError) {
//             passwordError.textContent = "";
//         }

//         usernameInput.classList.remove(
//             "input-error"
//         );

//         passwordInput.classList.remove(
//             "input-error"
//         );
//     }


//     /* =========================================
//        HIDE ALERT
//     ========================================= */

//     function hideAlert() {

//         if (loginAlert) {
//             loginAlert.classList.remove("show");
//         }
//     }


//     /* =========================================
//        SHOW ALERT
//     ========================================= */

//     function showAlert(message) {

//         if (!loginAlert || !loginAlertMessage) {
//             console.error(message);
//             return;
//         }

//         loginAlertMessage.textContent =
//             String(message);

//         loginAlert.classList.add("show");
//     }


//     /* =========================================
//        FORM VALIDATION
//     ========================================= */

//     function validateForm() {

//         clearErrors();

//         let valid = true;

//         const username =
//             usernameInput.value.trim();

//         const password =
//             passwordInput.value;


//         if (!username) {

//             if (usernameError) {

//                 usernameError.textContent =
//                     "Please enter your username.";
//             }

//             usernameInput.classList.add(
//                 "input-error"
//             );

//             valid = false;
//         }


//         if (!password) {

//             if (passwordError) {

//                 passwordError.textContent =
//                     "Please enter your password.";
//             }

//             passwordInput.classList.add(
//                 "input-error"
//             );

//             valid = false;
//         }


//         return valid;
//     }


//     /* =========================================
//        LOADING STATE
//     ========================================= */

//     function setLoading(isLoading) {

//         if (loginButton) {
//             loginButton.disabled =
//                 isLoading;
//         }


//         if (isLoading) {

//             if (loginButtonText) {

//                 loginButtonText.textContent =
//                     "Signing in...";
//             }

//             if (buttonLoader) {

//                 buttonLoader.classList.add(
//                     "active"
//                 );
//             }

//         } else {

//             if (loginButtonText) {

//                 loginButtonText.textContent =
//                     "Sign in";
//             }

//             if (buttonLoader) {

//                 buttonLoader.classList.remove(
//                     "active"
//                 );
//             }
//         }
//     }


//     /* =========================================
//        LOGIN
//     ========================================= */

//     loginForm.addEventListener(
//         "submit",
//         async function (event) {

//             event.preventDefault();
//             event.stopPropagation();


//             clearErrors();
//             hideAlert();


//             if (!validateForm()) {
//                 return;
//             }


//             const username =
//                 usernameInput.value.trim();

//             const password =
//                 passwordInput.value;


//             setLoading(true);


//             try {

//                 /* =================================
//                    CALL BACKEND LOGIN
//                 ================================= */

//                 const data =
//                     await login(
//                         username,
//                         password
//                     );


//                 /* =================================
//                    CHECK RESPONSE
//                 ================================= */

//                 if (
//                     !data ||
//                     !data.access_token
//                 ) {

//                     throw new Error(
//                         "No access token was returned."
//                     );
//                 }


//                 /* =================================
//                    CHECK ROLE
//                 ================================= */

//                 const userRole =
//                     String(
//                         data.role || ""
//                     ).toUpperCase();


//                 if (userRole !== "ADMIN") {

//                     /*
//                      * Employee credentials should
//                      * never enter the admin portal.
//                      */

//                     clearSession();

//                     showAlert(
//                         "This account does not have administrator access."
//                     );

//                     return;
//                 }


//                 /* =================================
//                    SAVE TOKEN
//                 ================================= */

//                 localStorage.setItem(
//                     APP_CONFIG.TOKEN_KEY,
//                     data.access_token
//                 );


//                 /* =================================
//                    SAVE USER
//                 ================================= */

//                 const currentUser = {

//                     id: data.user_id,

//                     username:
//                         data.username || username,

//                     role:
//                         data.role,

//                     is_active: true
//                 };


//                 localStorage.setItem(
//                     APP_CONFIG.USER_KEY,
//                     JSON.stringify(
//                         currentUser
//                     )
//                 );


//                 /* =================================
//                    ADMIN DASHBOARD
//                 ================================= */

//                 window.location.href =
//                     "index.html";

//             }


//             /* =====================================
//                ERROR HANDLING
//             ===================================== */

//             catch (error) {

//                 console.error(
//                     "Admin login error:",
//                     error
//                 );


//                 if (error.status === 429) {

//                     showAlert(
//                         "Too many login attempts. Please wait a moment and try again."
//                     );

//                     return;
//                 }


//                 if (
//                     error.status === 401 ||
//                     error.status === 403
//                 ) {

//                     showAlert(
//                         "Invalid username or password."
//                     );

//                     return;
//                 }


//                 if (error.status === 422) {

//                     showAlert(
//                         error.message ||
//                         "Please check the username and password."
//                     );

//                     return;
//                 }


//                 if (
//                     error instanceof TypeError ||
//                     (
//                         error.message &&
//                         error.message
//                             .toLowerCase()
//                             .includes(
//                                 "failed to fetch"
//                             )
//                     )
//                 ) {

//                     showAlert(
//                         "Unable to connect to the server. Please make sure the backend is running."
//                     );

//                     return;
//                 }


//                 showAlert(
//                     error.message ||
//                     "Unable to sign in. Please try again."
//                 );
//             }


//             finally {

//                 setLoading(false);
//             }
//         }
//     );


//     /* =========================================
//        USERNAME INPUT
//     ========================================= */

//     usernameInput.addEventListener(
//         "input",
//         function () {

//             usernameInput.classList.remove(
//                 "input-error"
//             );

//             if (usernameError) {
//                 usernameError.textContent = "";
//             }

//             hideAlert();
//         }
//     );


//     /* =========================================
//        PASSWORD INPUT
//     ========================================= */

//     passwordInput.addEventListener(
//         "input",
//         function () {

//             passwordInput.classList.remove(
//                 "input-error"
//             );

//             if (passwordError) {
//                 passwordError.textContent = "";
//             }

//             hideAlert();
//         }
//     );


//     /* =========================================
//        START SESSION CHECK
//     ========================================= */

//     checkExistingSession();

// });





































document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       DOM ELEMENTS
    ========================================= */

    const loginForm =
        document.getElementById("loginForm");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const usernameError =
        document.getElementById("usernameError");

    const passwordError =
        document.getElementById("passwordError");

    const loginAlert =
        document.getElementById("loginAlert");

    const loginAlertMessage =
        document.getElementById("loginAlertMessage");

    const loginButton =
        document.getElementById("loginButton");

    const loginButtonText =
        document.getElementById("loginButtonText");

    const buttonLoader =
        document.getElementById("buttonLoader");

    const passwordToggle =
        document.getElementById("passwordToggle");


    /* =========================================
       SAFETY CHECK
    ========================================= */

    if (
        !loginForm ||
        !usernameInput ||
        !passwordInput
    ) {

        console.error(
            "Admin login form elements not found."
        );

        return;
    }


    /* =========================================
       CLEAR ADMIN SESSION
    ========================================= */

    function clearSession() {

        localStorage.removeItem(
            APP_CONFIG.ADMIN_TOKEN_KEY
        );

        localStorage.removeItem(
            APP_CONFIG.ADMIN_USER_KEY
        );

    }


    /* =========================================
       CHECK EXISTING ADMIN SESSION
    ========================================= */

    async function checkExistingSession() {

        const existingToken =
            localStorage.getItem(
                APP_CONFIG.ADMIN_TOKEN_KEY
            );


        /* No admin token */

        if (!existingToken) {

            return;

        }


        try {

            /*
             * apiRequest() automatically uses
             * the ADMIN token on the admin portal.
             */

            const user =
                await apiRequest(
                    "/api/auth/me"
                );


            /*
             * Only ADMIN can enter
             * the admin dashboard.
             */

            if (
                user &&
                String(
                    user.role || ""
                ).toUpperCase() === "ADMIN"
            ) {

                window.location.href =
                    "index.html";

                return;

            }


            /*
             * If the token belongs to an
             * employee, remove only the
             * admin session.
             */

            clearSession();

        }

        catch (error) {

            console.log(
                "Existing admin session is invalid."
            );

            clearSession();

        }

    }


    /* =========================================
       PASSWORD SHOW / HIDE
    ========================================= */

    if (passwordToggle) {

        passwordToggle.addEventListener(
            "click",
            function () {

                if (
                    passwordInput.type ===
                    "password"
                ) {

                    passwordInput.type =
                        "text";

                    passwordToggle.textContent =
                        "Hide";

                    passwordToggle.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                }

                else {

                    passwordInput.type =
                        "password";

                    passwordToggle.textContent =
                        "Show";

                    passwordToggle.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }


    /* =========================================
       CLEAR ERRORS
    ========================================= */

    function clearErrors() {

        if (usernameError) {

            usernameError.textContent =
                "";

        }


        if (passwordError) {

            passwordError.textContent =
                "";

        }


        usernameInput.classList.remove(
            "input-error"
        );

        passwordInput.classList.remove(
            "input-error"
        );

    }


    /* =========================================
       HIDE ALERT
    ========================================= */

    function hideAlert() {

        if (loginAlert) {

            loginAlert.classList.remove(
                "show"
            );

        }

    }


    /* =========================================
       SHOW ALERT
    ========================================= */

    function showAlert(message) {

        if (
            !loginAlert ||
            !loginAlertMessage
        ) {

            console.error(message);

            return;

        }


        loginAlertMessage.textContent =
            String(message);

        loginAlert.classList.add(
            "show"
        );

    }


    /* =========================================
       FORM VALIDATION
    ========================================= */

    function validateForm() {

        clearErrors();

        let valid = true;


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        /* Username */

        if (!username) {

            if (usernameError) {

                usernameError.textContent =
                    "Please enter your username.";

            }


            usernameInput.classList.add(
                "input-error"
            );

            valid = false;

        }


        /* Password */

        if (!password) {

            if (passwordError) {

                passwordError.textContent =
                    "Please enter your password.";

            }


            passwordInput.classList.add(
                "input-error"
            );

            valid = false;

        }


        return valid;

    }


    /* =========================================
       LOADING STATE
    ========================================= */

    function setLoading(isLoading) {

        if (loginButton) {

            loginButton.disabled =
                isLoading;

        }


        if (isLoading) {

            if (loginButtonText) {

                loginButtonText.textContent =
                    "Signing in...";

            }


            if (buttonLoader) {

                buttonLoader.classList.add(
                    "active"
                );

            }

        }

        else {

            if (loginButtonText) {

                loginButtonText.textContent =
                    "Sign in";

            }


            if (buttonLoader) {

                buttonLoader.classList.remove(
                    "active"
                );

            }

        }

    }


    /* =========================================
       ADMIN LOGIN
    ========================================= */

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            clearErrors();

            hideAlert();


            /* Validate */

            if (!validateForm()) {

                return;

            }


            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;


            setLoading(true);


            try {

                /* =================================
                   CALL BACKEND LOGIN
                ================================= */

                const data =
                    await login(
                        username,
                        password
                    );


                /* =================================
                   CHECK RESPONSE
                ================================= */

                if (
                    !data ||
                    !data.access_token
                ) {

                    throw new Error(
                        "No access token was returned."
                    );

                }


                /* =================================
                   CHECK ROLE
                ================================= */

                const userRole =
                    String(
                        data.role || ""
                    ).toUpperCase();


                /*
                 * Employee credentials are not
                 * allowed in the admin portal.
                 */

                if (
                    userRole !==
                    "ADMIN"
                ) {

                    /*
                     * Clear ONLY admin session.
                     *
                     * Employee session remains
                     * untouched.
                     */

                    localStorage.removeItem(
                        APP_CONFIG.ADMIN_TOKEN_KEY
                    );

                    localStorage.removeItem(
                        APP_CONFIG.ADMIN_USER_KEY
                    );


                    showAlert(
                        "This account does not have administrator access."
                    );


                    return;

                }


                /* =================================
                   SAVE ADMIN TOKEN
                ================================= */

                localStorage.setItem(
                    APP_CONFIG.ADMIN_TOKEN_KEY,
                    data.access_token
                );


                /* =================================
                   SAVE ADMIN USER
                ================================= */

                const currentUser = {

                    id:
                        data.user_id,

                    username:
                        data.username ||
                        username,

                    role:
                        data.role,

                    is_active:
                        true

                };


                localStorage.setItem(
                    APP_CONFIG.ADMIN_USER_KEY,
                    JSON.stringify(
                        currentUser
                    )
                );


                /* =================================
                   ADMIN DASHBOARD
                ================================= */

                window.location.href =
                    "index.html";

            }


            /* =====================================
               ERROR HANDLING
            ===================================== */

            catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                /* Rate limit */

                if (
                    error.status ===
                    429
                ) {

                    showAlert(
                        "Too many login attempts. Please wait a moment and try again."
                    );

                    return;

                }


                /* Unauthorized */

                if (
                    error.status === 401 ||
                    error.status === 403
                ) {

                    showAlert(
                        "Invalid username or password."
                    );

                    return;

                }


                /* Validation */

                if (
                    error.status === 422
                ) {

                    showAlert(
                        error.message ||
                        "Please check the username and password."
                    );

                    return;

                }


                /* Network */

                if (
                    error.status === 0 ||
                    error instanceof TypeError ||
                    (
                        error.message &&
                        error.message
                            .toLowerCase()
                            .includes(
                                "failed to fetch"
                            )
                    )
                ) {

                    showAlert(
                        "Unable to connect to the server. Please make sure the backend is running."
                    );

                    return;

                }


                /* Other errors */

                showAlert(
                    error.message ||
                    "Unable to sign in. Please try again."
                );

            }


            finally {

                setLoading(false);

            }

        }
    );


    /* =========================================
       USERNAME INPUT
    ========================================= */

    usernameInput.addEventListener(
        "input",
        function () {

            usernameInput.classList.remove(
                "input-error"
            );


            if (usernameError) {

                usernameError.textContent =
                    "";

            }


            hideAlert();

        }
    );


    /* =========================================
       PASSWORD INPUT
    ========================================= */

    passwordInput.addEventListener(
        "input",
        function () {

            passwordInput.classList.remove(
                "input-error"
            );


            if (passwordError) {

                passwordError.textContent =
                    "";

            }


            hideAlert();

        }
    );


    /* =========================================
       START ADMIN SESSION CHECK
    ========================================= */

    checkExistingSession();

});