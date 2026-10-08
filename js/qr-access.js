// ============================================================
// ATLURI ASCEND™
// QR ACCESS PAGE
// ============================================================

let countdownInterval = null;
let currentQrData = null;

const QR_DURATION_SECONDS = 150;


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});


function initializePage() {

    setupMobileMenu();

    setupLogout();

    setupGenerateButton();

    setupCopyButton();

    updateCurrentDate();

    loadCurrentUser();

    generateQrCode();
}


// ============================================================
// MOBILE MENU
// ============================================================

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


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", () => {

        logout();

    });
}


// ============================================================
// GENERATE BUTTON
// ============================================================

function setupGenerateButton() {

    const button = document.getElementById("generateQrButton");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {

        generateQrCode();

    });
}


// ============================================================
// COPY TOKEN BUTTON
// ============================================================

function setupCopyButton() {

    const button = document.getElementById("copyTokenButton");

    if (!button) {
        return;
    }

    button.addEventListener("click", async () => {

        if (!currentQrData || !currentQrData.qr_token) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                currentQrData.qr_token
            );

            const originalText = button.textContent;

            button.textContent = "Copied";

            setTimeout(() => {

                button.textContent = originalText;

            }, 1500);

        } catch (error) {

            console.error("Unable to copy QR token:", error);

        }

    });
}


// ============================================================
// CURRENT DATE
// ============================================================

function updateCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}


// ============================================================
// CURRENT USER
// ============================================================

function loadCurrentUser() {

    const usernameElement =
        document.getElementById("currentUsername");

    if (!usernameElement) {
        return;
    }

    try {

        const storedUser =
            localStorage.getItem(APP_CONFIG.USER_KEY);

        if (!storedUser) {
            return;
        }

        const user = JSON.parse(storedUser);

        if (user.username) {

            usernameElement.textContent =
                user.username;

        }

    } catch (error) {

        console.error(
            "Unable to load current user:",
            error
        );

    }
}


// ============================================================
// GENERATE QR CODE
// ============================================================

async function generateQrCode() {

    clearCountdown();

    showLoadingState();

    setHeaderStatus(
        "Generating...",
        "loading"
    );

    const generateButton =
        document.getElementById("generateQrButton");

    if (generateButton) {

        generateButton.disabled = true;

    }

    try {

        console.log("Generating new QR...");

        const response = await apiRequest(
            "/api/qr/generate",
            {
                method: "POST"
            }
        );

        console.log(
            "QR API response:",
            response
        );

        currentQrData = response;

        // ----------------------------------------------------
        // DISPLAY SESSION INFORMATION
        // ----------------------------------------------------

        displayQrInformation(response);

        // ----------------------------------------------------
        // CREATE QR IMAGE
        // ----------------------------------------------------

        await renderQrCode(
            response.qr_token
        );

        // ----------------------------------------------------
        // START 150 SECOND COUNTDOWN
        // ----------------------------------------------------

        startCountdown();

        // ----------------------------------------------------
        // UPDATE STATUS
        // ----------------------------------------------------

        setHeaderStatus(
            "Active",
            "active"
        );

        const liveBadge =
            document.getElementById("qrLiveBadge");

        if (liveBadge) {

            liveBadge.classList.add("active");

        }

        console.log(
            "QR active for",
            QR_DURATION_SECONDS,
            "seconds"
        );

    } catch (error) {

        console.error(
            "QR generation failed:",
            error
        );

        showQrError(
            error.message ||
            "Unable to generate QR code."
        );

        setHeaderStatus(
            "Error",
            "error"
        );

    } finally {

        if (generateButton) {

            generateButton.disabled = false;

        }

    }
}


// ============================================================
// DISPLAY QR INFORMATION
// ============================================================

function displayQrInformation(data) {

    const sessionId =
        document.getElementById("qrSessionId");

    const location =
        document.getElementById("qrLocation");

    const token =
        document.getElementById("qrToken");

    const copyButton =
        document.getElementById("copyTokenButton");


    // --------------------------------------------------------
    // SESSION ID
    // --------------------------------------------------------

    if (sessionId) {

        sessionId.textContent =
            data.id ?? "—";

    }


    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (location) {

        location.textContent =
            data.location ||
            "Main Entrance";

    }


    // --------------------------------------------------------
    // TOKEN
    // --------------------------------------------------------

    if (token) {

        token.textContent =
            data.qr_token ||
            "No active token";

    }


    // --------------------------------------------------------
    // COPY BUTTON
    // --------------------------------------------------------

    if (copyButton) {

        copyButton.disabled =
            !data.qr_token;

    }
}


