// =========================================================
// ALLGASKLIMA CRM
// CUSTOMERS.JS
// =========================================================


// =========================================================
// ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ
// =========================================================

const searchBtn =
    document.getElementById("searchBtn");

const phoneInput =
    document.getElementById("phone");

const result =
    document.getElementById("result");

const newCustomerForm =
    document.getElementById("newCustomerForm");

const newCustomerBtn =
    document.getElementById("newCustomerBtn");

const fullnameInput =
    document.getElementById("fullname");

const phone1Input =
    document.getElementById("phone1");

const phone2Input =
    document.getElementById("phone2");

const phone3Input =
    document.getElementById("phone3");

const areaInput =
    document.getElementById("area");

const addressInput =
    document.getElementById("address");

const floorInput =
    document.getElementById("floor");

const notesInput =
    document.getElementById("notes");

const saveCustomerBtn =
    document.getElementById("saveCustomerBtn");


// =========================================================
// ΦΙΑΛΕΣ ΠΕΛΑΤΗ
// =========================================================

const cylinderScrew =
    document.getElementById("cylinderScrew");

const cylinderClip =
    document.getElementById("cylinderClip");

const cylinder3kg =
    document.getElementById("cylinder3kg");

const cylinder10Mix =
    document.getElementById("cylinder10Mix");

const cylinder10Propane =
    document.getElementById("cylinder10Propane");

const cylinder13kg =
    document.getElementById("cylinder13kg");

const cylinder25kg =
    document.getElementById("cylinder25kg");

const cylinderBarrel =
    document.getElementById("cylinderBarrel");

const cylinderShort =
    document.getElementById("cylinderShort");

const cylinderTall =
    document.getElementById("cylinderTall");


// =========================================================
// ΧΡΗΣΙΔΑΝΕΙΟ
// =========================================================

const loanHeatersInput =
    document.getElementById("loanHeaters");

const loanEmptyCylindersInput =
    document.getElementById("loanEmptyCylinders");


// =========================================================
// ΤΡΕΧΩΝ ΠΕΛΑΤΗΣ
// =========================================================

let currentCustomerId = null;


// =========================================================
// ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ
// =========================================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function cleanValue(value) {
    if (
        value === null ||
        value === undefined ||
        value === "None" ||
        value === "null"
    ) {
        return "";
    }

    return String(value);
}


function isProbablyPhone(value) {
    const text =
        String(value ?? "")
            .trim()
            .replace(/\s+/g, "");

    if (!text) {
        return false;
    }

    return /^[+0-9()-]{6,}$/.test(text);
}


function safeNonNegativeNumber(value) {
    const number =
        Number(value || 0);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.trunc(number)
    );
}


function showResultMessage(
    message,
    className = ""
) {
    if (!result) {
        return;
    }

    if (!className) {
        result.textContent = message;
        return;
    }

    result.innerHTML = `
        <div class="${className}">
            ${message}
        </div>
    `;
}


// =========================================================
// ΕΝΗΜΕΡΩΣΗ ΑΡΙΘΜΟΥ ΠΕΛΑΤΩΝ
// =========================================================

