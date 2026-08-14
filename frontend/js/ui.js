function isProbablyPhone(value) {
    const cleanedValue =
        value.replace(/[\s()+-]/g, "");

    return /^\d+$/.test(cleanedValue);
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   ΗΜΕΡΟΜΗΝΙΑ ΚΑΙ ΩΡΑ
========================================================= */

function updateDateTime() {
    const now =
        new Date();

    const callDate =
        document.getElementById(
            "callDate"
        );

    const callTime =
        document.getElementById(
            "callTime"
        );

    if (callDate) {
        callDate.textContent =
            now.toLocaleDateString(
                "el-GR"
            );
    }

    if (callTime) {
        callTime.textContent =
            now.toLocaleTimeString(
                "el-GR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );
    }
}


/* =========================================================
   ΕΚΚΙΝΗΣΗ ΕΦΑΡΜΟΓΗΣ
========================================================= */

updateDateTime();

setInterval(
    updateDateTime,
    1000
);