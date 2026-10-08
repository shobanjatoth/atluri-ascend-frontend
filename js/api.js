



// /* =========================================
//    ATLURI ASCEND™
//    API CLIENT
// ========================================= */


// /* =========================================
//    TOKEN
// ========================================= */

// function getToken() {

//     return localStorage.getItem(
//         APP_CONFIG.TOKEN_KEY
//     );

// }


// /* =========================================
//    ERROR MESSAGE HELPER
// ========================================= */

// function extractApiErrorMessage(errorData) {

//     if (!errorData) {

//         return "Something went wrong.";

//     }


//     /* FastAPI detail as string */

//     if (typeof errorData.detail === "string") {

//         return errorData.detail;

//     }


//     /* FastAPI validation errors */

//     if (Array.isArray(errorData.detail)) {

//         return errorData.detail
//             .map(function (error) {

//                 if (typeof error === "string") {
//                     return error;
//                 }

//                 if (error && error.msg) {
//                     return error.msg;
//                 }

//                 return "Invalid request.";

//             })
//             .join(", ");

//     }


//     /* detail as object */

//     if (
//         errorData.detail &&
//         typeof errorData.detail === "object"
//     ) {

//         if (errorData.detail.message) {

//             return String(
//                 errorData.detail.message
//             );

//         }

//         try {

//             return JSON.stringify(
//                 errorData.detail
//             );

//         } catch (error) {

//             return "Something went wrong.";

//         }

//     }


//     /* Generic message */

//     if (typeof errorData.message === "string") {

//         return errorData.message;

//     }


//     return "Something went wrong.";

// }


// /* =========================================
//    GENERIC API REQUEST
// ========================================= */

// async function apiRequest(
//     endpoint,
//     options = {}
// ) {

//     const token = getToken();

//     const headers = {

//         "Content-Type": "application/json",

//         ...(options.headers || {})

//     };


//     /* Add JWT */

//     if (token) {

//         headers.Authorization =
//             `Bearer ${token}`;

//     }


//     let response;


//     try {

//         response = await fetch(
//             `${APP_CONFIG.API_BASE_URL}${endpoint}`,
//             {
//                 ...options,
//                 headers
//             }
//         );

//     } catch (error) {

//         throw new Error(
//             "Unable to connect to the server. Please make sure the backend is running."
//         );

//     }


//     /* =========================================
//        UNAUTHORIZED
//     ========================================= */

//     if (response.status === 401) {

//         localStorage.removeItem(
//             APP_CONFIG.TOKEN_KEY
//         );

//         localStorage.removeItem(
//             APP_CONFIG.USER_KEY
//         );

//         window.location.href =
//             "/login.html";

//         return;

//     }


//     /* =========================================
//        OTHER API ERRORS
//     ========================================= */

//     if (!response.ok) {

//         let errorData = null;


//         try {

//             errorData =
//                 await response.json();

//         } catch (error) {

//             /* Response was not JSON */

//         }


//         const message =
//             extractApiErrorMessage(
//                 errorData
//             );


//         const apiError =
//             new Error(message);


//         apiError.status =
//             response.status;


//         throw apiError;

//     }


//     /* =========================================
//        SUCCESS RESPONSE
//     ========================================= */

//     if (response.status === 204) {

//         return null;

//     }


//     return response.json();

// }


// /* =========================================
//    AUTH
// ========================================= */

// async function login(
//     username,
//     password
// ) {

//     let response;


//     /* =========================================
//        SEND LOGIN REQUEST
//     ========================================= */

//     try {

//         response = await fetch(
//             `${APP_CONFIG.API_BASE_URL}/api/auth/login`,
//             {
//                 method: "POST",

//                 headers: {
//                     "Content-Type": "application/json"
//                 },

//                 body: JSON.stringify({
//                     username: username,
//                     password: password
//                 })
//             }
//         );

//     } catch (error) {

//         const networkError =
//             new Error(
//                 "Unable to connect to the server. Please make sure the backend is running."
//             );

//         throw networkError;

//     }


//     /* =========================================
//        READ RESPONSE
//     ========================================= */

//     let data = null;

//     try {

//         data =
//             await response.json();

//     } catch (error) {

//         data = null;

//     }


//     /* =========================================
//        HANDLE LOGIN ERROR
//     ========================================= */

//     if (!response.ok) {

//         const message =
//             extractApiErrorMessage(data);


//         const loginError =
//             new Error(message);


//         loginError.status =
//             response.status;


//         throw loginError;

//     }


//     /* =========================================
//        VALIDATE TOKEN
//     ========================================= */

//     if (
//         !data ||
//         !data.access_token
//     ) {

//         const tokenError =
//             new Error(
//                 "Login succeeded but no access token was returned."
//             );


//         tokenError.status =
//             response.status;


//         throw tokenError;