// ============================================================
// LOAD QR CODE LIBRARY
// ============================================================

function loadQrLibrary() {

    return new Promise((resolve, reject) => {

        // ----------------------------------------------------
        // ALREADY LOADED
        // ----------------------------------------------------

        if (window.QRCode) {

            resolve();

            return;

        }


        // ----------------------------------------------------
        // CHECK EXISTING SCRIPT
        // ----------------------------------------------------

        const existingScript =
            document.querySelector(
                'script[data-qrcode-library="true"]'
            );

        if (existingScript) {

            existingScript.addEventListener(
                "load",
                () => {

                    if (window.QRCode) {

                        resolve();

                    } else {

                        reject(
                            new Error(
                                "QRCode library unavailable."
                            )
                        );

                    }

                }
            );

            existingScript.addEventListener(
                "error",
                () => {

                    reject(
                        new Error(
                            "Unable to load QR library."
                        )
                    );

                }
            );

            return;

        }


        // ----------------------------------------------------
        // CREATE SCRIPT
        // ----------------------------------------------------

        const script =
            document.createElement("script");

        script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

        script.async = true;

        script.dataset.qrcodeLibrary = "true";


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        script.onload = () => {

            if (window.QRCode) {

                resolve();

            } else {

                reject(
                    new Error(
                        "QRCode library loaded but unavailable."
                    )
                );

            }

        };


        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        script.onerror = () => {

            reject(
                new Error(
                    "Unable to load QR code library."
                )
            );

        };


        document.head.appendChild(script);

    });
}


// ============================================================
// RENDER QR CODE
// ============================================================

async function renderQrCode(token) {

    const qrFrame =
        document.getElementById("qrCodeFrame");

    const qrImage =
        document.getElementById("qrCodeImage");

    const loading =
        document.getElementById("qrLoading");

    const expiredOverlay =
        document.getElementById(
            "qrExpiredOverlay"
        );


    if (!qrFrame) {
        return;
    }


    try {

        // ----------------------------------------------------
        // LOAD QR LIBRARY
        // ----------------------------------------------------

        await loadQrLibrary();


        // ----------------------------------------------------
        // REMOVE OLD QR
        // ----------------------------------------------------

        const oldQr =
            qrFrame.querySelector(
                ".generated-qr"
            );

        if (oldQr) {

            oldQr.remove();

        }


        // ----------------------------------------------------
        // CREATE QR CONTAINER
        // ----------------------------------------------------

        const qrContainer =
            document.createElement("div");

        qrContainer.className =
            "generated-qr";

        qrContainer.style.width =
            "260px";

        qrContainer.style.height =
            "260px";

        qrContainer.style.display =
            "flex";

        qrContainer.style.alignItems =
            "center";

        qrContainer.style.justifyContent =
            "center";


        qrFrame.appendChild(
            qrContainer
        );


        // ----------------------------------------------------
        // GENERATE QR
        // ----------------------------------------------------

        new QRCode(
            qrContainer,
            {
                text: token,

                width: 240,

                height: 240,

                correctLevel:
                    QRCode.CorrectLevel.M
            }
        );


        // ----------------------------------------------------
        // HIDE LOADING
        // ----------------------------------------------------

        if (loading) {

            loading.hidden = true;

        }


        // ----------------------------------------------------
        // HIDE OLD IMAGE
        // ----------------------------------------------------

        if (qrImage) {

            qrImage.hidden = true;

        }


        // ----------------------------------------------------
        // HIDE EXPIRED OVERLAY
        // ----------------------------------------------------

        if (expiredOverlay) {

            expiredOverlay.hidden = true;

        }


        console.log(
            "QR image generated successfully."
        );

    } catch (error) {

        console.error(
            "QR rendering failed:",
            error
        );

        showQrError(
            "QR was generated but could not be displayed."
        );

    }
}


// ============================================================
// COUNTDOWN
// ============================================================

function startCountdown() {

    // --------------------------------------------------------
    // CLEAR OLD TIMER
    // --------------------------------------------------------

    clearCountdown();


    // --------------------------------------------------------
    // ALWAYS START FROM 150 SECONDS
    // --------------------------------------------------------

    let remainingSeconds =
        QR_DURATION_SECONDS;


    console.log(
        "Countdown started:",
        remainingSeconds,
        "seconds"
    );


    // --------------------------------------------------------
    // SHOW INITIAL TIME
    // --------------------------------------------------------

    updateCountdownTextFromSeconds(
        remainingSeconds
    );


    // --------------------------------------------------------
    // START TIMER
    // --------------------------------------------------------

    countdownInterval =
        setInterval(() => {

            remainingSeconds--;


            // ------------------------------------------------
            // QR EXPIRED
            // ------------------------------------------------

            if (remainingSeconds <= 0) {

                clearCountdown();

                updateCountdownText(
                    "00:00"
                );

                expireQrCode();

                return;

            }


            // ------------------------------------------------
            // UPDATE TIMER
            // ------------------------------------------------

            updateCountdownTextFromSeconds(
                remainingSeconds
            );

        }, 1000);
}


