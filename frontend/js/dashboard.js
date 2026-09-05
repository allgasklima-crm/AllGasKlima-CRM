/* =========================================================
   ALLGASKLIMA CRM - DASHBOARD
========================================================= */


/* =========================================================
   ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ DASHBOARD
========================================================= */

const callsTodayCard =
    document.getElementById("callsTodayCard");

const callsTodayCount =
    document.getElementById("callsTodayCount");


const inDeliveryCard =
    document.getElementById("inDeliveryCard");

const inDeliveryCount =
    document.getElementById("inDeliveryCount");


const completedOrdersCard =
    document.getElementById("completedOrdersCard");

const completedOrdersCount =
    document.getElementById("completedOrdersCount");


/* =========================================================
   ΒΟΗΘΗΤΙΚΗ - ΠΡΟΪΟΝΤΑ ΠΑΡΑΓΓΕΛΙΑΣ
========================================================= */

function getOrderProducts(order) {

    const products = [];

    if (Number(order.delivery_3kg) > 0) {
        products.push(
            `${order.delivery_3kg} × 3kg`
        );
    }

    if (Number(order.delivery_10kg_mix) > 0) {
        products.push(
            `${order.delivery_10kg_mix} × 10kg Μίγμα`
        );
    }

    if (Number(order.delivery_10kg_propane) > 0) {
        products.push(
            `${order.delivery_10kg_propane} × 10kg Προπάνιο`
        );
    }

    if (Number(order.delivery_13kg) > 0) {
        products.push(
            `${order.delivery_13kg} × 13kg`
        );
    }

    if (Number(order.delivery_25kg) > 0) {
        products.push(
            `${order.delivery_25kg} × 25kg`
        );
    }

    return products;
}


/* =========================================================
   ΒΟΗΘΗΤΙΚΗ - ΩΡΑ ΠΑΡΑΓΓΕΛΙΑΣ
========================================================= */

function getOrderTime(createdAt) {

    const value =
        String(createdAt || "");

    if (value.includes(" ")) {
        return value
            .split(" ")[1]
            .slice(0, 5);
    }

    return value;
}


/* =========================================================
   ΚΛΗΣΕΙΣ ΣΗΜΕΡΑ
========================================================= */

const todayCallsModal =
    document.getElementById("todayCallsModal");

const closeTodayCallsBtn =
    document.getElementById("closeTodayCallsBtn");

const todayCallsBody =
    document.getElementById("todayCallsBody");


async function loadTodayCalls() {

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
            return;
        }


        const calls =
            Array.isArray(data.calls)
                ? data.calls
                : [];


        const now =
            new Date();

        const today =
            String(now.getDate()).padStart(2, "0") +
            "/" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "/" +
            now.getFullYear();


        const todayCalls =
            calls.filter(
                call =>
                    call.date === today &&
                    !call.deleted
            );


        /* ΜΕΤΡΗΤΗΣ ΚΛΗΣΕΩΝ */

        if (callsTodayCount) {
            callsTodayCount.textContent =
                todayCalls.length;
        }


        /* ΑΝ ΔΕΝ ΥΠΑΡΧΕΙ MODAL BODY */

        if (!todayCallsBody) {
            return;
        }


        /* ΚΑΜΙΑ ΚΛΗΣΗ */

        if (todayCalls.length === 0) {

            todayCallsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Δεν υπάρχουν σημερινές κλήσεις.
                    </td>
                </tr>
            `;

            return;
        }


        /* ΛΙΣΤΑ ΚΛΗΣΕΩΝ */

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

        if (todayCallsBody) {

            todayCallsBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Δεν υπάρχει σύνδεση με τον server.
                    </td>
                </tr>
            `;
        }
    }
}


/* ΑΝΟΙΓΜΑ ΚΛΗΣΕΩΝ */

if (callsTodayCard) {

    callsTodayCard.style.cursor =
        "pointer";

    callsTodayCard.addEventListener(
        "click",
        async () => {

            if (todayCallsModal) {
                todayCallsModal
                    .classList
                    .remove("hidden");
            }

            await loadTodayCalls();
        }
    );
}


/* ΚΛΕΙΣΙΜΟ ΚΛΗΣΕΩΝ ΜΕ Χ */

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


/* ΚΛΕΙΣΙΜΟ ΚΛΗΣΕΩΝ ΠΑΤΩΝΤΑΣ ΕΞΩ */

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
   ΣΕ ΔΙΑΝΟΜΗ
========================================================= */

const inDeliveryModal =
    document.getElementById("inDeliveryModal");

const closeInDeliveryBtn =
    document.getElementById("closeInDeliveryBtn");

const inDeliveryBody =
    document.getElementById("inDeliveryBody");