//     }


//     /* =========================================
//        STORE JWT
//     ========================================= */

//     localStorage.setItem(
//         APP_CONFIG.TOKEN_KEY,
//         data.access_token
//     );


//     return data;

// }


// /* =========================================
//    DASHBOARD
// ========================================= */

// async function getDashboard() {

//     return apiRequest(
//         "/api/dashboard"
//     );

// }


// async function getDashboardSummary() {

//     return apiRequest(
//         "/api/dashboard/summary"
//     );

// }


// async function getDepartmentSummary() {

//     return apiRequest(
//         "/api/dashboard/departments"
//     );

// }


// async function getRecentAttendance() {

//     return apiRequest(
//         "/api/dashboard/recent-attendance"
//     );

// }


// /* =========================================
//    EMPLOYEES
// ========================================= */

// async function getEmployees() {

//     return apiRequest(
//         "/api/employees"
//     );

// }


// async function getEmployee(
//     employeeId
// ) {

//     return apiRequest(
//         `/api/employees/${employeeId}`
//     );

// }


// async function createEmployee(
//     employeeData
// ) {

//     return apiRequest(
//         "/api/employees",
//         {
//             method: "POST",

//             body:
//                 JSON.stringify(
//                     employeeData
//                 )
//         }
//     );

// }


// async function updateEmployee(
//     employeeId,
//     employeeData
// ) {

//     return apiRequest(
//         `/api/employees/${employeeId}`,
//         {
//             method: "PUT",

//             body:
//                 JSON.stringify(
//                     employeeData
//                 )
//         }
//     );

// }


// async function deactivateEmployee(
//     employeeId
// ) {

//     return apiRequest(
//         `/api/employees/${employeeId}/deactivate`,
//         {
//             method: "PATCH"
//         }
//     );

// }


// /* =========================================
//    DEPARTMENTS
// ========================================= */

// async function getDepartments() {

//     return apiRequest(
//         "/api/departments"
//     );

// }


// async function createDepartment(
//     departmentData
// ) {

//     return apiRequest(
//         "/api/departments",
//         {
//             method: "POST",

//             body:
//                 JSON.stringify(
//                     departmentData
//                 )
//         }
//     );

// }


// async function updateDepartment(
//     departmentId,
//     departmentData
// ) {

//     return apiRequest(
//         `/api/departments/${departmentId}`,
//         {
//             method: "PUT",

//             body:
//                 JSON.stringify(
//                     departmentData
//                 )
//         }
//     );

// }


// async function deleteDepartment(
//     departmentId
// ) {

//     return apiRequest(
//         `/api/departments/${departmentId}`,
//         {
//             method: "DELETE"
//         }
//     );

// }


// /* =========================================
//    ATTENDANCE
// ========================================= */

// async function getAttendanceHistory() {

//     return apiRequest(
//         "/api/attendance/history"
//     );

// }


// /* =========================================
//    QR
// ========================================= */

// async function generateQr() {

//     return apiRequest(
//         "/api/qr/generate",
//         {
//             method: "POST",

//             body: JSON.stringify({
//                 location: "Main Entrance"
//             })
//         }
//     );

// }


// async function validateQr(
//     qrToken
// ) {

//     return apiRequest(
//         "/api/qr/validate",
//         {
//             method: "POST",

//             body: JSON.stringify({
//                 qr_token: qrToken
//             })
//         }
//     );

// }


// /* =========================================
//    LOGOUT
// ========================================= */

// function logout() {

//     localStorage.removeItem(
//         APP_CONFIG.TOKEN_KEY
//     );

//     localStorage.removeItem(
//         APP_CONFIG.USER_KEY
//     );


//     window.location.href =
//         "/login.html";

// }


// async function getAdminAttendance() {
//     return apiRequest("/api/attendance");
// }




// /* ==========================================
//    EMPLOYEE PROFILE
// ========================================== */

// async function getMyEmployeeProfile() {

//     return await apiRequest(
//         "/api/employees/me"
//     );

// }
























/* =========================================
   ATLURI ASCEND™
   API CLIENT
========================================= */


/* =========================================
   PORTAL DETECTION
========================================= */

function isEmployeePortal() {

    const path =
        window.location.pathname.toLowerCase();

    return path.includes("/employee/");

}


/* =========================================
   TOKEN
========================================= */

function getToken() {

    if (isEmployeePortal()) {

        return localStorage.getItem(
            APP_CONFIG.EMPLOYEE_TOKEN_KEY
        );

    }

    return localStorage.getItem(
        APP_CONFIG.ADMIN_TOKEN_KEY
    );

}


/* =========================================
   USER
========================================= */