// ============================================================
// FORMAT COUNTDOWN
// ============================================================

function updateCountdownTextFromSeconds(
    totalSeconds
) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;


    const formattedMinutes =
        String(minutes).padStart(
            2,
            "0"
        );


    const formattedSeconds =
        String(seconds).padStart(
            2,
            "0"
        );


    updateCountdownText(
        `${formattedMinutes}:${formattedSeconds}`
    );
}


// ============================================================
// UPDATE COUNTDOWN TEXT
// ============================================================

function updateCountdownText(value) {

    const element =
        document.getElementById(
            "qrCountdown"
        );

    if (!element) {
        return;
    }

    element.textContent =
        value;
}


// ============================================================
// QR EXPIRED
// ============================================================

function expireQrCode() {

    console.log(
        "QR session expired."
    );


    // --------------------------------------------------------
    // UPDATE STATUS
    // --------------------------------------------------------

    setHeaderStatus(
        "Expired",
        "expired"
    );


    // --------------------------------------------------------
    // SHOW EXPIRED OVERLAY
    // --------------------------------------------------------

    const overlay =
        document.getElementById(
            "qrExpiredOverlay"
        );

    if (overlay) {

        overlay.hidden = false;

    }


    // --------------------------------------------------------
    // REMOVE LIVE BADGE
    // --------------------------------------------------------

    const liveBadge =
        document.getElementById(
            "qrLiveBadge"
        );

    if (liveBadge) {

        liveBadge.classList.remove(
            "active"
        );

    }


    // --------------------------------------------------------
    // AUTOMATICALLY GENERATE NEW QR
    // --------------------------------------------------------

    setTimeout(() => {

        console.log(
            "Generating replacement QR..."
        );

        generateQrCode();

    }, 1000);
}


// ============================================================
// CLEAR COUNTDOWN
// ============================================================

function clearCountdown() {

    if (countdownInterval !== null) {

        clearInterval(
            countdownInterval
        );

        countdownInterval = null;

    }
}


// ============================================================
// LOADING STATE
// ============================================================

function showLoadingState() {

    const loading =
        document.getElementById(
            "qrLoading"
        );

    const overlay =
        document.getElementById(
            "qrExpiredOverlay"
        );


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    if (loading) {

        loading.hidden = false;

        loading.innerHTML = `
            <div class="qr-spinner"></div>
            <span>Generating QR...</span>
        `;

    }


    // --------------------------------------------------------
    // HIDE EXPIRED
    // --------------------------------------------------------

    if (overlay) {

        overlay.hidden = true;

    }


    // --------------------------------------------------------
    // REMOVE PREVIOUS QR
    // --------------------------------------------------------

    const oldQr =
        document.querySelector(
            ".generated-qr"
        );

    if (oldQr) {

        oldQr.remove();

    }
}


// ============================================================
// ERROR STATE
// ============================================================

function showQrError(message) {

    const loading =
        document.getElementById(
            "qrLoading"
        );


    if (loading) {

        loading.hidden = false;

        loading.innerHTML = `
            <div style="
                text-align: center;
                padding: 20px;
                color: #8b3f2f;
            ">
                <strong>
                    Unable to generate QR
                </strong>

                <br><br>

                <span style="
                    font-size: 13px;
                ">
                    ${message}
                </span>
            </div>
        `;

    }


    const countdown =
        document.getElementById(
            "qrCountdown"
        );


    if (countdown) {

        countdown.textContent =
            "--:--";

    }
}


// ============================================================
// HEADER STATUS
// ============================================================

function setHeaderStatus(
    status,
    type
) {

    const statusElement =
        document.getElementById(
            "headerStatus"
        );

    const dotElement =
        document.getElementById(
            "headerStatusDot"
        );


    // --------------------------------------------------------
    // TEXT
    // --------------------------------------------------------

    if (statusElement) {

        statusElement.textContent =
            status;

    }


    // --------------------------------------------------------
    // DOT
    // --------------------------------------------------------

    if (dotElement) {

        dotElement.classList.remove(
            "active",
            "loading",
            "error",
            "expired"
        );


        if (type) {

            dotElement.classList.add(
                type
            );

        }

    }
}