async function loadInDeliveryOrders() {

    try {

        const response =
            await fetch(
                "/api/orders/today",
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
            return;
        }


        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        const deliveryOrders =
            orders.filter(
                order =>
                    order.status ===
                    "in_delivery"
            );


        /* ΜΕΤΡΗΤΗΣ */

        if (inDeliveryCount) {
            inDeliveryCount.textContent =
                deliveryOrders.length;
        }


        if (!inDeliveryBody) {
            return;
        }


        /* ΚΑΜΙΑ ΠΑΡΑΓΓΕΛΙΑ */

        if (deliveryOrders.length === 0) {

            inDeliveryBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Δεν υπάρχουν παραγγελίες σε διανομή.
                    </td>
                </tr>
            `;

            return;
        }


        /* ΠΑΡΑΓΓΕΛΙΕΣ ΣΕ ΔΙΑΝΟΜΗ */

        inDeliveryBody.innerHTML =
            deliveryOrders
                .map(
                    (order, index) => {

                        const products =
                            getOrderProducts(order);

                        const time =
                            getOrderTime(
                                order.created_at
                            );

                        return `
                            <tr
                                class="in-delivery-order-row"
                                data-order-id="${order.id}"
                                style="cursor:pointer;"
                            >

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${escapeHtml(time)}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.fullname || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.phone1 || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.area || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.address || ""
                                    )}
                                </td>

                                <td>
                                    ${
                                        products.join("<br>") ||
                                        "-"
                                    }
                                </td>

                                <td>
                                    Σε διανομή
                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");


        /* =============================================
           ΠΑΤΗΜΑ ΓΡΑΜΜΗΣ = ΟΛΟΚΛΗΡΩΣΗ
        ============================================= */

        inDeliveryBody
            .querySelectorAll(
                ".in-delivery-order-row"
            )
            .forEach((row) => {

                row.addEventListener(
                    "click",
                    async () => {

                        const orderId =
                            row.dataset.orderId;


                        const confirmed =
                            confirm(
                                "Η παραγγελία παραδόθηκε και ολοκληρώθηκε;"
                            );


                        if (!confirmed) {
                            return;
                        }


                        try {

                            const response =
                                await fetch(
                                    `/api/orders/${orderId}/complete`,
                                    {
                                        method: "POST"
                                    }
                                );


                            const data =
                                await response.json();


                            if (
                                !response.ok ||
                                !data.success
                            ) {

                                alert(
                                    "Δεν ολοκληρώθηκε η παραγγελία."
                                );

                                return;
                            }


                            /*
                               ΑΝΑΝΕΩΣΗ ΟΛΩΝ
                            */

                            await loadInDeliveryOrders();

                            await loadCompletedOrders();

                            if (
                                typeof loadTodayOrders ===
                                "function"
                            ) {
                                await loadTodayOrders();
                            }

                            if (
                                typeof loadTodayOrdersCount ===
                                "function"
                            ) {
                                await loadTodayOrdersCount();
                            }


                        } catch (error) {

                            console.error(
                                "Σφάλμα ολοκλήρωσης παραγγελίας:",
                                error
                            );

                            alert(
                                "Παρουσιάστηκε σφάλμα."
                            );
                        }
                    }
                );
            });


    } catch (error) {

        console.error(
            "Σφάλμα φόρτωσης παραγγελιών σε διανομή:",
            error
        );

        if (inDeliveryBody) {

            inDeliveryBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Δεν υπάρχει σύνδεση με τον server.
                    </td>
                </tr>
            `;
        }
    }
}


/* ΑΝΟΙΓΜΑ ΣΕ ΔΙΑΝΟΜΗ */

if (inDeliveryCard) {

    inDeliveryCard.style.cursor =
        "pointer";

    inDeliveryCard.addEventListener(
        "click",
        async () => {

            if (inDeliveryModal) {

                inDeliveryModal
                    .classList
                    .remove("hidden");
            }

            await loadInDeliveryOrders();
        }
    );
}


/* ΚΛΕΙΣΙΜΟ ΣΕ ΔΙΑΝΟΜΗ */

if (
    closeInDeliveryBtn &&
    inDeliveryModal
) {

    closeInDeliveryBtn.addEventListener(
        "click",
        () => {

            inDeliveryModal
                .classList
                .add("hidden");
        }
    );
}


/* ΚΛΕΙΣΙΜΟ ΠΑΤΩΝΤΑΣ ΕΞΩ */

if (inDeliveryModal) {

    inDeliveryModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                inDeliveryModal
            ) {

                inDeliveryModal
                    .classList
                    .add("hidden");
            }
        }
    );
}


/* =========================================================
   ΟΛΟΚΛΗΡΩΜΕΝΕΣ
========================================================= */


/*
   Αν δεν υπάρχει ήδη modal Ολοκληρωμένων
   στο index.html, το δημιουργούμε αυτόματα.
*/

let completedOrdersModal =
    document.getElementById(
        "completedOrdersModal"
    );


if (!completedOrdersModal) {

    completedOrdersModal =
        document.createElement("div");

    completedOrdersModal.id =
        "completedOrdersModal";

    completedOrdersModal.className =
        "directory-modal hidden";

    completedOrdersModal.innerHTML = `
        <div class="directory-window">

            <div class="directory-header">

                <div>
                    <span class="section-kicker">
                        ΠΑΡΑΓΓΕΛΙΕΣ
                    </span>

                    <h2>
                        Ολοκληρωμένες
                    </h2>
                </div>

                <button
                    type="button"
                    id="closeCompletedOrdersBtn"
                    class="directory-close"
                >
                    ×
                </button>

            </div>


            <div class="directory-table-wrap">

                <table class="directory-table">

                    <thead>
                        <tr>
                            <th>Α/Α</th>
                            <th>Ώρα</th>
                            <th>Πελάτης</th>
                            <th>Τηλέφωνο</th>
                            <th>Περιοχή</th>
                            <th>Διεύθυνση</th>
                            <th>Παραγγελία</th>
                            <th>Κατάσταση</th>
                        </tr>
                    </thead>

                    <tbody id="completedOrdersBody">
                    </tbody>

                </table>

            </div>

        </div>
    `;

    document.body.appendChild(
        completedOrdersModal
    );
}


const completedOrdersBody =
    document.getElementById(
        "completedOrdersBody"
    );

const closeCompletedOrdersBtn =
    document.getElementById(
        "closeCompletedOrdersBtn"
    );


async function loadCompletedOrders() {

    try {

        const response =
            await fetch(
                "/api/orders/today",
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
            return;
        }


        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        const completedOrders =
            orders.filter(
                order =>
                    order.status ===
                    "completed"
            );


        /* ΜΕΤΡΗΤΗΣ */

        if (completedOrdersCount) {

            completedOrdersCount.textContent =
                completedOrders.length;
        }


        if (!completedOrdersBody) {
            return;
        }


        /* ΚΑΜΙΑ ΟΛΟΚΛΗΡΩΜΕΝΗ */

        if (completedOrders.length === 0) {

            completedOrdersBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Δεν υπάρχουν ολοκληρωμένες παραγγελίες.
                    </td>
                </tr>
            `;

            return;
        }


        completedOrdersBody.innerHTML =
            completedOrders
                .map(
                    (order, index) => {

                        const products =
                            getOrderProducts(order);

                        const time =
                            getOrderTime(
                                order.created_at
                            );

                        return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${escapeHtml(time)}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.fullname || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.phone1 || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.area || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        order.address || ""
                                    )}
                                </td>

                                <td>
                                    ${
                                        products.join("<br>") ||
                                        "-"
                                    }
                                </td>

                                <td>
                                    Ολοκληρώθηκε
                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Σφάλμα φόρτωσης ολοκληρωμένων:",
            error
        );

        if (completedOrdersBody) {

            completedOrdersBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Δεν υπάρχει σύνδεση με τον server.
                    </td>
                </tr>
            `;
        }
    }
}


/* ΑΝΟΙΓΜΑ ΟΛΟΚΛΗΡΩΜΕΝΩΝ */

if (completedOrdersCard) {

    completedOrdersCard.style.cursor =
        "pointer";

    completedOrdersCard.addEventListener(
        "click",
        async () => {

            if (completedOrdersModal) {

                completedOrdersModal
                    .classList
                    .remove("hidden");
            }

            await loadCompletedOrders();
        }
    );
}


/* ΚΛΕΙΣΙΜΟ ΟΛΟΚΛΗΡΩΜΕΝΩΝ */

if (
    closeCompletedOrdersBtn &&
    completedOrdersModal
) {

    closeCompletedOrdersBtn.addEventListener(
        "click",
        () => {

            completedOrdersModal
                .classList
                .add("hidden");
        }
    );
}


/* ΚΛΕΙΣΙΜΟ ΟΛΟΚΛΗΡΩΜΕΝΩΝ ΠΑΤΩΝΤΑΣ ΕΞΩ */

if (completedOrdersModal) {

    completedOrdersModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                completedOrdersModal
            ) {

                completedOrdersModal
                    .classList
                    .add("hidden");
            }
        }
    );
}


/* =========================================================
   ΑΡΧΙΚΗ ΦΟΡΤΩΣΗ DASHBOARD
========================================================= */

async function refreshDashboard() {

    await loadTodayCalls();

    if (
        typeof loadTodayOrdersCount ===
        "function"
    ) {
        await loadTodayOrdersCount();
    }

    await loadInDeliveryOrders();

    await loadCompletedOrders();
}


refreshDashboard();


/* =========================================================
   ΑΥΤΟΜΑΤΗ ΑΝΑΝΕΩΣΗ ΚΑΘΕ 5 ΔΕΥΤΕΡΟΛΕΠΤΑ
========================================================= */

setInterval(
    refreshDashboard,
    5001
);