/* =========================================================
   ΚΛΗΣΕΙΣ
========================================================= */

let lastIncomingCallId = null;
let incomingCallCheckRunning = false;


async function checkIncomingCall() {
    if (incomingCallCheckRunning) {
        return;
    }

    incomingCallCheckRunning = true;

    try {
        const response = await fetch(
            "/api/latest-call",
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (
            !response.ok ||
            !data.success ||
            !data.has_call ||
            !data.call
        ) {
            return;
        }

        if (
            data.call.id ===
            lastIncomingCallId
        ) {
            return;
        }

        const incomingPhone =
            String(
                data.call.phone || ""
            ).trim();

        if (incomingPhone === "") {
            return;
        }

        lastIncomingCallId =
            data.call.id;

        phoneInput.value =
            incomingPhone;

        await searchCustomer();

        await loadCallHistory();

    } catch (error) {
        console.error(
            "Σφάλμα ελέγχου κλήσης:",
            error
        );

    } finally {
        incomingCallCheckRunning =
            false;
    }
}


/* =========================================================
   ΑΡΧΙΚΟΠΟΙΗΣΗ ΑΝΑΓΝΩΡΙΣΗΣ ΚΛΗΣΗΣ
========================================================= */

async function initializeIncomingCallWatcher() {
    try {
        const response = await fetch(
            "/api/latest-call",
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (
            response.ok &&
            data.success &&
            data.has_call &&
            data.call
        ) {
            lastIncomingCallId =
                data.call.id;
        }

    } catch (error) {
        console.error(
            "Δεν αρχικοποιήθηκε η παρακολούθηση κλήσεων:",
            error
        );
    }

    setInterval(
        checkIncomingCall,
        1000
    );
}

function createCallHistoryItem(call) {
    const customerName =
        call.customer_name
            ? escapeHtml(
                call.customer_name
            )
            : "Άγνωστος αριθμός";

    return `
        <div class="call-history-item">

            <div class="call-history-information">

                <strong>
                    ${customerName}
                </strong>

                <span>
                    📞 ${escapeHtml(
                        call.phone
                    )}
                </span>

                <span>
                    📅 ${escapeHtml(
                        call.date
                    )}
                </span>

                <span>
                    🕒 ${escapeHtml(
                        call.time
                    )}
                </span>

            </div>

            <button
                type="button"
                class="delete-single-call-btn"
                data-call-id="${call.id}"
            >
                Διαγραφή
            </button>

        </div>
    `;
}

async function loadCallHistory() {
    if (!callHistoryList) {
        return;
    }

    try {
        const response = await fetch(
            "/api/calls?limit=200",
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            callHistoryList.innerHTML = `
                <div class="empty-state">
                    <span>⚠️</span>
                    <p>
                        Δεν φορτώθηκε το ιστορικό κλήσεων.
                    </p>
                </div>
            `;

            return;
        }

        const activeCalls =
            data.calls.filter(
                call => !call.deleted
            );

        const deletedCalls =
            data.calls.filter(
                call => call.deleted
            );

        if (activeCalls.length === 0) {
            callHistoryList.innerHTML = `
                <div class="empty-state">
                    <span>📞</span>
                    <p>
                        Δεν υπάρχουν ακόμη κλήσεις.
                    </p>
                </div>
            `;
        } else {
            callHistoryList.innerHTML =
                activeCalls
                    .map(
                        createCallHistoryItem
                    )
                    .join("");
        }

        if (restoreCallHistoryBtn) {
            restoreCallHistoryBtn.style.display =
                deletedCalls.length > 0
                    ? "inline-flex"
                    : "none";
        }

    } catch (error) {
        console.error(
            "Σφάλμα φόρτωσης ιστορικού:",
            error
        );

        callHistoryList.innerHTML = `
            <div class="empty-state">
                <span>⚠️</span>
                <p>
                    Δεν υπάρχει σύνδεση με τον server.
                </p>
            </div>
        `;
    }
}

async function deleteSingleCall(callId) {
    try {
        const response = await fetch(
            `/api/calls/${callId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            alert(
                data.message ||
                "Δεν έγινε η διαγραφή."
            );

            return;
        }

        await loadCallHistory();

    } catch (error) {
        console.error(error);

        alert(
            "Δεν υπάρχει σύνδεση με τον server."
        );
    }
}

async function deleteAllCallHistory() {
    const confirmed =
        confirm(
            "Θέλεις να διαγράψεις όλο το ιστορικό κλήσεων;"
        );

    if (!confirmed) {
        return;
    }

    deleteCallHistoryBtn.disabled =
        true;

    deleteCallHistoryBtn.textContent =
        "Διαγραφή...";

    try {
        const response = await fetch(
            "/api/calls?limit=200",
            {
                cache: "no-store"
            }
        );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            alert(
                "Δεν φορτώθηκε το ιστορικό."
            );

            return;
        }

        const activeCalls =
            data.calls.filter(
                call => !call.deleted
            );

        for (const call of activeCalls) {
            await fetch(
                `/api/calls/${call.id}`,
                {
                    method: "DELETE"
                }
            );
        }

        await loadCallHistory();

    } catch (error) {
        console.error(error);

        alert(
            "Δεν υπάρχει σύνδεση με τον server."
        );

    } finally {
        deleteCallHistoryBtn.disabled =
            false;

        deleteCallHistoryBtn.textContent =
            "🗑 Διαγραφή ιστορικού";
    }
}

async function restoreDeletedCallHistory() {
    restoreCallHistoryBtn.disabled =
        true;

    restoreCallHistoryBtn.textContent =
        "Επαναφορά...";

    try {
        const response = await fetch(
            "/api/calls?limit=200",
            {
                cache: "no-store"
            }
        );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            alert(
                "Δεν φορτώθηκαν οι διαγραμμένες κλήσεις."
            );

            return;
        }

        const deletedCalls =
            data.calls.filter(
                call => call.deleted
            );

        for (const call of deletedCalls) {
            await fetch(
                `/api/calls/${call.id}/restore`,
                {
                    method: "POST"
                }
            );
        }

        await loadCallHistory();

    } catch (error) {
        console.error(error);

        alert(
            "Δεν υπάρχει σύνδεση με τον server."
        );

    } finally {
        restoreCallHistoryBtn.disabled =
            false;

        restoreCallHistoryBtn.textContent =
            "↩ Επαναφορά";
    }
}

if (callHistoryList) {
    callHistoryList.addEventListener(
        "click",
        (event) => {

            const deleteButton =
                event.target.closest(
                    ".delete-single-call-btn"
                );

            if (!deleteButton) {
                return;
            }

            const callId =
                deleteButton
                    .dataset
                    .callId;

            deleteSingleCall(
                callId
            );
        }
    );
}
initializeIncomingCallWatcher();