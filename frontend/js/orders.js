/* =========================================
   ΠΑΡΑΓΓΕΛΙΕΣ
========================================= */

const saveOrderBtn =
    document.getElementById("saveOrderBtn");

const sendToDriverBtn =
    document.getElementById("sendToDriverBtn");

/*
   Κρατάμε το ID της τελευταίας παραγγελίας
   που αποθηκεύτηκε από τη φόρμα.
*/
let lastSavedOrderId = null;


/* =========================================
   ΑΠΟΘΗΚΕΥΣΗ ΠΑΡΑΓΓΕΛΙΑΣ
========================================= */

if (saveOrderBtn) {

    saveOrderBtn.addEventListener(
        "click",
        async () => {

            const orderData = {

                fullname:
                    document
                        .getElementById("fullname")
                        .value
                        .trim(),

                phone1:
                    document
                        .getElementById("phone1")
                        .value
                        .trim(),

                phone2:
                    document
                        .getElementById("phone2")
                        .value
                        .trim(),

                phone3:
                    document
                        .getElementById("phone3")
                        .value
                        .trim(),

                area:
                    document
                        .getElementById("area")
                        .value
                        .trim(),

                address:
                    document
                        .getElementById("address")
                        .value
                        .trim(),

                floor:
                    document
                        .getElementById("floor")
                        .value
                        .trim(),

                notes:
                    document
                        .getElementById("notes")
                        .value
                        .trim(),

                delivery_3kg:
                    document
                        .getElementById("delivery3kg")
                        .value || 0,

                delivery_10kg_mix:
                    document
                        .getElementById("delivery10kgMix")
                        .value || 0,

                delivery_10kg_propane:
                    document
                        .getElementById("delivery10kgPropane")
                        .value || 0,

                delivery_13kg:
                    document
                        .getElementById("delivery13kg")
                        .value || 0,

                delivery_25kg:
                    document
                        .getElementById("delivery25kg")
                        .value || 0,

                return_3kg:
                    document
                        .getElementById("return3kg")
                        .value || 0,

                return_10kg_mix:
                    document
                        .getElementById("return10kgMix")
                        .value || 0,

                return_10kg_propane:
                    document
                        .getElementById("return10kgPropane")
                        .value || 0,

                return_13kg:
                    document
                        .getElementById("return13kg")
                        .value || 0,

                return_25kg:
                    document
                        .getElementById("return25kg")
                        .value || 0,

                order_notes:
                    document
                        .getElementById("orderNotes")
                        .value
                        .trim()
            };


            try {

                const response =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )
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
                        "Η παραγγελία δεν αποθηκεύτηκε."
                    );

                    return;
                }


                /*
                   Αποθηκεύουμε το ID της
                   παραγγελίας που μόλις δημιουργήθηκε.
                */

                lastSavedOrderId =
                    data.order_id;


                alert(
                    "Η παραγγελία αποθηκεύτηκε επιτυχώς."
                );


                await loadTodayOrdersCount();

                if (
                    typeof loadTodayOrders ===
                    "function"
                ) {
                    await loadTodayOrders();
                }

            } catch (error) {

                console.error(
                    "Σφάλμα αποθήκευσης παραγγελίας:",
                    error
                );

                alert(
                    "Παρουσιάστηκε σφάλμα κατά την αποθήκευση."
                );
            }
        }
    );
}


/* =========================================
   ΑΠΟΣΤΟΛΗ ΣΤΟΝ ΟΔΗΓΟ
========================================= */

