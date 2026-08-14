/* =========================================
   ΠΑΡΑΓΓΕΛΙΕΣ
   ========================================= */

const saveOrderBtn =
    document.getElementById("saveOrderBtn");
    if (saveOrderBtn) {

    saveOrderBtn.addEventListener(
        "click",
        async () => {

            const orderData = {
                fullname:
                    document.getElementById("fullname").value.trim(),

                phone1:
                    document.getElementById("phone1").value.trim(),

                phone2:
                    document.getElementById("phone2").value.trim(),

                phone3:
                    document.getElementById("phone3").value.trim(),

                area:
                    document.getElementById("area").value.trim(),

                address:
                    document.getElementById("address").value.trim(),

                floor:
                    document.getElementById("floor").value.trim(),

                notes:
                    document.getElementById("notes").value.trim(),

                delivery_3kg:
                    document.getElementById("delivery3kg").value || 0,

                delivery_10kg_mix:
                    document.getElementById("delivery10kgMix").value || 0,

                delivery_10kg_propane:
                    document.getElementById("delivery10kgPropane").value || 0,

                delivery_13kg:
                    document.getElementById("delivery13kg").value || 0,

                delivery_25kg:
                    document.getElementById("delivery25kg").value || 0,

                return_3kg:
                    document.getElementById("return3kg").value || 0,

                return_10kg_mix:
                    document.getElementById("return10kgMix").value || 0,

                return_10kg_propane:
                    document.getElementById("return10kgPropane").value || 0,

                return_13kg:
                    document.getElementById("return13kg").value || 0,

                return_25kg:
                    document.getElementById("return25kg").value || 0,

                order_notes:
                    document.getElementById("orderNotes").value.trim()
            };
                        try {

                const response = await fetch(
                    "/api/orders",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(orderData)
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    alert(
                        data.message ||
                        "Η παραγγελία δεν αποθηκεύτηκε."
                    );
                    return;
                }

                alert("Η παραγγελία αποθηκεύτηκε επιτυχώς.");

                await loadTodayOrdersCount();
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
            const time = createdAt.includes(" ")
                ? createdAt.split(" ")[1].slice(0, 5)
                : createdAt;

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