const searchBtn = document.getElementById("searchBtn");
const phoneInput = document.getElementById("phone");
const result = document.getElementById("result");

const newCustomerForm = document.getElementById("newCustomerForm");

const fullnameInput = document.getElementById("fullname");
const phone1Input = document.getElementById("phone1");
const phone2Input = document.getElementById("phone2");
const phone3Input = document.getElementById("phone3");
const areaInput = document.getElementById("area");
const addressInput = document.getElementById("address");
const floorInput = document.getElementById("floor");
const notesInput = document.getElementById("notes");

const saveCustomerBtn = document.getElementById("saveCustomerBtn");


function clearCustomerForm() {
    fullnameInput.value = "";
    phone1Input.value = "";
    phone2Input.value = "";
    phone3Input.value = "";
    areaInput.value = "";
    addressInput.value = "";
    floorInput.value = "";
    notesInput.value = "";
}


function showCustomer(customer) {
    result.innerHTML = `
        <div class="customer-card">
            <h2>${customer.fullname}</h2>

            <p>
                <b>Κύριο τηλέφωνο:</b>
                ${customer.phone1 || "-"}
            </p>

            <p>
                <b>Δεύτερο τηλέφωνο:</b>
                ${customer.phone2 || "-"}
            </p>

            <p>
                <b>Τρίτο τηλέφωνο:</b>
                ${customer.phone3 || "-"}
            </p>

            <p>
                <b>Περιοχή:</b>
                ${customer.area || "-"}
            </p>

            <p>
                <b>Διεύθυνση:</b>
                ${customer.address || "-"}
            </p>

            <p>
                <b>Όροφος:</b>
                ${customer.floor || "-"}
            </p>

            <p>
                <b>Σημειώσεις:</b>
                ${customer.notes || "-"}
            </p>
        </div>
    `;
}


async function searchCustomer() {
    const phone = phoneInput.value.trim();

    if (phone === "") {
        result.innerHTML = "Πληκτρολόγησε έναν αριθμό.";
        newCustomerForm.classList.add("hidden");
        return;
    }

    result.innerHTML = "Αναζήτηση...";
    newCustomerForm.classList.add("hidden");

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/customer?phone=" +
            encodeURIComponent(phone)
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            result.innerHTML =
                data.message || "Παρουσιάστηκε σφάλμα.";
            return;
        }

        if (!data.found) {
            clearCustomerForm();

            result.innerHTML =
                "Δεν βρέθηκε πελάτης με το τηλέφωνο <b>" +
                phone +
                "</b>.";

            phone1Input.value = phone;

            newCustomerForm.classList.remove("hidden");

            fullnameInput.focus();

            return;
        }

        newCustomerForm.classList.add("hidden");

        showCustomer(data.customer);

    } catch (error) {
        console.error(error);

        result.innerHTML =
            "Δεν υπάρχει σύνδεση με τον server.";
    }
}


async function saveCustomer() {
    const customerData = {
        fullname: fullnameInput.value.trim(),
        phone1: phone1Input.value.trim(),
        phone2: phone2Input.value.trim(),
        phone3: phone3Input.value.trim(),
        area: areaInput.value.trim(),
        address: addressInput.value.trim(),
        floor: floorInput.value.trim(),
        notes: notesInput.value.trim()
    };

    if (customerData.fullname === "") {
        result.innerHTML =
            "Το ονοματεπώνυμο είναι υποχρεωτικό.";

        fullnameInput.focus();

        return;
    }

    if (customerData.phone1 === "") {
        result.innerHTML =
            "Το κύριο τηλέφωνο είναι υποχρεωτικό.";

        phone1Input.focus();

        return;
    }

    saveCustomerBtn.disabled = true;
    saveCustomerBtn.textContent = "Αποθήκευση...";

    result.innerHTML = "Γίνεται αποθήκευση...";

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/customer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customerData)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            result.innerHTML =
                data.message || "Δεν έγινε η αποθήκευση.";

            return;
        }

        newCustomerForm.classList.add("hidden");

        phoneInput.value =
            data.customer.phone1 || customerData.phone1;

        result.innerHTML = `
            <div class="success-message">
                Ο πελάτης αποθηκεύτηκε επιτυχώς.
            </div>
        `;

        setTimeout(() => {
            showCustomer(data.customer);
        }, 1200);

        clearCustomerForm();

    } catch (error) {
        console.error(error);

        result.innerHTML =
            "Δεν υπάρχει σύνδεση με τον server.";
    } finally {
        saveCustomerBtn.disabled = false;

        saveCustomerBtn.textContent =
            "Αποθήκευση πελάτη";
    }
}


searchBtn.addEventListener(
    "click",
    searchCustomer
);

saveCustomerBtn.addEventListener(
    "click",
    saveCustomer
);

phoneInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            searchCustomer();
        }
    }
);let lastIncomingCallId = null;
let incomingCallCheckRunning = false;

async function checkIncomingCall() {

    if (incomingCallCheckRunning) {
        return;
    }

    incomingCallCheckRunning = true;

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/latest-call",
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!data.success || !data.has_call) {
            return;
        }

        if (data.call.id === lastIncomingCallId) {
            return;
        }

        lastIncomingCallId = data.call.id;

        phoneInput.value = data.call.phone;

        searchCustomer();

    } catch (error) {

        console.error(error);

    } finally {

        incomingCallCheckRunning = false;

    }

}

setInterval(checkIncomingCall, 1000);