if (sendToDriverBtn) {

    sendToDriverBtn.addEventListener(
        "click",
        async () => {

            /*
               Πρέπει πρώτα να έχει αποθηκευτεί
               η παραγγελία.
            */

            if (!lastSavedOrderId) {

                alert(
                    "Πρώτα πάτησε «Αποθήκευση παραγγελίας»."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/orders/${lastSavedOrderId}/send-to-driver`,
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
                        data.message ||
                        "Η παραγγελία δεν στάλθηκε στον οδηγό."
                    );

                    return;
                }


                alert(
                    "Η παραγγελία πέρασε σε διανομή."
                );


                /*
                   Ανανεώνουμε τις λίστες
                   και τους μετρητές.
                */

                await loadTodayOrdersCount();

                if (
                    typeof loadTodayOrders ===
                    "function"
                ) {
                    await loadTodayOrders();
                }

                if (
                    typeof loadInDeliveryOrders ===
                    "function"
                ) {
                    await loadInDeliveryOrders();
                }


                /*
                   Δεν επιτρέπουμε δεύτερη αποστολή
                   της ίδιας παραγγελίας.
                */

                lastSavedOrderId = null;

            } catch (error) {

                console.error(
                    "Σφάλμα αποστολής στον οδηγό:",
                    error
                );

                alert(
                    "Παρουσιάστηκε σφάλμα κατά την αποστολή στον οδηγό."
                );
            }
        }
    );
}

async function loadTodayOrdersCount() {
    if (!todayOrdersCount) {
        return;
    }

    try {
        const response = await fetch(
            "/api/orders/today-count",
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (
            response.ok &&
            data.success
        ) {
            todayOrdersCount.textContent =
                data.count;
        }

    } catch (error) {
        console.error(
            "Σφάλμα φόρτωσης σημερινών παραγγελιών:",
            error
        );
    }
}

async function loadTodayOrders() {
    const todayOrdersBody = document.getElementById("todayOrdersBody");

    if (!todayOrdersBody) {
        return;
    }

    try {
        const response = await fetch("/api/orders/today");
        const data = await response.json();

        if (!data.success) {
            throw new Error("Αποτυχία φόρτωσης παραγγελιών.");
        }

        todayOrdersBody.innerHTML = "";

        if (!data.orders || data.orders.length === 0) {
            todayOrdersBody.innerHTML = `
                <tr>
                    <td colspan="8">Δεν υπάρχουν σημερινές παραγγελίες.</td>
                </tr>
            `;
            return;
        }

        data.orders.forEach((order, index) => {
            const products = [];

            if (Number(order.delivery_3kg) > 0) {
                products.push(`${order.delivery_3kg} × 3kg`);
            }

            if (Number(order.delivery_10kg_mix) > 0) {
                products.push(`${order.delivery_10kg_mix} × 10kg Μίγμα`);
            }

            if (Number(order.delivery_10kg_propane) > 0) {
                products.push(`${order.delivery_10kg_propane} × 10kg Προπάνιο`);
            }

            if (Number(order.delivery_13kg) > 0) {
                products.push(`${order.delivery_13kg} × 13kg`);
            }

            if (Number(order.delivery_25kg) > 0) {
                products.push(`${order.delivery_25kg} × 25kg`);
            }

            const createdAt = order.created_at || "";

        let time = "";

        if (createdAt) {
    const utcDate = new Date(
        createdAt.replace(" ", "T") + "Z"
    );

    time = utcDate.toLocaleTimeString(
        "el-GR",
        {
            timeZone: "Europe/Athens",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    );
}

            const row = document.createElement("tr");

            row.dataset.orderId = order.id;
            row.style.cursor = "pointer";

            if (order.status === "completed") {
                row.classList.add("completed-order");
            }

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${time}</td>
                <td>${order.fullname || ""}</td>
                <td>${order.phone1 || ""}</td>
                <td>${order.area || ""}</td>
                <td>${order.address || ""}</td>
                <td>${products.join("<br>") || "-"}</td>
                <td class="order-status">
                    ${order.status === "completed" ? "Εκτελέστηκε" : "Νέα"}
                </td>
            `;

            row.addEventListener("click", async () => {
                if (row.classList.contains("completed-order")) {
                    return;
                }

                try {
                    const response = await fetch(
                        `/api/orders/${order.id}/complete`,
                        {
                            method: "POST"
                        }
                    );

                    const result = await response.json();

                    if (result.success) {
                        const statusCell =
                            row.querySelector(".order-status");

                        if (statusCell) {
                            statusCell.textContent = "Εκτελέστηκε";
                        }

                        row.classList.add("completed-order");
                    }
                } catch (error) {
                    console.error(error);
                }
            });

            todayOrdersBody.appendChild(row);
        });

    } catch (error) {
        console.error(error);

        todayOrdersBody.innerHTML = `
            <tr>
                <td colspan="8">Σφάλμα φόρτωσης παραγγελιών.</td>
            </tr>
        `;
    }
}

const todayOrdersCard = document.getElementById("todayOrdersCard");
const todayOrdersModal = document.getElementById("todayOrdersModal");
const closeTodayOrdersBtn = document.getElementById("closeTodayOrdersBtn");

if (todayOrdersCard && todayOrdersModal && closeTodayOrdersBtn) {
    todayOrdersCard.style.cursor = "pointer";

    todayOrdersCard.addEventListener("click", () => {
    todayOrdersModal.classList.remove("hidden");
    loadTodayOrders();
});

    closeTodayOrdersBtn.addEventListener("click", () => {
        todayOrdersModal.classList.add("hidden");
    });

    todayOrdersModal.addEventListener("click", (event) => {
        if (event.target === todayOrdersModal) {
            todayOrdersModal.classList.add("hidden");
        }
    });
}

const deleteAllTodayOrdersBtn = document.getElementById("deleteAllTodayOrdersBtn");

if (deleteAllTodayOrdersBtn) {
    deleteAllTodayOrdersBtn.addEventListener("click", async () => {
        const confirmed = confirm(
            "Θέλεις να καθαρίσεις όλες τις σημερινές παραγγελίες από τη λίστα;"
        );

        if (!confirmed) return;

        try {
            const response = await fetch("/api/orders/today/clear", {
                method: "POST"
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error("Αποτυχία καθαρισμού παραγγελιών.");
            }

            await loadTodayOrders();
            await loadTodayOrdersCount();

        } catch (error) {
            console.error(error);
            alert("Παρουσιάστηκε σφάλμα.");
        }
    });
}

/* =========================================================
   ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΗ ΠΑΡΑΓΓΕΛΙΑ
========================================================= */


const scheduleOrderBtn =
    document.getElementById(
        "scheduleOrderBtn"
    );

if (scheduleOrderBtn) {

    scheduleOrderBtn.addEventListener(
        "click",
        async () => {

            const deliveryDate =
                prompt(
                    "Ημερομηνία παράδοσης (π.χ. 20/08/2026):"
                );

            if (!deliveryDate) {
                return;
            }


            const deliveryTime =
                prompt(
                    "Ώρα παράδοσης (π.χ. 18:30):"
                );

            if (!deliveryTime) {
                return;
            }


            const reminderMinutes =
                prompt(
                    "Ειδοποίηση πόσα λεπτά πριν;",
                    "30"
                );

            if (!reminderMinutes) {
                return;
            }


            const reminderNumber =
                Number(reminderMinutes);

            if (
                !Number.isInteger(reminderNumber) ||
                reminderNumber < 1
            ) {

                alert(
                    "Γράψε σωστό αριθμό λεπτών, π.χ. 3, 20 ή 30."
                );

                return;
            }


            const orderData = {

    fullname:
        fullnameInput.value.trim(),

    phone1:
        phone1Input.value.trim(),

    phone2:
        phone2Input.value.trim(),

    phone3:
        phone3Input.value.trim(),

    area:
        areaInput.value.trim(),

    address:
        addressInput.value.trim(),

    floor:
        floorInput.value.trim(),

    notes:
        notesInput.value.trim(),

    delivery_3kg:
        Number(
            document.getElementById(
                "delivery3kg"
            )?.value || 0
        ),

    delivery_10kg_mix:
        Number(
            document.getElementById(
                "delivery10kgMix"
            )?.value || 0
        ),

    delivery_10kg_propane:
        Number(
            document.getElementById(
                "delivery10kgPropane"
            )?.value || 0
        ),

    delivery_13kg:
        Number(
            document.getElementById(
                "delivery13kg"
            )?.value || 0
        ),

    delivery_25kg:
        Number(
            document.getElementById(
                "delivery25kg"
            )?.value || 0
        ),

    return_3kg:
        Number(
            document.getElementById(
                "return3kg"
            )?.value || 0
        ),

    return_10kg_mix:
        Number(
            document.getElementById(
                "return10kgMix"
            )?.value || 0
        ),

    return_10kg_propane:
        Number(
            document.getElementById(
                "return10kgPropane"
            )?.value || 0
        ),

    return_13kg:
        Number(
            document.getElementById(
                "return13kg"
            )?.value || 0
        ),

    return_25kg:
        Number(
            document.getElementById(
                "return25kg"
            )?.value || 0
        ),

    order_notes:
        document.getElementById(
            "orderNotes"
        )?.value.trim() || "",

    scheduled_date:
        deliveryDate,

    scheduled_time:
        deliveryTime,

    reminder_minutes:
        reminderNumber
};


if (
    !orderData.fullname ||
    !orderData.phone1
) {

    alert(
        "Χρειάζονται πελάτης και κύριο τηλέφωνο."
    );

    return;
}


try {

    const response =
        await fetch(
            "/api/orders/scheduled",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        orderData
                    )
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
            "Δεν αποθηκεύτηκε η προγραμματισμένη παραγγελία."
        );

        return;
    }


    alert(
        "✅ Η προγραμματισμένη παραγγελία αποθηκεύτηκε.\n\n" +
        "Ημερομηνία: " +
        deliveryDate +
        "\nΏρα: " +
        deliveryTime +
        "\nΕιδοποίηση: " +
        reminderNumber +
        " λεπτά πριν."
    );


} catch (error) {

    console.error(
        "Σφάλμα προγραμματισμένης παραγγελίας:",
        error
    );

    alert(
        "Δεν υπάρχει σύνδεση με τον server."
    );
}
        }
    );
}



