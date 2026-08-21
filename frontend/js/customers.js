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
    document.getElementById(
        "loanEmptyCylinders"
    );


// =========================================================
// ΚΟΥΜΠΙ ΑΠΟΘΗΚΕΥΣΗΣ
// =========================================================

const saveCustomerBtn =
    document.getElementById(
        "saveCustomerBtn"
    );


// =========================================================
// ΤΡΕΧΩΝ ΠΕΛΑΤΗΣ
// =========================================================

let currentCustomerId = null;


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


    // Χρησιδάνειο μανιταριών
    if (loanHeatersInput) {
        loanHeatersInput.value = "";
    }


    // Χρησιδάνειο κενών φιαλών
    if (loanEmptyCylindersInput) {
        loanEmptyCylindersInput.value = "";
    }


    // Καθαρισμός checkbox φιαλών
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


    currentCustomerId = null;

    updateCustomerNumber();
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


    const cleanValue = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === "None" ||
            value === "null"
        ) {
            return "";
        }

        return String(value);
    };


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


    // =====================================================
    // ΤΥΠΟΙ ΦΙΑΛΩΝ
    // =====================================================

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


    // =====================================================
    // ΣΧΗΜΑ ΦΙΑΛΗΣ 10KG
    // =====================================================

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


    // =====================================================
    // ΧΡΗΣΙΔΑΝΕΙΟ ΜΑΝΙΤΑΡΙΩΝ
    // =====================================================

    if (loanHeatersInput) {

        const loanHeatersValue =
            Number(
                customer.loan_heaters || 0
            );

        loanHeatersInput.value =
            loanHeatersValue > 0
                ? loanHeatersValue
                : "";
    }


    // =====================================================
    // ΧΡΗΣΙΔΑΝΕΙΟ ΚΕΝΩΝ ΦΙΑΛΩΝ
    // =====================================================

    if (loanEmptyCylindersInput) {

        const loanEmptyCylindersValue =
            Number(
                customer.loan_empty_cylinders ||
                0
            );

        loanEmptyCylindersInput.value =
            loanEmptyCylindersValue > 0
                ? loanEmptyCylindersValue
                : "";
    }


    updateCustomerNumber();
}




// =========================================================
// ΝΕΟΣ ΠΕΛΑΤΗΣ
// =========================================================

function startNewCustomer() {

    currentCustomerId = null;


    if (phoneInput) {
        phoneInput.value = "";
    }

    if (result) {
        result.innerHTML = "";
    }


    // Καθαρισμός πελάτη
    clearCustomerForm();


    // =====================================================
    // ΚΑΘΑΡΙΣΜΟΣ ΠΟΣΟΤΗΤΩΝ ΠΑΡΑΓΓΕΛΙΑΣ
    // =====================================================

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


    // Επιπλέον ασφάλεια:
    // καθαρίζει όλα τα number inputs
    // της παραγγελίας, αλλά ΟΧΙ τα χρησιδάνεια.

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


    // Καθαρισμός χρησιδανείων

    if (loanHeatersInput) {
        loanHeatersInput.value = "";
    }

    if (loanEmptyCylindersInput) {
        loanEmptyCylindersInput.value = "";
    }


    // =====================================================
    // ΣΗΜΕΙΩΣΕΙΣ ΠΑΡΑΓΓΕΛΙΑΣ
    // =====================================================

    const orderNotesInput =
        document.getElementById(
            "orderNotes"
        );

    if (orderNotesInput) {
        orderNotesInput.value = "";
    }


    // =====================================================
    // ΣΗΜΑΝΤΙΚΕΣ ΠΑΡΑΤΗΡΗΣΕΙΣ
    // =====================================================

    const importantNotesInput =
        document.querySelector(
            ".large-notes"
        );

    if (importantNotesInput) {
        importantNotesInput.value = "";
    }


    // Εμφάνιση φόρμας

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


    if (searchText === "") {

        if (result) {
            result.innerHTML =
                "Γράψε όνομα, επώνυμο ή αριθμό τηλεφώνου.";
        }

        return;
    }


    if (result) {
        result.innerHTML =
            "Αναζήτηση...";
    }


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

            if (result) {
                result.innerHTML =
                    data.message ||
                    "Παρουσιάστηκε σφάλμα στην αναζήτηση.";
            }

            return;
        }


        // =================================================
        // ΠΟΛΛΑ ΑΠΟΤΕΛΕΣΜΑΤΑ
        // =================================================

        if (data.multiple) {

            clearCustomerForm();

            if (result) {

                result.innerHTML = `
                    <div class="incoming-call-message">
                        ${escapeHtml(
                            data.message ||
                            "Βρέθηκαν περισσότεροι πελάτες. Γράψε τηλέφωνο ή πιο συγκεκριμένα στοιχεία."
                        )}
                    </div>
                `;
            }


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


            if (result) {

                result.innerHTML = `
                    <div class="incoming-call-message">
                        Δεν βρέθηκε πελάτης με:
                        <strong>
                            ${escapeHtml(
                                searchText
                            )}
                        </strong>
                    </div>
                `;
            }


            if (
                isProbablyPhone(
                    searchText
                )
            ) {

                if (phone1Input) {
                    phone1Input.value =
                        searchText;
                }

            } else {

                if (fullnameInput) {
                    fullnameInput.value =
                        searchText;
                }
            }


            if (newCustomerForm) {

                newCustomerForm
                    .classList
                    .remove("hidden");
            }


            if (
                isProbablyPhone(
                    searchText
                )
            ) {

                if (fullnameInput) {
                    fullnameInput.focus();
                }

            } else {

                if (phone1Input) {
                    phone1Input.focus();
                }
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


        if (result) {

            result.innerHTML = `
                <div class="success-message">
                    Βρέθηκε ο πελάτης:
                    <strong>
                        ${escapeHtml(
                            data.customer.fullname ||
                            ""
                        )}
                    </strong>
                </div>
            `;
        }


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


        if (result) {
            result.innerHTML =
                "Δεν υπάρχει σύνδεση με τον server.";
        }
    }
}


