/* =========================================================
   ALLGASKLIMA CRM - DASHBOARD
========================================================= */


/* =========================================================
   ΚΑΡΤΕΣ DASHBOARD
========================================================= */

const callsTodayCard =
    document.getElementById("callsTodayCard");

const inDeliveryCard =
    document.getElementById("inDeliveryCard");

const completedOrdersCard =
    document.getElementById("completedOrdersCard");


/* =========================================================
   ΚΛΗΣΕΙΣ ΣΗΜΕΡΑ - MODAL
========================================================= */

const todayCallsModal =
    document.getElementById("todayCallsModal");

const closeTodayCallsBtn =
    document.getElementById("closeTodayCallsBtn");

const todayCallsBody =
    document.getElementById("todayCallsBody");


/* =========================================================
   ΑΝΟΙΓΜΑ ΚΛΗΣΕΩΝ ΣΗΜΕΡΑ
========================================================= */

if (callsTodayCard) {

    callsTodayCard.style.cursor =
        "pointer";

    callsTodayCard.addEventListener(
        "click",
        async () => {

            if (!todayCallsModal) {
                return;
            }

            todayCallsModal
                .classList
                .remove("hidden");

            await loadTodayCalls();
        }
    );
}


/* =========================================================
   ΚΛΕΙΣΙΜΟ ΜΕ Χ
========================================================= */

if (
    closeTodayCallsBtn &&
    todayCallsModal
) {

    closeTodayCallsBtn.addEventListener(
        "click",
        () => {

            todayCallsModal
                .classList
                .add("hidden");
        }
    );
}


/* =========================================================
   ΚΛΕΙΣΙΜΟ ΠΑΤΩΝΤΑΣ ΕΞΩ ΑΠΟ ΤΟ ΠΑΡΑΘΥΡΟ
========================================================= */

if (todayCallsModal) {

    todayCallsModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                todayCallsModal
            ) {

                todayCallsModal
                    .classList
                    .add("hidden");
            }
        }
    );
}


/* =========================================================
   ΦΟΡΤΩΣΗ ΣΗΜΕΡΙΝΩΝ ΚΛΗΣΕΩΝ
========================================================= */

async function loadTodayCalls() {

    if (!todayCallsBody) {
        return;
    }

    todayCallsBody.innerHTML = `
        <tr>
            <td colspan="4">
                Φόρτωση...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
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

            todayCallsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Δεν φορτώθηκαν οι κλήσεις.
                    </td>
                </tr>
            `;

            return;
        }


        const calls =
            Array.isArray(data.calls)
                ? data.calls
                : [];


        const now =
            new Date();

        const today =
            String(
                now.getDate()
            ).padStart(2, "0") +
            "/" +
            String(
                now.getMonth() + 1
            ).padStart(2, "0") +
            "/" +
            now.getFullYear();


        const todayCalls =
            calls.filter(
                call =>
                    call.date === today &&
                    !call.deleted
            );


        if (
            todayCalls.length === 0
        ) {

            todayCallsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Δεν υπάρχουν σημερινές κλήσεις.
                    </td>
                </tr>
            `;

            return;
        }


        todayCallsBody.innerHTML =
            todayCalls
                .map(
                    (call, index) => {

                        const customerName =
                            call.customer_name
                                ? escapeHtml(
                                    call.customer_name
                                )
                                : "Άγνωστος αριθμός";

                        return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        call.time || ""
                                    )}
                                </td>

                                <td>
                                    ${customerName}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        call.phone || ""
                                    )}
                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");

    } catch (error) {

        console.error(
            "Σφάλμα φόρτωσης σημερινών κλήσεων:",
            error
        );

        todayCallsBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Δεν υπάρχει σύνδεση με τον server.
                </td>
            </tr>
        `;
    }
}


/* =========================================================
   ΣΕ ΔΙΑΝΟΜΗ
========================================================= */

if (inDeliveryCard) {

    inDeliveryCard.style.cursor =
        "pointer";

    inDeliveryCard.addEventListener(
        "click",
        () => {

            console.log(
                "Πατήθηκε: Σε διανομή"
            );
        }
    );
}


/* =========================================================
   ΟΛΟΚΛΗΡΩΜΕΝΕΣ
========================================================= */

if (completedOrdersCard) {

    completedOrdersCard.style.cursor =
        "pointer";

    completedOrdersCard.addEventListener(
        "click",
        () => {

            console.log(
                "Πατήθηκε: Ολοκληρωμένες"
            );
        }
    );
}