let notifiedScheduledOrders = new Set();

async function checkScheduledOrders() {
    try {
        const response = await fetch(
            "/api/orders/scheduled",
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (
            !response.ok ||
            !data.success ||
            !Array.isArray(data.orders)
        ) {
            return;
        }

        const now = new Date();

        for (const order of data.orders) {
            if (
                !order.scheduled_date ||
                !order.scheduled_time
            ) {
                continue;
            }

            const [
                day,
                month,
                year
            ] = order.scheduled_date.split("/");

            const [
                hour,
                minute
            ] = order.scheduled_time.split(":");

            const deliveryDateTime =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    Number(hour),
                    Number(minute),
                    0
                );

            const reminderMinutes =
                Number(
                    order.reminder_minutes || 0
                );

            const reminderTime =
                new Date(
                    deliveryDateTime.getTime() -
                    reminderMinutes * 60000
                );

            const orderKey =
                `${order.id}-${order.scheduled_date}-${order.scheduled_time}`;

            if (
                    now >= reminderTime &&
                    !notifiedScheduledOrders.has(orderKey)
                ) {
                notifiedScheduledOrders.add(
                orderKey
                );

                playReminderSound();

                alert(
                    "🔔 ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΗ ΠΑΡΑΓΓΕΛΙΑ\n\n" +
                    "Πελάτης: " +
                    order.fullname +
                    "\n" +
                    "Τηλέφωνο: " +
                    order.phone1 +
                    "\n" +
                    "Περιοχή: " +
                    (order.area || "-") +
                    "\n" +
                    "Διεύθυνση: " +
                    (order.address || "-") +
                    "\n\n" +
                    "Ώρα παράδοσης: " +
                    order.scheduled_time
                );
            }
        }

    } catch (error) {
        console.error(
            "Σφάλμα ελέγχου προγραμματισμένων παραγγελιών:",
            error
        );
    }
}