function getCurrentUser() {

    if (isEmployeePortal()) {

        const user =
            localStorage.getItem(
                APP_CONFIG.EMPLOYEE_USER_KEY
            );

        if (!user) {
            return null;
        }

        try {

            return JSON.parse(user);

        } catch (error) {

            return null;

        }

    }


    const user =
        localStorage.getItem(
            APP_CONFIG.ADMIN_USER_KEY
        );

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user);

    } catch (error) {

        return null;

    }

}


/* =========================================
   ERROR MESSAGE HELPER
========================================= */

function extractApiErrorMessage(
    errorData
) {

    if (!errorData) {

        return "Something went wrong.";

    }


    /* FastAPI detail as string */

    if (
        typeof errorData.detail ===
        "string"
    ) {

        return errorData.detail;

    }


    /* FastAPI validation errors */

    if (
        Array.isArray(
            errorData.detail
        )
    ) {

        return errorData.detail
            .map(function (error) {

                if (
                    typeof error ===
                    "string"
                ) {

                    return error;

                }


                if (
                    error &&
                    error.msg
                ) {

                    return error.msg;

                }


                return "Invalid request.";

            })
            .join(", ");

    }


    /* detail as object */

    if (
        errorData.detail &&
        typeof errorData.detail ===
        "object"
    ) {

        if (
            errorData.detail.message
        ) {

            return String(
                errorData.detail.message
            );

        }


        try {

            return JSON.stringify(
                errorData.detail
            );

        } catch (error) {

            return "Something went wrong.";

        }

    }


    /* Generic message */

    if (
        typeof errorData.message ===
        "string"
    ) {

        return errorData.message;

    }


    return "Something went wrong.";

}


/* =========================================
   CLEAR CURRENT SESSION
========================================= */

function clearCurrentSession() {

    if (isEmployeePortal()) {

        localStorage.removeItem(
            APP_CONFIG.EMPLOYEE_TOKEN_KEY
        );

        localStorage.removeItem(
            APP_CONFIG.EMPLOYEE_USER_KEY
        );

        return;

    }


    localStorage.removeItem(
        APP_CONFIG.ADMIN_TOKEN_KEY
    );

    localStorage.removeItem(
        APP_CONFIG.ADMIN_USER_KEY
    );

}


/* =========================================
   GENERIC API REQUEST
========================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    /* Add JWT */

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    let response;


    try {

        response =
            await fetch(
                `${APP_CONFIG.API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

    } catch (error) {

        const networkError =
            new Error(
                "Unable to connect to the server. Please make sure the backend is running."
            );

        networkError.status =
            0;

        throw networkError;

    }


    /* =========================================
       UNAUTHORIZED
    ========================================= */

    if (
        response.status ===
        401
    ) {

        clearCurrentSession();


        if (isEmployeePortal()) {

            window.location.href =
                "/employee/login.html";

        } else {

            window.location.href =
                "/login.html";

        }


        return;

    }


    /* =========================================
       OTHER API ERRORS
    ========================================= */

    if (!response.ok) {

        let errorData =
            null;


        try {

            errorData =
                await response.json();

        } catch (error) {

            /* Response was not JSON */

        }


        const message =
            extractApiErrorMessage(
                errorData
            );


        const apiError =
            new Error(
                message
            );


        apiError.status =
            response.status;


        throw apiError;

    }


    /* =========================================
       SUCCESS RESPONSE
    ========================================= */

    if (
        response.status ===
        204
    ) {

        return null;

    }


    return response.json();

}


/* =========================================
   AUTH
========================================= */

async function login(
    username,
    password
) {

    let response;


    /* =========================================
       SEND LOGIN REQUEST
    ========================================= */

    try {

        response =
            await fetch(
                `${APP_CONFIG.API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            username:
                                username,

                            password:
                                password
                        })
                }
            );

    } catch (error) {

        const networkError =
            new Error(
                "Unable to connect to the server. Please make sure the backend is running."
            );

        networkError.status =
            0;

        throw networkError;

    }


    /* =========================================
       READ RESPONSE
    ========================================= */

    let data =
        null;


    try {

        data =
            await response.json();

    } catch (error) {

        data =
            null;

    }


    /* =========================================
       HANDLE LOGIN ERROR
    ========================================= */

    if (!response.ok) {

        const message =
            extractApiErrorMessage(
                data
            );


        const loginError =
            new Error(
                message
            );


        loginError.status =
            response.status;


        throw loginError;

    }


    /* =========================================
       VALIDATE TOKEN
    ========================================= */

    if (
        !data ||
        !data.access_token
    ) {

        const tokenError =
            new Error(
                "Login succeeded but no access token was returned."
            );


        tokenError.status =
            response.status;


        throw tokenError;

    }


    /* =========================================
       DETERMINE ROLE
    ========================================= */

    const role =
        String(
            data.role || ""
        ).toUpperCase();


    /* =========================================
       ADMIN SESSION
    ========================================= */

    if (
        role ===
        "ADMIN"
    ) {

        localStorage.setItem(
            APP_CONFIG.ADMIN_TOKEN_KEY,
            data.access_token
        );


        localStorage.setItem(
            APP_CONFIG.ADMIN_USER_KEY,
            JSON.stringify({
                id:
                    data.user_id,

                username:
                    data.username ||
                    username,

                role:
                    data.role,

                is_active:
                    true
            })
        );

    }


    /* =========================================
       EMPLOYEE SESSION
    ========================================= */

    else if (
        role ===
        "EMPLOYEE"
    ) {

        localStorage.setItem(
            APP_CONFIG.EMPLOYEE_TOKEN_KEY,
            data.access_token
        );


        localStorage.setItem(
            APP_CONFIG.EMPLOYEE_USER_KEY,
            JSON.stringify({
                id:
                    data.user_id,

                username:
                    data.username ||
                    username,

                role:
                    data.role,

                is_active:
                    true
            })
        );

    }


    /* =========================================
       UNKNOWN ROLE
    ========================================= */

    else {

        throw new Error(
            "Unknown user role returned by the server."
        );

    }


    return data;

}