async function updateCustomerNumber() {
    const customerNumber =
        document.getElementById(
            "customerNumber"
        );

    if (!customerNumber) {
        return;
    }

    try {
        const response =
            await fetch(
                "/api/customers",
                {
                    cache: "no-store"
                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success &&
            Array.isArray(data.customers)
        ) {
            customerNumber.textContent =
                data.customers.length;
        }

    } catch (error) {
        console.error(
            "Σφάλμα ενημέρωσης αριθμού πελατών:",
            error
        );
    }
}


// =========================================================
// ΚΑΘΑΡΙΣΜΟΣ ΦΟΡΜΑΣ ΠΕΛΑΤΗ
// =========================================================

function clearCustomerForm(
    preserveCylinders = false
) {
    if (fullnameInput) {
        fullnameInput.value = "";
    }

    if (phone1Input) {
        phone1Input.value = "";
    }

    if (phone2Input) {
        phone2Input.value = "";
    }

    if (phone3Input) {
        phone3Input.value = "";
    }

    if (areaInput) {
        areaInput.value = "";
    }

    if (addressInput) {
        addressInput.value = "";
    }

    if (floorInput) {
        floorInput.value = "";
    }

    if (notesInput) {
        notesInput.value = "";
    }

    if (loanHeatersInput) {
        loanHeatersInput.value = "";
    }

    if (loanEmptyCylindersInput) {
        loanEmptyCylindersInput.value = "";
    }

    if (!preserveCylinders) {
        [
            cylinderScrew,
            cylinderClip,
            cylinder3kg,
            cylinder10Mix,
            cylinder10Propane,
            cylinder13kg,
            cylinder25kg,
            cylinderBarrel,
            cylinderShort,
            cylinderTall
        ].forEach(
            (checkbox) => {
                if (checkbox) {
                    checkbox.checked = false;
                }
            }
        );
    }

    const retailInput =
        document.querySelector(
            'input[name="customerType"][value="retail"]'
        );

    if (retailInput) {
        retailInput.checked = true;
    }

    currentCustomerId = null;
}


// =========================================================
// ΣΥΜΠΛΗΡΩΣΗ ΦΟΡΜΑΣ ΠΕΛΑΤΗ
// =========================================================

function fillCustomerForm(customer) {
    if (!customer) {
        return;
    }

    currentCustomerId =
        customer.id ?? null;

    if (fullnameInput) {
        fullnameInput.value =
            cleanValue(
                customer.fullname
            );
    }

    if (phone1Input) {
        phone1Input.value =
            cleanValue(
                customer.phone1
            );
    }

    if (phone2Input) {
        phone2Input.value =
            cleanValue(
                customer.phone2
            );
    }

    if (phone3Input) {
        phone3Input.value =
            cleanValue(
                customer.phone3
            );
    }

    if (areaInput) {
        areaInput.value =
            cleanValue(
                customer.area
            );
    }

    if (addressInput) {
        addressInput.value =
            cleanValue(
                customer.address
            );
    }

    if (floorInput) {
        floorInput.value =
            cleanValue(
                customer.floor
            );
    }

    if (notesInput) {
        notesInput.value =
            cleanValue(
                customer.notes
            );
    }

    if (cylinderScrew) {
        cylinderScrew.checked =
            Boolean(
                Number(
                    customer.cylinder_screw || 0
                )
            );
    }

    if (cylinderClip) {
        cylinderClip.checked =
            Boolean(
                Number(
                    customer.cylinder_clip || 0
                )
            );
    }

    if (cylinder3kg) {
        cylinder3kg.checked =
            Boolean(
                Number(
                    customer.cylinder_3kg || 0
                )
            );
    }

    if (cylinder10Mix) {
        cylinder10Mix.checked =
            Boolean(
                Number(
                    customer.cylinder_10_mix || 0
                )
            );
    }

    if (cylinder10Propane) {
        cylinder10Propane.checked =
            Boolean(
                Number(
                    customer.cylinder_10_propane || 0
                )
            );
    }

    if (cylinder13kg) {
        cylinder13kg.checked =
            Boolean(
                Number(
                    customer.cylinder_13kg || 0
                )
            );
    }

    if (cylinder25kg) {
        cylinder25kg.checked =
            Boolean(
                Number(
                    customer.cylinder_25kg || 0
                )
            );
    }

    if (cylinderBarrel) {
        cylinderBarrel.checked =
            Boolean(
                Number(
                    customer.cylinder_barrel || 0
                )
            );
    }

    if (cylinderShort) {
        cylinderShort.checked =
            Boolean(
                Number(
                    customer.cylinder_short || 0
                )
            );
    }

    if (cylinderTall) {
        cylinderTall.checked =
            Boolean(
                Number(
                    customer.cylinder_tall || 0
                )
            );
    }

    if (loanHeatersInput) {
        const value =
            Number(
                customer.loan_heaters || 0
            );

        loanHeatersInput.value =
            value > 0
                ? value
                : "";
    }

    if (loanEmptyCylindersInput) {
        const value =
            Number(
                customer.loan_empty_cylinders || 0
            );

        loanEmptyCylindersInput.value =
            value > 0
                ? value
                : "";
    }

    const customerType =
        customer.customer_type ||
        "retail";

    const customerTypeInput =
        document.querySelector(
            `input[name="customerType"][value="${customerType}"]`
        );

    if (customerTypeInput) {
        customerTypeInput.checked = true;
    }
}


// =========================================================
// ΝΕΟΣ ΠΕΛΑΤΗΣ
// =========================================================

function startNewCustomer() {
    clearCustomerForm();

    if (phoneInput) {
        phoneInput.value = "";
    }

    if (result) {
        result.innerHTML = "";
    }

    const orderQuantityIds = [
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

    orderQuantityIds.forEach(
        (id) => {
            const input =
                document.getElementById(id);

            if (input) {
                input.value = "";

                if (
                    input.dataset.value !==
                    undefined
                ) {
                    input.dataset.value = "";
                }
            }
        }
    );

    document
        .querySelectorAll(
            '.order-card input[type="number"]'
        )
        .forEach(
            (input) => {
                if (
                    input.id !==
                    "loanHeaters" &&
                    input.id !==
                    "loanEmptyCylinders"
                ) {
                    input.value = "";
                }
            }
        );

    const orderNotesInput =
        document.getElementById(
            "orderNotes"
        );

    if (orderNotesInput) {
        orderNotesInput.value = "";
    }

    const importantNotesInput =
        document.querySelector(
            ".large-notes"
        );

    if (importantNotesInput) {
        importantNotesInput.value = "";
    }

    if (newCustomerForm) {
        newCustomerForm
            .classList
            .remove("hidden");
    }

    if (fullnameInput) {
        fullnameInput.focus();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// ΑΝΑΖΗΤΗΣΗ ΠΕΛΑΤΗ
// =========================================================

async function searchCustomer() {
    const searchText =
        phoneInput
            ? phoneInput.value.trim()
            : "";

    if (!searchText) {
        showResultMessage(
            "Γράψε όνομα, επώνυμο ή αριθμό τηλεφώνου."
        );

        return;
    }

    showResultMessage(
        "Αναζήτηση..."
    );

    try {
        const response =
            await fetch(
                "/api/customer?phone=" +
                encodeURIComponent(
                    searchText
                ),
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
            showResultMessage(
                data.message ||
                "Παρουσιάστηκε σφάλμα στην αναζήτηση."
            );

            return;
        }

        // =================================================
        // ΠΟΛΛΑ ΑΠΟΤΕΛΕΣΜΑΤΑ
        // =================================================

        if (data.multiple) {
            clearCustomerForm();

            showResultMessage(
                escapeHtml(
                    data.message ||
                    "Βρέθηκαν περισσότεροι πελάτες. Γράψε πιο συγκεκριμένα στοιχεία."
                ),
                "incoming-call-message"
            );

            if (phoneInput) {
                phoneInput.focus();
                phoneInput.select();
            }

            return;
        }

        // =================================================
        // ΔΕΝ ΒΡΕΘΗΚΕ
        // =================================================

        if (!data.found) {
            clearCustomerForm();

            showResultMessage(
                `Δεν βρέθηκε πελάτης με: <strong>${escapeHtml(searchText)}</strong>`,
                "incoming-call-message"
            );

            if (
                isProbablyPhone(
                    searchText
                )
            ) {
                if (phone1Input) {
                    phone1Input.value =
                        searchText;
                }

                if (fullnameInput) {
                    fullnameInput.focus();
                }

            } else {
                if (fullnameInput) {
                    fullnameInput.value =
                        searchText;
                }

                if (phone1Input) {
                    phone1Input.focus();
                }
            }

            if (newCustomerForm) {
                newCustomerForm
                    .classList
                    .remove("hidden");
            }

            return;
        }

        // =================================================
        // ΒΡΕΘΗΚΕ ΠΕΛΑΤΗΣ
        // =================================================

        fillCustomerForm(
            data.customer
        );

        if (newCustomerForm) {
            newCustomerForm
                .classList
                .remove("hidden");
        }

        showResultMessage(
            `Βρέθηκε ο πελάτης: <strong>${escapeHtml(
                data.customer?.fullname || ""
            )}</strong>`,
            "success-message"
        );

        if (newCustomerForm) {
            newCustomerForm
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }

    } catch (error) {
        console.error(
            "Σφάλμα αναζήτησης πελάτη:",
            error
        );

        showResultMessage(
            "Σφάλμα επικοινωνίας με τον server."
        );
    }
}


// =========================================================
// ΑΠΟΘΗΚΕΥΣΗ / ΕΝΗΜΕΡΩΣΗ ΠΕΛΑΤΗ
// =========================================================

async function saveCustomer(event) {
    if (event) {
        event.preventDefault();
    }

    console.log(
        "SAVE CUSTOMER BUTTON CLICK"
    );

    const customerData = {
        fullname:
            fullnameInput?.value.trim() || "",

        phone1:
            phone1Input?.value.trim() || "",

        phone2:
            phone2Input?.value.trim() || "",

        phone3:
            phone3Input?.value.trim() || "",

        area:
            areaInput?.value.trim() || "",

        address:
            addressInput?.value.trim() || "",

        floor:
            floorInput?.value.trim() || "",

        notes:
            notesInput?.value.trim() || "",

        cylinder_screw:
            Boolean(
                cylinderScrew?.checked
            ),

        cylinder_clip:
            Boolean(
                cylinderClip?.checked
            ),

        cylinder_3kg:
            Boolean(
                cylinder3kg?.checked
            ),

        cylinder_10_mix:
            Boolean(
                cylinder10Mix?.checked
            ),

        cylinder_10_propane:
            Boolean(
                cylinder10Propane?.checked
            ),

        cylinder_13kg:
            Boolean(
                cylinder13kg?.checked
            ),

        cylinder_25kg:
            Boolean(
                cylinder25kg?.checked
            ),

        cylinder_barrel:
            Boolean(
                cylinderBarrel?.checked
            ),

        cylinder_short:
            Boolean(
                cylinderShort?.checked
            ),

        cylinder_tall:
            Boolean(
                cylinderTall?.checked
            ),

        loan_heaters:
            safeNonNegativeNumber(
                loanHeatersInput?.value
            ),

        loan_empty_cylinders:
            safeNonNegativeNumber(
                loanEmptyCylindersInput?.value
            ),

        customer_type:
            document.querySelector(
                'input[name="customerType"]:checked'
            )?.value || "retail"
    };

    console.log(
        "CUSTOMER DATA:",
        customerData
    );

    // =====================================================
    // ΕΛΕΓΧΟΣ ΟΝΟΜΑΤΟΣ
    // =====================================================

    if (!customerData.fullname) {
        showResultMessage(
            "Το ονοματεπώνυμο είναι υποχρεωτικό."
        );

        fullnameInput?.focus();

        return;
    }

    // =====================================================
    // ΕΛΕΓΧΟΣ ΤΗΛΕΦΩΝΟΥ
    // =====================================================

    if (!customerData.phone1) {
        showResultMessage(
            "Το κύριο τηλέφωνο είναι υποχρεωτικό."
        );

        phone1Input?.focus();

        return;
    }

    // =====================================================
    // POST / PUT
    // =====================================================

    const isExistingCustomer =
        currentCustomerId !== null;

    const url =
        isExistingCustomer
            ? `/api/customer/${currentCustomerId}`
            : "/api/customer";

    const method =
        isExistingCustomer
            ? "PUT"
            : "POST";

    console.log(
        "SAVE REQUEST:",
        method,
        url
    );

    if (saveCustomerBtn) {
        saveCustomerBtn.disabled =
            true;

        saveCustomerBtn.textContent =
            "Αποθήκευση...";
    }

    showResultMessage(
        "Γίνεται αποθήκευση..."
    );

    try {
        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            customerData
                        )
                }
            );

        const responseText =
            await response.text();

        console.log(
            "SERVER STATUS:",
            response.status
        );

        console.log(
            "SERVER RESPONSE:",
            responseText
        );

        let data;

        try {
            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {
            console.error(
                "JSON ERROR:",
                jsonError
            );

            showResultMessage(
                "Ο server επέστρεψε μη έγκυρη απάντηση."
            );

            return;
        }

        if (
            !response.ok ||
            !data.success
        ) {
            showResultMessage(
                data.message ||
                "Δεν έγινε η αποθήκευση."
            );

            return;
        }

        if (data.customer) {
            currentCustomerId =
                data.customer.id ?? null;

            fillCustomerForm(
                data.customer
            );

            if (phoneInput) {
                phoneInput.value =
                    data.customer.phone1 ||
                    customerData.phone1;
            }
        }

        showResultMessage(
            isExistingCustomer
                ? "Τα στοιχεία του πελάτη ενημερώθηκαν επιτυχώς."
                : "Ο πελάτης αποθηκεύτηκε επιτυχώς.",
            "success-message"
        );

        await updateCustomerNumber();

    } catch (error) {
        console.error(
            "Σφάλμα αποθήκευσης πελάτη:",
            error
        );

        showResultMessage(
            "Σφάλμα επικοινωνίας κατά την αποθήκευση."
        );

    } finally {
        if (saveCustomerBtn) {
            saveCustomerBtn.disabled =
                false;

            saveCustomerBtn.textContent =
                "Αποθήκευση πελάτη";
        }
    }
}


// =========================================================
// ΕΥΡΕΤΗΡΙΟ ΠΕΛΑΤΩΝ
// =========================================================

const customerDirectoryBtn =
    document.getElementById(
        "customerDirectoryBtn"
    );

const customerDirectoryModal =
    document.getElementById(
        "customerDirectoryModal"
    );

const closeCustomerDirectoryBtn =
    document.getElementById(
        "closeCustomerDirectoryBtn"
    );

const customerDirectoryBody =
    document.getElementById(
        "customerDirectoryBody"
    );

const customerDirectorySearch =
    document.getElementById(
        "customerDirectorySearch"
    );


// =========================================================
// ΑΝΟΙΓΜΑ ΕΥΡΕΤΗΡΙΟΥ
// =========================================================

async function openCustomerDirectory() {
    if (!customerDirectoryModal) {
        return;
    }

    customerDirectoryModal
        .classList
        .remove("hidden");

    if (customerDirectoryBody) {
        customerDirectoryBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Φόρτωση πελατών...
                </td>
            </tr>
        `;
    }

    try {
        const response =
            await fetch(
                "/api/customers",
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
            if (customerDirectoryBody) {
                customerDirectoryBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Δεν ήταν δυνατή η φόρτωση του ευρετηρίου.
                        </td>
                    </tr>
                `;
            }

            return;
        }

        window.customerDirectoryList =
            Array.isArray(
                data.customers
            )
                ? data.customers
                : [];

        renderCustomerDirectory(
            window.customerDirectoryList
        );

    } catch (error) {
        console.error(
            "Σφάλμα ευρετηρίου πελατών:",
            error
        );

        if (customerDirectoryBody) {
            customerDirectoryBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Σφάλμα επικοινωνίας με τον server.
                    </td>
                </tr>
            `;
        }
    }
}


// =========================================================
// ΕΜΦΑΝΙΣΗ ΕΥΡΕΤΗΡΙΟΥ
// =========================================================

function renderCustomerDirectory(
    customers
) {
    if (!customerDirectoryBody) {
        return;
    }

    if (
        !Array.isArray(customers) ||
        customers.length === 0
    ) {
        customerDirectoryBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Δεν υπάρχουν αποθηκευμένοι πελάτες.
                </td>
            </tr>
        `;

        return;
    }

    customerDirectoryBody.innerHTML =
        customers
            .map(
                (customer, index) => `
                    <tr
                        data-customer-id="${customer.id}"
                    >
                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.fullname || ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.phone1 || ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.area || ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.address || ""
                            )}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="delete-customer-btn"
                                data-customer-id="${customer.id}"
                            >
                                Διαγραφή
                            </button>
                        </td>
                    </tr>
                `
            )
            .join("");
}


// =========================================================
// ΑΝΑΖΗΤΗΣΗ ΕΥΡΕΤΗΡΙΟΥ
// =========================================================

if (customerDirectorySearch) {
    customerDirectorySearch
        .addEventListener(
            "input",
            () => {
                const searchText =
                    customerDirectorySearch
                        .value
                        .trim()
                        .toLowerCase();

                const customers =
                    window.customerDirectoryList ||
                    [];

                if (!searchText) {
                    renderCustomerDirectory(
                        customers
                    );

                    return;
                }

                const filteredCustomers =
                    customers.filter(
                        (customer) => {
                            const text = [
                                customer.fullname,
                                customer.phone1,
                                customer.phone2,
                                customer.phone3,
                                customer.area,
                                customer.address
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                            return text.includes(
                                searchText
                            );
                        }
                    );

                renderCustomerDirectory(
                    filteredCustomers
                );
            }
        );
}


// =========================================================
// ΚΛΕΙΣΙΜΟ ΕΥΡΕΤΗΡΙΟΥ
// =========================================================

function closeCustomerDirectory() {
    if (customerDirectoryModal) {
        customerDirectoryModal
            .classList
            .add("hidden");
    }

    if (customerDirectorySearch) {
        customerDirectorySearch.value =
            "";
    }
}


// =========================================================
// ΚΛΙΚ ΣΤΟ ΕΥΡΕΤΗΡΙΟ
// =========================================================

if (customerDirectoryBody) {
    customerDirectoryBody
        .addEventListener(
            "click",
            (event) => {
                const deleteButton =
                    event.target.closest(
                        ".delete-customer-btn"
                    );

                if (deleteButton) {
                    event.stopPropagation();

                    const customerId =
                        deleteButton.dataset
                            .customerId;

                    deleteCustomer(
                        customerId
                    );

                    return;
                }

                const row =
                    event.target.closest(
                        "tr[data-customer-id]"
                    );

                if (!row) {
                    return;
                }

                const customerId =
                    Number(
                        row.dataset.customerId
                    );

                const customer =
                    window.customerDirectoryList
                        ?.find(
                            (item) =>
                                Number(item.id) ===
                                customerId
                        );

                if (!customer) {
                    return;
                }

                fillCustomerForm(
                    customer
                );

                if (phoneInput) {
                    phoneInput.value =
                        customer.phone1 || "";
                }

                showResultMessage(
                    `Επιλέχθηκε ο πελάτης: <strong>${escapeHtml(
                        customer.fullname || ""
                    )}</strong>`,
                    "success-message"
                );

                closeCustomerDirectory();

                if (newCustomerForm) {
                    newCustomerForm
                        .classList
                        .remove("hidden");

                    newCustomerForm
                        .scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });
                }
            }
        );
}