checkScheduledOrders();

setInterval(
    checkScheduledOrders,
    5000
);

// =========================================================
// ΚΑΘΑΡΙΣΜΟΣ ΠΙΝΑΚΑ ΠΑΡΑΓΓΕΛΙΑΣ ΦΙΑΛΩΝ
// =========================================================

const clearOrderTableBtn =
    document.getElementById("clearOrderTableBtn");

if (clearOrderTableBtn) {

    clearOrderTableBtn.addEventListener(
        "click",
        () => {

            const orderFieldIds = [
                "delivery3kg",
                "delivery10kgMix",
                "delivery10kgPropane",
                "delivery13kg",
                "delivery25kg",

                "return3kg",
                "return10kgMix",
                "return10kgPropane",
                "return13kg",
                "return25kg"
            ];

            orderFieldIds.forEach(
                (id) => {
                    const input =
                        document.getElementById(id);

                    if (input) {
                        input.value = "";
                    }
                }
            );

            const orderNotes =
                document.getElementById("orderNotes");

            if (orderNotes) {
                orderNotes.value = "";
            }
        }
    );
}
// PRODUCT BUTTONS
document.querySelectorAll('.order-product-btn').forEach((button)=>{button.addEventListener('click',()=>{const input=document.getElementById(button.dataset.target);if(!input)return;input.value=Number(input.value||0)+1;});});
