/* =========================================================
   ΙΣΤΟΡΙΚΟ ΠΕΛΑΤΗ
========================================================= */

function formatHistoryDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(
            value.replace(" ", "T")
        );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(
        "el-GR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


function buildProductText(order) {

    const delivery = [];
    const returns = [];

    const addItem = (
        list,
        quantity,
        label
    ) => {

        const qty =
            Number(quantity || 0);

        if (qty > 0) {
            list.push(
                `${qty} × ${label}`
            );
        }
    };


    addItem(
        delivery,
        order.delivery_3kg,
        "3kg"
    );

    addItem(
        delivery,
        order.delivery_10kg_mix,
        "10kg Μίγμα"
    );

    addItem(
        delivery,
        order.delivery_10kg_propane,
        "10kg Προπάνιο"
    );

    addItem(
        delivery,
        order.delivery_13kg,
        "13kg"
    );

    addItem(
        delivery,
        order.delivery_25kg,
        "25kg"
    );


    addItem(
        returns,
        order.return_3kg,
        "3kg"
    );

    addItem(
        returns,
        order.return_10kg_mix,
        "10kg Μίγμα"
    );

    addItem(
        returns,
        order.return_10kg_propane,
        "10kg Προπάνιο"
    );

    addItem(
        returns,
        order.return_13kg,
        "13kg"
    );

    addItem(
        returns,
        order.return_25kg,
        "25kg"
    );

        const loans = [];

        addItem(
            loans,
            order.loan_heaters,
            "Μανιτάρια χρησιδάνειο"
        );

        addItem(
            loans,
            order.loan_empty_cylinders,
            "Κενές φιάλες χρησιδάνειο"
        );


        return {
            delivery:
                delivery.length
                ? delivery.join(", ")
                : "-",

        returns:
    returns.length
        ? returns.join(", ")
        : "-",

    loans:
        loans.length
            ? loans.join(", ")
            : "-"
    };
}


function getHistoryStatusText(status) {

    const statusMap = {

        new:
            "Νέα",

        scheduled:
            "Προγραμματισμένη",

        in_delivery:
            "Σε διανομή",

        completed:
            "Ολοκληρώθηκε",

        cleared:
            "Καθαρίστηκε"
    };

    return (
        statusMap[status] ||
        status ||
        "-"
    );
}


async function loadCustomerHistory() {

    const content =
        document.getElementById(
            "customerHistoryContent"
        );

    if (!content) {
        return;
    }


    if (
        typeof currentCustomerId ===
            "undefined" ||
        currentCustomerId === null
    ) {

        content.innerHTML =
            "Δεν έχει επιλεγεί πελάτης.";

        return;
    }


    content.innerHTML =
        "Φόρτωση ιστορικού...";


    try {

        const response =
            await fetch(
                `/api/customer/${currentCustomerId}/history`,
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

            content.innerHTML =
                data.message ||
                "Δεν ήταν δυνατή η φόρτωση του ιστορικού.";

            return;
        }


        const customer =
            data.customer;

        const history =
            Array.isArray(
                data.history
            )
                ? data.history
                : [];


        let html = `

            <div
                style="
                    margin-bottom:18px;
                    padding:14px;
                    background:#f7f4fc;
                    border-radius:10px;
                "
            >

                <strong>
                    ${escapeHtml(
                        customer.fullname || ""
                    )}
                </strong>

                <div
                    style="
                        margin-top:5px;
                        font-size:14px;
                    "
                >
                    Τηλέφωνο:
                    ${escapeHtml(
                        customer.phone1 || "-"
                    )}

                    &nbsp; | &nbsp;

                    Περιοχή:
                    ${escapeHtml(
                        customer.area || "-"
                    )}
                </div>

            </div>
        `;


        if (history.length === 0) {

            html += `
                <div
                    style="
                        padding:30px;
                        text-align:center;
                    "
                >
                    Δεν υπάρχουν ακόμη
                    παραγγελίες για αυτόν
                    τον πελάτη.
                </div>
            `;

            content.innerHTML =
                html;

            return;
        }


        html += `

            <div
                style="
                    overflow-x:auto;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        font-size:14px;
                    "
                >

                    <thead>

                        <tr>

                            <th style="padding:10px;text-align:left;">
                                Ημερομηνία
                            </th>

                            <th style="padding:10px;text-align:left;">
                                Παράδοση
                            </th>

                            <th style="padding:10px;text-align:left;">
                                Παραλαβή
                            </th>

                            <th style="padding:10px;text-align:left;">
                                Χρησιδάνειο
                            </th>

                            <th style="padding:10px;text-align:left;">
                                Κατάσταση
                            </th>

                            <th style="padding:10px;text-align:left;">
                                Παρατηρήσεις
                            </th>

                        </tr>

                    </thead>

                    <tbody>
        `;


        history.forEach(
            (order) => {

                const products =
                    buildProductText(
                        order
                    );


                html += `

                    <tr
                        style="
                            border-top:
                                1px solid #e5e5e5;
                        "
                    >

                        <td
                            style="
                                padding:10px;
                                vertical-align:top;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHtml(
                                formatHistoryDate(
                                    order.created_at
                                )
                            )}
                        </td>


                        <td
                            style="
                                padding:10px;
                                vertical-align:top;
                            "
                        >
                            ${escapeHtml(
                                products.delivery
                            )}
                        </td>


                        <td
                            style="
                                padding:10px;
                                vertical-align:top;
                            "
                        >
                            ${escapeHtml(
                                products.returns
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                products.loans
                            )}
                        </td>


                        <td
                            style="
                                padding:10px;
                                vertical-align:top;
                            "
                        >
                            ${escapeHtml(
                                getHistoryStatusText(
                                    order.status
                                )
                            )}
                        </td>


                        <td
                            style="
                                padding:10px;
                                vertical-align:top;
                            "
                        >
                            ${escapeHtml(
                                order.order_notes ||
                                "-"
                            )}
                        </td>

                    </tr>
                `;
            }
        );


        html += `

                    </tbody>
                </table>

            </div>
        `;


        content.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Σφάλμα ιστορικού πελάτη:",
            error
        );

        content.innerHTML =
            "Δεν υπάρχει σύνδεση με τον server.";
    }
}