// =========================================================
// ΔΙΑΓΡΑΦΗ ΠΕΛΑΤΗ
// =========================================================

async function deleteCustomer(
    customerId
) {
    const confirmed =
        confirm(
            "Σίγουρα θέλεις να διαγράψεις αυτόν τον πελάτη;"
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `/api/customer/${customerId}`,
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
                "Δεν έγινε η διαγραφή του πελάτη."
            );

            return;
        }

        if (
            currentCustomerId !== null &&
            Number(currentCustomerId) ===
            Number(customerId)
        ) {
            clearCustomerForm();

            if (phoneInput) {
                phoneInput.value = "";
            }

            showResultMessage(
                "Ο πελάτης διαγράφηκε.",
                "success-message"
            );
        }

        await openCustomerDirectory();
        await updateCustomerNumber();

    } catch (error) {
        console.error(
            "Σφάλμα διαγραφής πελάτη:",
            error
        );

        alert(
            "Σφάλμα: " +
            error.message
        );
    }
}


// =========================================================
// EVENT LISTENERS
// =========================================================

if (customerDirectoryBtn) {
    customerDirectoryBtn
        .addEventListener(
            "click",
            openCustomerDirectory
        );
}


if (closeCustomerDirectoryBtn) {
    closeCustomerDirectoryBtn
        .addEventListener(
            "click",
            closeCustomerDirectory
        );
}


if (searchBtn) {
    searchBtn
        .addEventListener(
            "click",
            searchCustomer
        );
}


// =========================================================
// ΚΟΥΜΠΙ ΑΠΟΘΗΚΕΥΣΗΣ
// =========================================================

if (saveCustomerBtn) {
    console.log(
        "saveCustomerBtn ΒΡΕΘΗΚΕ:",
        saveCustomerBtn
    );

    saveCustomerBtn
        .addEventListener(
            "click",
            saveCustomer
        );

} else {
    console.error(
        "ΔΕΝ ΒΡΕΘΗΚΕ ΤΟ saveCustomerBtn"
    );
}


if (phoneInput) {
    phoneInput
        .addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key ===
                    "Enter"
                ) {
                    event.preventDefault();

                    searchCustomer();
                }
            }
        );
}


if (newCustomerBtn) {
    newCustomerBtn
        .addEventListener(
            "click",
            startNewCustomer
        );
}


// =========================================================
// ΑΡΧΙΚΗ ΕΝΗΜΕΡΩΣΗ
// =========================================================

updateCustomerNumber();