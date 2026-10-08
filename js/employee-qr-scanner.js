// ============================================================
// Atluri ASCEND™
// Employee QR Scanner
// ============================================================

let cameraStream = null;
let scannerRunning = false;
let animationFrameId = null;
let isProcessingScan = false;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        initializeScannerPage();
    }
);


async function initializeScannerPage() {

    if (!requireAuth()) {
        return;
    }

    setupUser();
    setupDate();
    setupEventListeners();

    updateScannerStatus(
        "Ready",
        "ready"
    );
}


// ============================================================
// USER
// ============================================================

function setupUser() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const username =
        user.username || "Employee";


    const usernameElement =
        document.getElementById(
            "currentUsername"
        );

    if (usernameElement) {
        usernameElement.textContent =
            username;
    }


    const avatar =
        document.getElementById(
            "employeeAvatar"
        );

    if (avatar) {
        avatar.textContent =
            getInitials(username);
    }
}


// ============================================================
// DATE
// ============================================================

function setupDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );

    if (!dateElement) {
        return;
    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


// ============================================================
// EVENTS
// ============================================================

function setupEventListeners() {

    const startButton =
        document.getElementById(
            "startCameraButton"
        );


    const stopButton =
        document.getElementById(
            "stopCameraButton"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const sidebar =
        document.getElementById(
            "employeeSidebar"
        );


    const resultCloseButton =
        document.getElementById(
            "resultCloseButton"
        );


    const errorCloseButton =
        document.getElementById(
            "scannerErrorClose"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startCamera
        );
    }


    if (stopButton) {

        stopButton.addEventListener(
            "click",
            stopCamera
        );
    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {
                stopCamera();
                logout();
            }
        );
    }


    if (
        mobileMenuButton &&
        sidebar
    ) {

        mobileMenuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }


    if (resultCloseButton) {

        resultCloseButton.addEventListener(
            "click",
            closeResult
        );
    }


    if (errorCloseButton) {

        errorCloseButton.addEventListener(
            "click",
            hideScannerError
        );
    }
}


// ============================================================
// START CAMERA
// ============================================================

async function startCamera() {

    if (scannerRunning) {
        return;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showScannerError(
            "Camera access is not supported by this browser."
        );

        updateScannerStatus(
            "Unavailable",
            "error"
        );

        return;
    }


    if (
        typeof jsQR === "undefined"
    ) {

        showScannerError(
            "QR scanner library could not be loaded."
        );

        return;
    }


    try {

        hideScannerError();


        cameraStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }
                    },

                    audio: false
                }
            );


        const video =
            document.getElementById(
                "cameraVideo"
            );


        video.srcObject =
            cameraStream;


        await video.play();


        scannerRunning = true;
        isProcessingScan = false;


        showCameraInterface();


        updateScannerStatus(
            "Scanning",
            "scanning"
        );


        updateScannerMessage(
            "Position the QR code inside the frame."
        );


        updateActionState(
            "Scanning for QR code...",
            "normal"
        );


        scanFrame();

    } catch (error) {

        console.error(
            "Camera initialization failed:",
            error
        );


        let message =
            "Unable to access the camera.";


        if (
            error &&
            error.name === "NotAllowedError"
        ) {

            message =
                "Camera permission was denied. Please allow camera access and try again.";

        } else if (
            error &&
            error.name === "NotFoundError"
        ) {

            message =
                "No camera was found on this device.";

        } else if (
            error &&
            error.name === "NotReadableError"
        ) {

            message =
                "The camera is already being used by another application.";
        }


        showScannerError(message);

        updateScannerStatus(
            "Camera Error",
            "error"
        );
    }
}


// ============================================================
// CAMERA UI
// ============================================================

function showCameraInterface() {

    const placeholder =
        document.getElementById(
            "cameraPlaceholder"
        );


    const frame =
        document.getElementById(
            "scannerFrame"
        );


    const stopButton =
        document.getElementById(
            "stopCameraButton"
        );


    if (placeholder) {
        placeholder.hidden = true;
    }


    if (frame) {
        frame.hidden = false;
    }


    if (stopButton) {
        stopButton.hidden = false;
    }
}


// ============================================================
// SCAN LOOP
// ============================================================

function scanFrame() {

    if (!scannerRunning) {
        return;
    }


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (
        !video ||
        video.readyState <
            HTMLMediaElement.HAVE_ENOUGH_DATA
    ) {

        animationFrameId =
            requestAnimationFrame(
                scanFrame
            );

        return;
    }


    const canvas =
        document.createElement("canvas");


    const context =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    if (!context) {

        showScannerError(
            "Unable to initialize the QR scanner."
        );

        stopCamera();

        return;
    }


    canvas.width =
        video.videoWidth;


    canvas.height =
        video.videoHeight;


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const imageData =
        context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );


    const code =
        jsQR(
            imageData.data,
            imageData.width,
            imageData.height,
            {
                inversionAttempts:
                    "dontInvert"
            }
        );


    if (
        code &&
        code.data &&
        !isProcessingScan
    ) {

        handleQrDetected(
            code.data
        );

        return;
    }


    animationFrameId =
        requestAnimationFrame(
            scanFrame
        );
}