function createCustomerHistoryUI() {

    const saveButton =
        document.getElementById(
            "saveCustomerBtn"
        );

    if (!saveButton) {
        return;
    }


    let historyButton =
        document.getElementById(
            "customerHistoryBtn"
        );


    if (!historyButton) {

        historyButton =
            document.createElement(
                "button"
            );

        historyButton.id =
            "customerHistoryBtn";

        historyButton.type =
            "button";

        historyButton.textContent =
            "Ιστορικό Πελάτη";

        historyButton.style.marginTop =
            "10px";

        historyButton.style.width =
            "100%";

        historyButton.style.padding =
            "12px";

        historyButton.style.border =
            "none";

        historyButton.style.borderRadius =
            "8px";

        historyButton.style.cursor =
            "pointer";

        historyButton.style.fontWeight =
            "700";


        saveButton.insertAdjacentElement(
            "afterend",
            historyButton
        );
    }


    let modal =
        document.getElementById(
            "customerHistoryModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "customerHistoryModal";

        modal.style.display =
            "none";

        modal.style.position =
            "fixed";

        modal.style.inset =
            "0";

        modal.style.background =
            "rgba(0, 0, 0, 0.45)";

        modal.style.zIndex =
            "9999";

        modal.style.padding =
            "30px";

        modal.style.overflowY =
            "auto";


        modal.innerHTML = `

            <div
                style="
                    max-width:1100px;
                    margin:30px auto;
                    background:#ffffff;
                    border-radius:14px;
                    padding:24px;
                    box-shadow:
                        0 15px 50px
                        rgba(0,0,0,0.20);
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:
                            space-between;
                        align-items:center;
                        gap:20px;
                        margin-bottom:20px;
                    "
                >

                    <div>

                        <div
                            style="
                                color:#5b2ca0;
                                font-size:13px;
                                font-weight:800;
                            "
                        >
                            ΚΑΡΤΕΛΑ ΠΕΛΑΤΗ
                        </div>

                        <h2
                            style="
                                margin:
                                    4px 0 0 0;
                            "
                        >
                            Ιστορικό Πελάτη
                        </h2>

                    </div>


                    <button
                        id="closeCustomerHistoryBtn"
                        type="button"
                        style="
                            border:none;
                            background:#f1f1f1;
                            border-radius:8px;
                            width:40px;
                            height:40px;
                            cursor:pointer;
                            font-size:20px;
                        "
                    >
                        ×
                    </button>

                </div>


                <div
                    id="customerHistoryContent"
                >
                    Φόρτωση ιστορικού...
                </div>

            </div>
        `;


        document.body.appendChild(
            modal
        );
    }


    historyButton.addEventListener(
        "click",
        async () => {

            if (
                typeof currentCustomerId ===
                    "undefined" ||
                currentCustomerId === null
            ) {

                alert(
                    "Επίλεξε πρώτα έναν πελάτη."
                );

                return;
            }


            modal.style.display =
                "block";


            await loadCustomerHistory();
        }
    );


    const closeButton =
        document.getElementById(
            "closeCustomerHistoryBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.style.display =
                    "none";
            }
        );
    }


    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {

                modal.style.display =
                    "none";
            }
        }
    );
}


createCustomerHistoryUI();