/* =========================================
   DASHBOARD
========================================= */

async function getDashboard() {

    return apiRequest(
        "/api/dashboard"
    );

}


async function getDashboardSummary() {

    return apiRequest(
        "/api/dashboard/summary"
    );

}


async function getDepartmentSummary() {

    return apiRequest(
        "/api/dashboard/departments"
    );

}


async function getRecentAttendance() {

    return apiRequest(
        "/api/dashboard/recent-attendance"
    );

}


/* =========================================
   EMPLOYEES
========================================= */

async function getEmployees() {

    return apiRequest(
        "/api/employees"
    );

}


async function getEmployee(
    employeeId
) {

    return apiRequest(
        `/api/employees/${employeeId}`
    );

}


async function createEmployee(
    employeeData
) {

    return apiRequest(
        "/api/employees",
        {
            method: "POST",

            body:
                JSON.stringify(
                    employeeData
                )
        }
    );

}


async function updateEmployee(
    employeeId,
    employeeData
) {

    return apiRequest(
        `/api/employees/${employeeId}`,
        {
            method: "PUT",

            body:
                JSON.stringify(
                    employeeData
                )
        }
    );

}


async function deactivateEmployee(
    employeeId
) {

    return apiRequest(
        `/api/employees/${employeeId}/deactivate`,
        {
            method: "PATCH"
        }
    );

}


/* =========================================
   DEPARTMENTS
========================================= */

async function getDepartments() {

    return apiRequest(
        "/api/departments"
    );

}


async function createDepartment(
    departmentData
) {

    return apiRequest(
        "/api/departments",
        {
            method: "POST",

            body:
                JSON.stringify(
                    departmentData
                )
        }
    );

}


async function updateDepartment(
    departmentId,
    departmentData
) {

    return apiRequest(
        `/api/departments/${departmentId}`,
        {
            method: "PUT",

            body:
                JSON.stringify(
                    departmentData
                )
        }
    );

}


async function deleteDepartment(
    departmentId
) {

    return apiRequest(
        `/api/departments/${departmentId}`,
        {
            method: "DELETE"
        }
    );

}


/* =========================================
   ATTENDANCE
========================================= */

async function getAttendanceHistory() {

    return apiRequest(
        "/api/attendance/history"
    );

}


async function getAdminAttendance() {

    return apiRequest(
        "/api/attendance"
    );

}


/* =========================================
   QR
========================================= */

async function generateQr() {

    return apiRequest(
        "/api/qr/generate",
        {
            method: "POST",

            body:
                JSON.stringify({
                    location:
                        "Main Entrance"
                })
        }
    );

}


async function validateQr(
    qrToken
) {

    return apiRequest(
        "/api/qr/validate",
        {
            method: "POST",

            body:
                JSON.stringify({
                    qr_token:
                        qrToken
                })
        }
    );

}


/* =========================================
   EMPLOYEE PROFILE
========================================= */

async function getMyEmployeeProfile() {

    return apiRequest(
        "/api/employees/me"
    );

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    if (isEmployeePortal()) {

        localStorage.removeItem(
            APP_CONFIG.EMPLOYEE_TOKEN_KEY
        );

        localStorage.removeItem(
            APP_CONFIG.EMPLOYEE_USER_KEY
        );


        window.location.href =
            "/employee/login.html";

        return;

    }


    /* =========================================
       ADMIN LOGOUT
    ========================================= */

    localStorage.removeItem(
        APP_CONFIG.ADMIN_TOKEN_KEY
    );

    localStorage.removeItem(
        APP_CONFIG.ADMIN_USER_KEY
    );


    window.location.href =
        "/login.html";

}