// ============================================================
// QR DETECTED
// ============================================================

async function handleQrDetected(
    qrToken
) {

    if (isProcessingScan) {
        return;
    }


    isProcessingScan = true;


    updateScannerStatus(
        "Validating",
        "scanning"
    );


    updateScannerMessage(
        "QR detected. Validating..."
    );


    updateActionState(
        "Validating QR code...",
        "normal"
    );


    try {

        const validation =
            await validateQrToken(
                qrToken
            );


        if (!validation.valid) {

            throw new Error(
                validation.message ||
                "This QR code is invalid or expired."
            );
        }


        updateScannerMessage(
            "QR verified. Recording attendance..."
        );


        updateActionState(
            "QR verified. Recording attendance...",
            "normal"
        );


        /*
         * The backend determines whether the employee
         * should check in or check out.
         *
         * We first try check-in.
         *
         * If an open attendance record already exists,
         * the backend should reject check-in.
         *
         * Then we attempt check-out.
         */

        const result =
            await processAttendance(
                qrToken
            );


        stopCamera();


        showAttendanceResult(
            result,
            validation
        );

    } catch (error) {

        console.error(
            "QR attendance processing failed:",
            error
        );


        stopCamera();


        showAttendanceError(
            error.message ||
            "Unable to record attendance."
        );

    } finally {

        isProcessingScan = false;
    }
}


// ============================================================
// VALIDATE QR
// ============================================================

async function validateQrToken(
    qrToken
) {

    return apiRequest(
        "/api/qr/validate",
        {
            method: "POST",

            body: JSON.stringify({
                qr_token: qrToken
            })
        }
    );
}


// ============================================================
// PROCESS ATTENDANCE
// ============================================================

async function processAttendance(
    qrToken
) {

    /*
     * Try check-in first.
     */

    try {

        return await apiRequest(
            "/api/attendance/check-in",
            {
                method: "POST",

                body: JSON.stringify({
                    qr_token: qrToken
                })
            }
        );

    } catch (checkInError) {

        /*
         * If check-in fails because the employee
         * is already checked in, try check-out.
         *
         * Other errors should still be surfaced.
         */

        const message =
            String(
                checkInError.message ||
                ""
            ).toLowerCase();


        const shouldTryCheckout =
            message.includes("already") ||
            message.includes("inside") ||
            message.includes("check-in");


        if (!shouldTryCheckout) {
            throw checkInError;
        }


        return await apiRequest(
            "/api/attendance/check-out",
            {
                method: "POST",

                body: JSON.stringify({
                    qr_token: qrToken
                })
            }
        );
    }
}


// ============================================================
// SHOW SUCCESS
// ============================================================

function showAttendanceResult(
    result,
    validation
) {

    const overlay =
        document.getElementById(
            "resultOverlay"
        );


    const icon =
        document.getElementById(
            "resultIcon"
        );


    const label =
        document.getElementById(
            "resultLabel"
        );


    const title =
        document.getElementById(
            "resultTitle"
        );


    const message =
        document.getElementById(
            "resultMessage"
        );


    const time =
        document.getElementById(
            "resultTime"
        );


    const location =
        document.getElementById(
            "resultLocation"
        );


    if (!overlay) {
        return;
    }


    icon.classList.remove(
        "error"
    );


    icon.textContent =
        "✓";


    const attendanceType =
        detectAttendanceType(
            result
        );


    if (
        attendanceType === "CHECK_OUT"
    ) {

        label.textContent =
            "Check-out";

        title.textContent =
            "Check-out successful";

    } else {

        label.textContent =
            "Check-in";

        title.textContent =
            "Check-in successful";
    }


    message.textContent =
        getAttendanceMessage(
            result,
            attendanceType
        );


    time.textContent =
        getResultTime(
            result
        );


    location.textContent =
        validation.location ||
        result.location ||
        "Main Entrance";


    overlay.hidden = false;


    updateActionState(
        "Attendance recorded successfully.",
        "success"
    );
}


// ============================================================
// DETECT ATTENDANCE TYPE
// ============================================================

function detectAttendanceType(
    result
) {

    if (!result) {
        return "CHECK_IN";
    }


    const status =
        String(
            result.status ||
            result.attendance_status ||
            ""
        ).toUpperCase();


    if (
        status === "OUTSIDE" ||
        status.includes("CHECK_OUT")
    ) {

        return "CHECK_OUT";
    }


    if (
        result.check_out &&
        !result.check_in
    ) {

        return "CHECK_OUT";
    }


    /*
     * Most check-in responses contain
     * check_in and INSIDE status.
     */

    return "CHECK_IN";
}


// ============================================================
// ATTENDANCE MESSAGE
// ============================================================

