/* ==========================================================
   ATLURI ASCEND™
   EMPLOYEE QR SCANNER
========================================================== */

document.addEventListener("DOMContentLoaded", () => {


    /* ======================================================
       ELEMENTS
    ====================================================== */

    const video =
        document.getElementById("scannerVideo");

    const cameraPlaceholder =
        document.getElementById("cameraPlaceholder");

    const cameraStatus =
        document.getElementById("cameraStatus");

    const scanFrame =
        document.getElementById("scanFrame");

    const scannerLiveStatus =
        document.getElementById("scannerLiveStatus");

    const startButton =
        document.getElementById("startScannerButton");

    const stopButton =
        document.getElementById("stopScannerButton");

    const manualToken =
        document.getElementById("manualQrToken");

    const validateManualButton =
        document.getElementById("validateManualButton");


    const actionHeading =
        document.getElementById("actionHeading");

    const actionMessage =
        document.getElementById("actionMessage");

    const actionStatusText =
        document.getElementById("actionStatusText");

    const actionStatusDot =
        document.getElementById("actionStatusDot");


    const resultOverlay =
        document.getElementById("scanResultOverlay");

    const resultIcon =
        document.getElementById("resultIcon");

    const resultLabel =
        document.getElementById("resultLabel");

    const resultTitle =
        document.getElementById("resultTitle");

    const resultMessage =
        document.getElementById("resultMessage");

    const resultDate =
        document.getElementById("resultDate");

    const resultTime =
        document.getElementById("resultTime");

    const resultCloseButton =
        document.getElementById("resultCloseButton");


    const currentDate =
        document.getElementById("currentDate");

    const currentUsername =
        document.getElementById("currentUsername");

    const employeeAvatar =
        document.getElementById("employeeAvatar");


    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const employeeSidebar =
        document.getElementById("employeeSidebar");

    const logoutButton =
        document.getElementById("logoutButton");


    /* ======================================================
       STATE
    ====================================================== */

    let mediaStream = null;

    let animationFrameId = null;

    let scanning = false;

    let processingQr = false;

    let canvas = null;

    let canvasContext = null;


    /* ======================================================
       CURRENT DATE
    ====================================================== */

    function setCurrentDate() {

        currentDate.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    /* ======================================================
       LOAD CURRENT USER
    ====================================================== */

    function loadUser() {

        try {

            const storedUser =
                localStorage.getItem(
                    APP_CONFIG.USER_KEY
                );


            if (!storedUser) {
                return;
            }


            const user =
                JSON.parse(storedUser);


            const username =
                user.username ||
                user.name ||
                "Employee";


            currentUsername.textContent =
                username;


            employeeAvatar.textContent =
                username
                    .charAt(0)
                    .toUpperCase();

        }
        catch (error) {

            console.error(
                "Unable to load employee:",
                error
            );

        }

    }


    /* ======================================================
       MOBILE MENU
    ====================================================== */

    mobileMenuButton.addEventListener(
        "click",
        () => {

            employeeSidebar.classList.toggle(
                "mobile-open"
            );

        }
    );


    /* ======================================================
       LOGOUT
    ====================================================== */

    logoutButton.addEventListener(
        "click",
        () => {

            if (
                typeof logout === "function"
            ) {

                logout();

            }
            else {

                localStorage.removeItem(
                    APP_CONFIG.TOKEN_KEY
                );

                localStorage.removeItem(
                    APP_CONFIG.USER_KEY
                );

                window.location.href =
                    "../login.html";

            }

        }
    );


    /* ======================================================
       STATUS
    ====================================================== */

    function setScannerStatus(
        heading,
        message,
        status,
        active = false
    ) {

        actionHeading.textContent =
            heading;

        actionMessage.textContent =
            message;

        actionStatusText.textContent =
            status;


        actionStatusDot.style.background =
            active
                ? "#75947d"
                : "#a8988d";


        if (scannerLiveStatus) {

            const dot =
                scannerLiveStatus.querySelector(
                    "span"
                );

            if (dot) {

                dot.style.background =
                    active
                        ? "#75947d"
                        : "#8b9f8d";

            }

        }

    }


    /* ======================================================
       START CAMERA
    ====================================================== */

    async function startCamera() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            setScannerStatus(
                "Camera Unavailable",
                "Your browser does not support camera access.",
                "Unavailable"
            );

            return;

        }


        try {

            setScannerStatus(
                "Starting Camera",
                "Requesting camera access...",
                "Starting..."
            );


            mediaStream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        video: {
                            facingMode: {
                                ideal: "environment"
                            }
                        },
                        audio: false
                    }
                );


            video.srcObject =
                mediaStream;


            await video.play();


            cameraPlaceholder.classList.add(
                "hidden"
            );


            scanFrame.classList.remove(
                "hidden"
            );


            cameraStatus.textContent =
                "Scanning for QR code...";


            startButton.hidden =
                true;


            stopButton.hidden =
                false;


            scanning =
                true;


            processingQr =
                false;


            setScannerStatus(
                "Ready to Scan",
                "Position the entrance QR code inside the frame.",
                "Scanning",
                true
            );


            createCanvas();

            scanQrFrame();

        }
        catch (error) {

            console.error(
                "Camera error:",
                error
            );


            cameraStatus.textContent =
                "Camera access denied";


            setScannerStatus(
                "Camera Access Required",
                "Please allow camera permission and try again.",
                "Permission Required"
            );

        }

    }


    /* ======================================================
       CREATE CANVAS
    ====================================================== */

    function createCanvas() {

        if (!canvas) {

            canvas =
                document.createElement(
                    "canvas"
                );


            canvasContext =
                canvas.getContext(
                    "2d",
                    {
                        willReadFrequently: true
                    }
                );

        }

    }


    /* ======================================================
       SCAN CAMERA FRAME
    ====================================================== */

    function scanQrFrame() {

        if (
            !scanning ||
            processingQr
        ) {

            return;

        }


        if (
            video.readyState >=
            HTMLMediaElement.HAVE_ENOUGH_DATA
        ) {

            const width =
                video.videoWidth;

            const height =
                video.videoHeight;


            if (
                width > 0 &&
                height > 0
            ) {

                canvas.width =
                    width;

                canvas.height =
                    height;


                canvasContext.drawImage(
                    video,
                    0,
                    0,
                    width,
                    height
                );


                const imageData =
                    canvasContext.getImageData(
                        0,
                        0,
                        width,
                        height
                    );


                if (
                    typeof jsQR ===
                    "function"
                ) {

                    const qrCode =
                        jsQR(
                            imageData.data,
                            imageData.width,
                            imageData.height
                        );


                    if (
                        qrCode &&
                        qrCode.data
                    ) {

                        handleQrToken(
                            qrCode.data
                        );

                        return;

                    }

                }

            }

        }


        animationFrameId =
            requestAnimationFrame(
                scanQrFrame
            );

    }


    /* ======================================================
       HANDLE QR TOKEN
    ====================================================== */

    async function handleQrToken(token) {

        if (processingQr) {
            return;
        }


        if (!token) {
            return;
        }


        processingQr =
            true;


        stopCamera();


        setScannerStatus(
            "QR Detected",
            "Validating the QR code with the server...",
            "Validating",
            true
        );


        try {

            /* ----------------------------------------------
               STEP 1
               VALIDATE QR
            ---------------------------------------------- */

            const validation =
                await apiRequest(
                    "/api/qr/validate",
                    {
                        method: "POST",

                        body: JSON.stringify(
                            {
                                qr_token: token
                            }
                        )
                    }
                );


            if (
                !validation.valid
            ) {

                showResult(
                    false,
                    "Invalid QR Code",
                    validation.message ||
                    "This QR code cannot be used.",
                    null,
                    null
                );


                setScannerStatus(
                    "Invalid QR",
                    validation.message ||
                    "The QR code is invalid or expired.",
                    "Invalid"
                );


                return;

            }


            /* ----------------------------------------------
               STEP 2
               GET TODAY'S ATTENDANCE
            ---------------------------------------------- */

            const records =
                await apiRequest(
                    "/api/attendance/my-attendance"
                );


            const today =
                getLocalDate();


            const todayRecord =
                Array.isArray(records)
                    ? records.find(
                        record =>
                            String(
                                record.attendance_date
                            ) === today
                    )
                    : null;


            /* ----------------------------------------------
               STEP 3
               DETERMINE CHECK-IN / CHECK-OUT
            ---------------------------------------------- */

            if (
                todayRecord &&
                String(
                    todayRecord.status
                ).toUpperCase() ===
                "INSIDE"
            ) {

                await performCheckOut(
                    token
                );

            }
            else {

                await performCheckIn(
                    token
                );

            }

        }
        catch (error) {

            console.error(
                "QR attendance error:",
                error
            );


            showResult(
                false,
                "Attendance Failed",
                error.message ||
                "Unable to process attendance.",
                null,
                null
            );


            setScannerStatus(
                "Action Failed",
                error.message ||
                "Unable to process attendance.",
                "Error"
            );

        }
        finally {

            processingQr =
                false;

        }

    }


    /* ======================================================
       CHECK IN
    ====================================================== */

    async function performCheckIn(
        token
    ) {

        setScannerStatus(
            "Checking In",
            "Recording your check-in...",
            "Processing",
            true
        );


        const response =
            await apiRequest(
                "/api/attendance/check-in",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            qr_token: token
                        }
                    )
                }
            );


        const attendance =
            extractAttendance(
                response
            );


        showResult(
            true,
            "Check-In Successful",
            response.message ||
            "Your attendance has been recorded successfully.",
            getAttendanceTime(
                attendance,
                "check_in"
            ),
            getAttendanceDate(
                attendance
            )
        );


        setScannerStatus(
            "Check-In Complete",
            "Your attendance has been recorded.",
            "Completed",
            true
        );

    }


    /* ======================================================
       CHECK OUT
    ====================================================== */

    async function performCheckOut(
        token
    ) {

        setScannerStatus(
            "Checking Out",
            "Recording your check-out...",
            "Processing",
            true
        );


        const response =
            await apiRequest(
                "/api/attendance/check-out",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            qr_token: token
                        }
                    )
                }
            );


        const attendance =
            extractAttendance(
                response
            );


        showResult(
            true,
            "Check-Out Successful",
            response.message ||
            "Your check-out has been recorded successfully.",
            getAttendanceTime(
                attendance,
                "check_out"
            ),
            getAttendanceDate(
                attendance
            )
        );


        setScannerStatus(
            "Check-Out Complete",
            "Your attendance for today has been completed.",
            "Completed",
            true
        );

    }


    /* ======================================================
       EXTRACT ATTENDANCE OBJECT
    ====================================================== */

    function extractAttendance(
        response
    ) {

        if (!response) {
            return {};
        }


        if (
            response.attendance &&
            typeof response.attendance ===
            "object"
        ) {

            return response.attendance;

        }


        if (
            response.data &&
            typeof response.data ===
            "object"
        ) {

            if (
                response.data.attendance
            ) {

                return response.data.attendance;

            }

            return response.data;

        }


        return response;

    }


    /* ======================================================
       GET ATTENDANCE DATE
    ====================================================== */

    function getAttendanceDate(
        attendance
    ) {

        if (!attendance) {
            return null;
        }


        return (
            attendance.attendance_date ||
            attendance.date ||
            null
        );

    }


    /* ======================================================
       GET ATTENDANCE TIME
    ====================================================== */

    function getAttendanceTime(
        attendance,
        field
    ) {

        if (!attendance) {
            return null;
        }


        return (
            attendance[field] ||
            attendance.timestamp ||
            attendance.created_at ||
            null
        );

    }


    /* ======================================================
       LOCAL DATE
    ====================================================== */

    function getLocalDate() {

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


        return `${year}-${month}-${day}`;

    }


    /* ======================================================
       MANUAL TOKEN
    ====================================================== */

    validateManualButton.addEventListener(
        "click",
        async () => {

            const token =
                manualToken.value.trim();


            if (!token) {

                setScannerStatus(
                    "Token Required",
                    "Enter a QR token before validating.",
                    "Waiting"
                );


                manualToken.focus();


                return;

            }


            await handleQrToken(
                token
            );

        }
    );


    manualToken.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                validateManualButton.click();

            }

        }
    );


    /* ======================================================
       STOP CAMERA
    ====================================================== */

    function stopCamera() {

        scanning =
            false;


        if (
            animationFrameId
        ) {

            cancelAnimationFrame(
                animationFrameId
            );


            animationFrameId =
                null;

        }


        if (
            mediaStream
        ) {

            mediaStream
                .getTracks()
                .forEach(
                    track => {
                        track.stop();
                    }
                );


            mediaStream =
                null;

        }


        video.srcObject =
            null;


        startButton.hidden =
            false;


        stopButton.hidden =
            true;


        cameraPlaceholder.classList.remove(
            "hidden"
        );


        scanFrame.classList.add(
            "hidden"
        );


        cameraStatus.textContent =
            "Camera inactive";

    }


    stopButton.addEventListener(
        "click",
        () => {

            stopCamera();


            setScannerStatus(
                "Camera Stopped",
                "Start the camera when you are ready to scan.",
                "Waiting"
            );

        }
    );


    startButton.addEventListener(
        "click",
        () => {

            startCamera();

        }
    );


    /* ======================================================
       RESULT MODAL
    ====================================================== */

    function showResult(
        success,
        title,
        message,
        timestamp,
        date
    ) {

        if (success) {

            resultIcon.className =
                "result-icon success";

            resultIcon.textContent =
                "✓";

            resultLabel.textContent =
                "Attendance Updated";

        }
        else {

            resultIcon.className =
                "result-icon error";

            resultIcon.textContent =
                "!";

            resultLabel.textContent =
                "Attendance Error";

        }


        resultTitle.textContent =
            title;


        resultMessage.textContent =
            message;


        /* ----------------------------------------------
           TIME
        ---------------------------------------------- */

        resultTime.textContent =
            formatTime(
                timestamp
            );


        /* ----------------------------------------------
           DATE
        ---------------------------------------------- */

        resultDate.textContent =
            formatDate(
                date
            );


        resultOverlay.hidden =
            false;

    }


    /* ======================================================
       FORMAT TIME
    ====================================================== */

    function formatTime(
        value
    ) {

        if (!value) {
            return "—";
        }


        const parsed =
            new Date(value);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "—";

        }


        return parsed.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* ======================================================
       FORMAT DATE
    ====================================================== */

    function formatDate(
        value
    ) {

        if (!value) {
            return "—";
        }


        let parsed;


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                String(value)
            )
        ) {

            parsed =
                new Date(
                    `${value}T00:00:00`
                );

        }
        else {

            parsed =
                new Date(value);

        }


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return String(value);

        }


        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* ======================================================
       CLOSE RESULT
    ====================================================== */

    resultCloseButton.addEventListener(
        "click",
        () => {

            resultOverlay.hidden =
                true;


            /*
             * Do not force navigation to dashboard here.
             * The scanner can be used again immediately.
             */

            setScannerStatus(
                "Ready to Scan",
                "Start the camera when you are ready for another attendance action.",
                "Waiting"
            );

        }
    );


    /* ======================================================
       INITIALIZE
    ====================================================== */

    setCurrentDate();

    loadUser();


    setScannerStatus(
        "Ready to Scan",
        "Start the camera and scan the entrance QR code.",
        "Waiting"
    );

});