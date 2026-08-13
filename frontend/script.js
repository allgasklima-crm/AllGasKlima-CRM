const searchBtn = document.getElementById("searchBtn");
const phoneInput = document.getElementById("phone");
const result = document.getElementById("result");

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

const saveCustomerBtn =
    document.getElementById("saveCustomerBtn");



let currentCustomerId = null;


/* =========================================================
   ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ ΠΕΛΑΤΗ
========================================================= */

function clearCustomerForm(preserveCylinders = false) {
    fullnameInput.value = "";
    phone1Input.value = "";
    phone2Input.value = "";
    phone3Input.value = "";
    areaInput.value = "";
    addressInput.value = "";
    floorInput.value = "";
    notesInput.value = "";
const customerNumber =
    document.getElementById("customerNumber");

if (customerNumber) {
    fetch("/api/customers", {
        cache: "no-store"
    })
    .then(response => response.json())
    .then(data => {
        if (
            data.success &&
            Array.isArray(data.customers)
        ) {
            customerNumber.textContent =
                data.customers.length;
        }
    });
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
        ].forEach((checkbox) => {
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    }

    currentCustomerId = null;
}

function fillCustomerForm(customer) {
    const customerNumber =
    document.getElementById("customerNumber");

if (customerNumber) {
    fetch("/api/customers", {
        cache: "no-store"
    })
    .then(response => response.json())
    .then(data => {
        if (
            data.success &&
            Array.isArray(data.customers)
        ) {
            customerNumber.textContent =
    data.customers.length;
        }
    });
}
    currentCustomerId =
        customer.id ?? null;

    fullnameInput.value =
        customer.fullname || "";

    phone1Input.value =
        customer.phone1 || "";

    phone2Input.value =
        customer.phone2 || "";

    phone3Input.value =
        customer.phone3 || "";

    areaInput.value =
        customer.area || "";

    addressInput.value =
        customer.address || "";

    floorInput.value =
        customer.floor || "";

    notesInput.value =
        customer.notes || "";

    if (cylinderScrew) {
        cylinderScrew.checked =
            Boolean(customer.cylinder_screw);
    }

    if (cylinderClip) {
        cylinderClip.checked =
            Boolean(customer.cylinder_clip);
    }

    if (cylinder3kg) {
        cylinder3kg.checked =
            Boolean(customer.cylinder_3kg);
    }

    if (cylinder10Mix) {
        cylinder10Mix.checked =
            Boolean(customer.cylinder_10_mix);
    }

    if (cylinder10Propane) {
        cylinder10Propane.checked =
            Boolean(customer.cylinder_10_propane);
    }

    if (cylinder13kg) {
        cylinder13kg.checked =
            Boolean(customer.cylinder_13kg);
    }

    if (cylinder25kg) {
        cylinder25kg.checked =
            Boolean(customer.cylinder_25kg);
    }

    if (cylinderBarrel) {
        cylinderBarrel.checked =
            Boolean(customer.cylinder_barrel);
    }

    if (cylinderShort) {
        cylinderShort.checked =
            Boolean(customer.cylinder_short);
    }

    if (cylinderTall) {
        cylinderTall.checked =
            Boolean(customer.cylinder_tall);
    }
}








/* =========================================================
   ΑΝΑΖΗΤΗΣΗ ΠΕΛΑΤΗ
========================================================= */

async function searchCustomer() {
    const searchText =
        phoneInput.value.trim();

    if (searchText === "") {
        result.innerHTML =
            "Γράψε όνομα, επώνυμο ή αριθμό τηλεφώνου.";

        return;
    }

    result.innerHTML =
        "Αναζήτηση...";

    try {
        const response = await fetch(
            "/api/customer?phone=" +
            encodeURIComponent(searchText),
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
            result.innerHTML =
                data.message ||
                "Παρουσιάστηκε σφάλμα στην αναζήτηση.";

            return;
        }
if (data.multiple) {
    clearCustomerForm();

    result.innerHTML = `
        <div class="incoming-call-message">
            ${escapeHtml(
                data.message ||
                "Βρέθηκαν περισσότεροι πελάτες. Γράψε τηλέφωνο ή πιο συγκεκριμένα στοιχεία."
            )}
        </div>
    `;

    phoneInput.focus();
    phoneInput.select();

    return;
}
        if (!data.found) {
            clearCustomerForm();

            result.innerHTML = `
                <div class="incoming-call-message">
                    Δεν βρέθηκε πελάτης με:
                    <strong>
                        ${escapeHtml(searchText)}
                    </strong>
                </div>
            `;

            if (isProbablyPhone(searchText)) {
                phone1Input.value =
                    searchText;
            } else {
                fullnameInput.value =
                    searchText;
            }

            newCustomerForm
                .classList
                .remove("hidden");

            if (isProbablyPhone(searchText)) {
                fullnameInput.focus();
            } else {
                phone1Input.focus();
            }

            return;
        }

        fillCustomerForm(
            data.customer
        );

        newCustomerForm
            .classList
            .remove("hidden");

        result.innerHTML = `
            <div class="success-message">
                Βρέθηκε ο πελάτης:
                <strong>
                    ${escapeHtml(
                        data.customer.fullname
                    )}
                </strong>
            </div>
        `;

        newCustomerForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error(
            "Σφάλμα αναζήτησης πελάτη:",
            error
        );

        result.innerHTML =
            "Δεν υπάρχει σύνδεση με τον server.";
    }
}


/* =========================================================
   ΑΠΟΘΗΚΕΥΣΗ / ΕΝΗΜΕΡΩΣΗ ΠΕΛΑΤΗ
========================================================= */

async function saveCustomer() {
    const customerData = {
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

        cylinder_screw:
            cylinderScrew?.checked || false,

        cylinder_clip:
            cylinderClip?.checked || false,

        cylinder_3kg:
            cylinder3kg?.checked || false,

        cylinder_10_mix:
            cylinder10Mix?.checked || false,

        cylinder_10_propane:
            cylinder10Propane?.checked || false,

        cylinder_13kg:
            cylinder13kg?.checked || false,

        cylinder_25kg:
            cylinder25kg?.checked || false,

        cylinder_barrel:
            cylinderBarrel?.checked || false,

        cylinder_short:
            cylinderShort?.checked || false,

        cylinder_tall:
            cylinderTall?.checked || false
    };

    if (
        customerData.fullname === ""
    ) {
        result.innerHTML =
            "Το ονοματεπώνυμο είναι υποχρεωτικό.";

        fullnameInput.focus();

        return;
    }

    if (
        customerData.phone1 === ""
    ) {
        result.innerHTML =
            "Το κύριο τηλέφωνο είναι υποχρεωτικό.";

        phone1Input.focus();

        return;
    }

    saveCustomerBtn.disabled =
        true;

    saveCustomerBtn.textContent =
        "Αποθήκευση...";

    result.innerHTML =
        "Γίνεται αποθήκευση...";

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
            result.innerHTML =
                data.message ||
                "Δεν έγινε η αποθήκευση.";

            return;
        }

        if (
            data.customer &&
            data.customer.id
        ) {
            currentCustomerId =
                data.customer.id;
        }

        phoneInput.value =
            data.customer?.phone1 ||
            customerData.phone1;

        if (data.customer) {
            fillCustomerForm(
                data.customer
            );
        }

        result.innerHTML = `
            <div class="success-message">
                ${
                    isExistingCustomer
                        ? "Τα στοιχεία του πελάτη ενημερώθηκαν επιτυχώς."
                        : "Ο πελάτης αποθηκεύτηκε επιτυχώς."
                }
            </div>
        `;

    } catch (error) {
        console.error(
            "Σφάλμα αποθήκευσης πελάτη:",
            error
        );

        result.innerHTML =
            "Δεν υπάρχει σύνδεση με τον server.";

    } finally {
        saveCustomerBtn.disabled =
            false;

        saveCustomerBtn.textContent =
            "Αποθήκευση πελάτη";
    }
}