function getAttendanceMessage(
    result,
    attendanceType
) {

    if (
        result &&
        result.message
    ) {
        return result.message;
    }


    if (
        attendanceType === "CHECK_OUT"
    ) {

        return (
            "Your check-out has been recorded successfully."
        );
    }


    return (
        "Your check-in has been recorded successfully."
    );
}


// ============================================================
// RESULT TIME
// ============================================================

function getResultTime(
    result
) {

    if (!result) {
        return getCurrentTime();
    }


    const attendanceType =
        detectAttendanceType(
            result
        );


    if (
        attendanceType === "CHECK_OUT"
    ) {

        return formatTime(
            result.check_out ||
            result.checkout ||
            result.timestamp
        );
    }


    return formatTime(
        result.check_in ||
        result.checkin ||
        result.timestamp
    );
}


// ============================================================
// ERROR RESULT
// ============================================================

function showAttendanceError(
    message
) {

    const overlay =
        document.getElementById(
            "resultOverlay"
        );


    const icon =
        document.getElementById(
            "resultIcon"
        );


    const label =
        document.getElementById(
            "resultLabel"
        );


    const title =
        document.getElementById(
            "resultTitle"
        );


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (!overlay) {
        return;
    }


    icon.classList.add(
        "error"
    );


    icon.textContent =
        "!";


    label.textContent =
        "Attendance";


    title.textContent =
        "Attendance not recorded";


    resultMessage.textContent =
        message;


    updateText(
        "resultTime",
        "—"
    );


    updateText(
        "resultLocation",
        "—"
    );


    overlay.hidden = false;


    updateActionState(
        "Attendance could not be recorded.",
        "error"
    );
}


// ============================================================
// CLOSE RESULT
// ============================================================

function closeResult() {

    const overlay =
        document.getElementById(
            "resultOverlay"
        );


    if (overlay) {
        overlay.hidden = true;
    }


    const icon =
        document.getElementById(
            "resultIcon"
        );


    if (icon) {
        icon.classList.remove(
            "error"
        );
    }


    updateScannerStatus(
        "Ready",
        "ready"
    );


    updateScannerMessage(
        "Start the camera to scan again."
    );


    updateActionState(
        "Waiting for scan",
        "normal"
    );
}


// ============================================================
// STOP CAMERA
// ============================================================

function stopCamera() {

    scannerRunning = false;


    if (animationFrameId) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function (track) {
                track.stop();
            });

        cameraStream = null;
    }


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (video) {
        video.srcObject = null;
    }


    const placeholder =
        document.getElementById(
            "cameraPlaceholder"
        );


    const frame =
        document.getElementById(
            "scannerFrame"
        );


    const stopButton =
        document.getElementById(
            "stopCameraButton"
        );


    if (placeholder) {
        placeholder.hidden = false;
    }


    if (frame) {
        frame.hidden = true;
    }


    if (stopButton) {
        stopButton.hidden = true;
    }


    updateScannerStatus(
        "Ready",
        "ready"
    );
}


// ============================================================
// SCANNER STATUS
// ============================================================

function updateScannerStatus(
    text,
    className
) {

    const element =
        document.getElementById(
            "scannerStatus"
        );


    if (!element) {
        return;
    }


    element.textContent =
        text;


    element.classList.remove(
        "ready",
        "scanning",
        "error"
    );


    if (className) {
        element.classList.add(
            className
        );
    }
}


// ============================================================
// SCANNER MESSAGE
// ============================================================

function updateScannerMessage(
    message
) {

    const element =
        document.getElementById(
            "scannerMessage"
        );


    if (element) {
        element.textContent =
            message;
    }
}


// ============================================================
// ACTION STATE
// ============================================================

function updateActionState(
    message,
    type
) {

    const container =
        document.getElementById(
            "actionState"
        );


    const text =
        document.getElementById(
            "actionStateText"
        );


    if (text) {
        text.textContent =
            message;
    }


    if (!container) {
        return;
    }


    container.classList.remove(
        "success",
        "error"
    );


    if (type === "success") {
        container.classList.add(
            "success"
        );
    }


    if (type === "error") {
        container.classList.add(
            "error"
        );
    }
}


// ============================================================
// SCANNER ERROR
// ============================================================

function showScannerError(
    message
) {

    const errorBox =
        document.getElementById(
            "scannerError"
        );


    const errorMessage =
        document.getElementById(
            "scannerErrorMessage"
        );


    if (errorMessage) {
        errorMessage.textContent =
            message;
    }


    if (errorBox) {
        errorBox.hidden = false;
    }
}


function hideScannerError() {

    const errorBox =
        document.getElementById(
            "scannerError"
        );


    if (errorBox) {
        errorBox.hidden = true;
    }
}


// ============================================================
// CURRENT TIME
// ============================================================

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(
    value
) {

    if (!value) {
        return getCurrentTime();
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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
// INITIALS
// ============================================================

function getInitials(
    name
) {

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