// =========================================================
// ΑΠΟΘΗΚΕΥΣΗ / ΕΝΗΜΕΡΩΣΗ ΠΕΛΑΤΗ
// =========================================================

async function saveCustomer() {

    const customerData = {

        fullname:
            fullnameInput
                ? fullnameInput.value.trim()
                : "",

        phone1:
            phone1Input
                ? phone1Input.value.trim()
                : "",

        phone2:
            phone2Input
                ? phone2Input.value.trim()
                : "",

        phone3:
            phone3Input
                ? phone3Input.value.trim()
                : "",

        area:
            areaInput
                ? areaInput.value.trim()
                : "",

        address:
            addressInput
                ? addressInput.value.trim()
                : "",

        floor:
            floorInput
                ? floorInput.value.trim()
                : "",

        notes:
            notesInput
                ? notesInput.value.trim()
                : "",


        // =================================================
        // ΦΙΑΛΕΣ
        // =================================================

        cylinder_screw:
            cylinderScrew?.checked ||
            false,

        cylinder_clip:
            cylinderClip?.checked ||
            false,

        cylinder_3kg:
            cylinder3kg?.checked ||
            false,

        cylinder_10_mix:
            cylinder10Mix?.checked ||
            false,

        cylinder_10_propane:
            cylinder10Propane?.checked ||
            false,

        cylinder_13kg:
            cylinder13kg?.checked ||
            false,

        cylinder_25kg:
            cylinder25kg?.checked ||
            false,


        // =================================================
        // ΣΧΗΜΑ 10KG
        // =================================================

        cylinder_barrel:
            cylinderBarrel?.checked ||
            false,

        cylinder_short:
            cylinderShort?.checked ||
            false,

        cylinder_tall:
            cylinderTall?.checked ||
            false,


        // =================================================
        // ΧΡΗΣΙΔΑΝΕΙΑ
        // =================================================

        loan_heaters:
            Number(
                loanHeatersInput?.value ||
                0
            ),

        loan_empty_cylinders:
            Number(
                loanEmptyCylindersInput?.value ||
                0
            )
    };


    // =====================================================
    // ΕΛΕΓΧΟΣ ΟΝΟΜΑΤΟΣ
    // =====================================================

    if (
        customerData.fullname === ""
    ) {

        if (result) {
            result.innerHTML =
                "Το ονοματεπώνυμο είναι υποχρεωτικό.";
        }

        if (fullnameInput) {
            fullnameInput.focus();
        }

        return;
    }


    // =====================================================
    // ΕΛΕΓΧΟΣ ΤΗΛΕΦΩΝΟΥ
    // =====================================================

    if (
        customerData.phone1 === ""
    ) {

        if (result) {
            result.innerHTML =
                "Το κύριο τηλέφωνο είναι υποχρεωτικό.";
        }

        if (phone1Input) {
            phone1Input.focus();
        }

        return;
    }


    // =====================================================
    // ΚΛΕΙΔΩΜΑ ΚΟΥΜΠΙΟΥ
    // =====================================================

    if (saveCustomerBtn) {

        saveCustomerBtn.disabled =
            true;

        saveCustomerBtn.textContent =
            "Αποθήκευση...";
    }


    if (result) {
        result.innerHTML =
            "Γίνεται αποθήκευση...";
    }


    try {

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


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            if (result) {

                result.innerHTML =
                    data.message ||
                    "Δεν έγινε η αποθήκευση.";
            }

            return;
        }


        // =================================================
        // ID ΠΕΛΑΤΗ
        // =================================================

        if (
            data.customer &&
            data.customer.id
        ) {

            currentCustomerId =
                data.customer.id;
        }


        // =================================================
        // ΑΝΑΖΗΤΗΣΗ = ΚΥΡΙΟ ΤΗΛΕΦΩΝΟ
        // =================================================

        if (phoneInput) {

            phoneInput.value =
                data.customer?.phone1 ||
                customerData.phone1;
        }


        // =================================================
        // ΞΑΝΑΓΕΜΙΖΟΥΜΕ ΤΗ ΦΟΡΜΑ
        // =================================================

        if (data.customer) {

            const savedCustomer = {
                ...customerData,
                ...data.customer
            };


            // Σε περίπτωση που το backend
            // δεν επιστρέφει ακόμη τα χρησιδάνεια.

            if (
                data.customer.loan_heaters ===
                undefined
            ) {
                savedCustomer.loan_heaters =
                    customerData.loan_heaters;
            }


            if (
                data.customer
                    .loan_empty_cylinders ===
                undefined
            ) {
                savedCustomer
                    .loan_empty_cylinders =
                    customerData
                        .loan_empty_cylinders;
            }


            fillCustomerForm(
                savedCustomer
            );
        }


        // =================================================
        // ΜΗΝΥΜΑ ΕΠΙΤΥΧΙΑΣ
        // =================================================

        if (result) {

            result.innerHTML = `
                <div class="success-message">
                    ${
                        isExistingCustomer
                            ? "Τα στοιχεία του πελάτη ενημερώθηκαν επιτυχώς."
                            : "Ο πελάτης αποθηκεύτηκε επιτυχώς."
                    }
                </div>
            `;
        }


        await updateCustomerNumber();


    } catch (error) {

        console.error(
            "Σφάλμα αποθήκευσης πελάτη:",
            error
        );


        if (result) {

            result.innerHTML =
                "Δεν υπάρχει σύνδεση με τον server.";
        }


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
            Array.isArray(data.customers)
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
                        Δεν υπάρχει σύνδεση με τον server.
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
                                customer.fullname ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.phone1 ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.area ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                customer.address ||
                                ""
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
// ΑΝΑΖΗΤΗΣΗ ΜΕΣΑ ΣΤΟ ΕΥΡΕΤΗΡΙΟ
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


                if (searchText === "") {

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

    customerDirectoryBody.addEventListener(
        "click",
        (event) => {

            // =============================================
            // ΔΙΑΓΡΑΦΗ
            // =============================================

            const deleteButton =
                event.target.closest(
                    ".delete-customer-btn"
                );


            if (deleteButton) {

                event.stopPropagation();


                const customerId =
                    deleteButton
                        .dataset
                        .customerId;


                deleteCustomer(
                    customerId
                );

                return;
            }


            // =============================================
            // ΕΠΙΛΟΓΗ ΠΕΛΑΤΗ
            // =============================================

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
                        item =>
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
                    customer.phone1 ||
                    "";
            }


            if (result) {

                result.innerHTML = `
                    <div class="success-message">
                        Επιλέχθηκε ο πελάτης:
                        <strong>
                            ${escapeHtml(
                                customer.fullname ||
                                ""
                            )}
                        </strong>
                    </div>
                `;
            }


            closeCustomerDirectory();


            if (newCustomerForm) {

                newCustomerForm
                    .classList
                    .remove("hidden");


                newCustomerForm
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "start"
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


        // Αν διαγράψαμε τον πελάτη
        // που έχουμε ανοιχτό στη φόρμα

        if (
            currentCustomerId !== null &&
            Number(currentCustomerId) ===
            Number(customerId)
        ) {

            clearCustomerForm();

            currentCustomerId = null;


            if (phoneInput) {
                phoneInput.value = "";
            }


            if (result) {

                result.innerHTML = `
                    <div class="success-message">
                        Ο πελάτης διαγράφηκε.
                    </div>
                `;
            }
        }


        // Ξαναφόρτωση ευρετηρίου

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


// Ευρετήριο
if (customerDirectoryBtn) {

    customerDirectoryBtn
        .addEventListener(
            "click",
            openCustomerDirectory
        );
}


// Κλείσιμο ευρετηρίου
if (closeCustomerDirectoryBtn) {

    closeCustomerDirectoryBtn
        .addEventListener(
            "click",
            closeCustomerDirectory
        );
}


// Αναζήτηση
if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchCustomer
    );
}


// Αποθήκευση πελάτη
if (saveCustomerBtn) {

    saveCustomerBtn.addEventListener(
        "click",
        saveCustomer
    );
}


// Enter στο πεδίο αναζήτησης
if (phoneInput) {

    phoneInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                searchCustomer();
            }
        }
    );
}


// Νέος πελάτης
if (newCustomerBtn) {

    newCustomerBtn.addEventListener(
        "click",
        startNewCustomer
    );
}


// =========================================================
// ΑΡΧΙΚΗ ΕΝΗΜΕΡΩΣΗ ΑΡΙΘΜΟΥ ΠΕΛΑΤΩΝ
// =========================================================

updateCustomerNumber();