/* =========================================================
   ΚΟΥΜΠΙ ΝΕΟΣ ΠΕΛΑΤΗΣ
========================================================= */

function startNewCustomer() {
    currentCustomerId = null;

    phoneInput.value = "";
    result.innerHTML = "";

    clearCustomerForm();

    document
        .querySelectorAll(
            '.customer-cylinder-section input[type="checkbox"], .order-option input[type="checkbox"]'
        )
        .forEach((checkbox) => {
            checkbox.checked = false;
        });

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

    newCustomerForm
        .classList
        .remove("hidden");

    fullnameInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
/* =========================================================
   ΑΝΑΓΝΩΡΙΣΗ ΕΙΣΕΡΧΟΜΕΝΗΣ ΚΛΗΣΗΣ
========================================================= */




/* =========================================================
   ΙΣΤΟΡΙΚΟ ΚΛΗΣΕΩΝ
========================================================= */


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
   EVENT LISTENERS
========================================================= */

if (searchBtn) {
    searchBtn.addEventListener(
        "click",
        searchCustomer
    );
}

if (saveCustomerBtn) {
    saveCustomerBtn.addEventListener(
        "click",
        saveCustomer
    );
}

if (phoneInput) {
    phoneInput.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter"
            ) {
                searchCustomer();
            }
        }
    );
}

if (newCustomerBtn) {
    newCustomerBtn.addEventListener(
        "click",
        startNewCustomer
    );
}



/* =========================================================
   ΕΚΚΙΝΗΣΗ ΕΦΑΡΜΟΓΗΣ
========================================================= */


updateDateTime();

setInterval(
    updateDateTime,
    1000
);

