from datetime import datetime
from pathlib import Path
import sqlite3

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS


app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)

CORS(app)


DATABASE_PATH = (
    Path(__file__).resolve().parent.parent
    / "database"
    / "allgasklima.db"
)


# =========================================================
# ΒΑΣΗ ΔΕΔΟΜΕΝΩΝ
# =========================================================

def get_connection():
    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    return connection


# =========================================================
# ΙΣΤΟΡΙΚΟ ΚΛΗΣΕΩΝ - ΔΗΜΙΟΥΡΓΙΑ / ΕΝΗΜΕΡΩΣΗ ΠΙΝΑΚΑ
# =========================================================

def create_call_history_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS call_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            called_at TEXT NOT NULL,
            deleted INTEGER NOT NULL DEFAULT 0
        )
        """
    )

    connection.commit()

    columns = [
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(call_history)"
        ).fetchall()
    ]

    if "deleted" not in columns:
        connection.execute(
            """
            ALTER TABLE call_history
            ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0
            """
        )

        connection.commit()

    connection.close()


# =========================================================
# ΠΕΔΙΑ ΦΙΑΛΩΝ ΠΕΛΑΤΗ
#
# Προσθέτει αυτόματα τις νέες στήλες στον υπάρχοντα
# πίνακα customers χωρίς να σβήνει παλιούς πελάτες.
# =========================================================

def create_customer_cylinder_columns():
    connection = get_connection()

    columns = [
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(customers)"
        ).fetchall()
    ]

    cylinder_columns = {
        "cylinder_screw": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_clip": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_3kg": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_10_mix": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_10_propane": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_13kg": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_25kg": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_barrel": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_short": (
            "INTEGER NOT NULL DEFAULT 0"
        ),

        "cylinder_tall": (
            "INTEGER NOT NULL DEFAULT 0"
        )
    }

    for column_name, column_definition in cylinder_columns.items():

        if column_name not in columns:

            connection.execute(
                f"""
                ALTER TABLE customers
                ADD COLUMN {column_name}
                {column_definition}
                """
            )

    connection.commit()
    connection.close()


# =========================================================
# ΒΟΗΘΗΤΙΚΗ ΣΥΝΑΡΤΗΣΗ BOOLEAN
# =========================================================

def checkbox_value(data, key):
    """
    Μετατρέπει την τιμή checkbox σε 0 ή 1
    για αποθήκευση στη SQLite.
    """

    value = data.get(
        key,
        False
    )

    if isinstance(value, bool):
        return 1 if value else 0

    if isinstance(value, int):
        return 1 if value else 0

    if isinstance(value, str):
        return 1 if value.lower() in (
            "true",
            "1",
            "yes",
            "on"
        ) else 0

    return 0


# =========================================================
# ΕΥΡΕΣΗ ΠΕΛΑΤΗ ΑΠΟ ΤΗΛΕΦΩΝΟ
# =========================================================

def get_customer_by_phone(phone):
    connection = get_connection()

    customer = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE phone1 = ?
           OR phone2 = ?
           OR phone3 = ?
        LIMIT 1
        """,
        (
            phone,
            phone,
            phone,
        )
    ).fetchone()

    connection.close()

    return customer


# =========================================================
# ΜΟΡΦΟΠΟΙΗΣΗ ΚΛΗΣΗΣ
# =========================================================

def make_call_response(call_row):
    phone = call_row["phone"]

    called_at = datetime.fromisoformat(
        call_row["called_at"]
    )

    customer = get_customer_by_phone(
        phone
    )

    return {
        "id": call_row["id"],

        "phone": phone,

        "date": called_at.strftime(
            "%d/%m/%Y"
        ),

        "time": called_at.strftime(
            "%H:%M:%S"
        ),

        "timestamp": called_at.isoformat(),

        "found": customer is not None,

        "customer_name": (
            customer["fullname"]
            if customer is not None
            else None
        ),

        "deleted": bool(
            call_row["deleted"]
        )
    }


# =========================================================
# ΑΡΧΙΚΗ ΣΕΛΙΔΑ
# =========================================================

@app.route("/")
def index():
    return send_from_directory(
        "../frontend",
        "index.html"
    )


# =========================================================
# ΑΝΑΖΗΤΗΣΗ ΠΕΛΑΤΗ
# =========================================================
@app.get("/api/customers")
def get_customers():

    connection = get_connection()

    customers = connection.execute(
        """
        SELECT
            id,
            fullname,
            phone1,
            phone2,
            phone3,
            area,
            address
        FROM customers
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return jsonify({
        "success": True,
        "customers": [
            dict(customer)
            for customer in customers
        ]
    })
@app.delete("/api/customer/<int:customer_id>")
def delete_customer(customer_id):
    connection = get_connection()

    customer = connection.execute(
        """
        SELECT id
        FROM customers
        WHERE id = ?
        """,
        (customer_id,)
    ).fetchone()

    if customer is None:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Ο πελάτης δεν βρέθηκε."
        }), 404

    connection.execute(
        """
        DELETE FROM customers
        WHERE id = ?
        """,
        (customer_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Ο πελάτης διαγράφηκε επιτυχώς."
    })
@app.get("/api/customer")
def find_customer():
    search_text = request.args.get(
        "phone",
        ""
    ).strip()

    if not search_text:
        return jsonify({
            "success": False,
            "message": (
                "Γράψε τηλέφωνο, όνομα, περιοχή "
                "ή διεύθυνση."
            )
        }), 400

    # =====================================================
    # 1. ΠΡΩΤΑ ΕΛΕΓΧΟΥΜΕ ΑΚΡΙΒΗ ΤΑΥΤΙΣΗ ΤΗΛΕΦΩΝΟΥ
    # =====================================================

    customer = get_customer_by_phone(
        search_text
    )

    if customer is not None:
     return jsonify({
        "success": True,
        "found": True,
        "multiple": False,
        "customer": dict(customer)
    })
    # =====================================================
    # 2. ΓΕΝΙΚΗ ΧΕΙΡΟΚΙΝΗΤΗ ΑΝΑΖΗΤΗΣΗ
    # =====================================================

    connection = get_connection()

    search_like = f"%{search_text}%"

    customers = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE fullname LIKE ?
           OR phone1 LIKE ?
           OR phone2 LIKE ?
           OR phone3 LIKE ?
           OR phone4 LIKE ?
           OR area LIKE ?
           OR address LIKE ?
        ORDER BY fullname ASC
        LIMIT 20
        """,
        (
            search_like,
            search_like,
            search_like,
            search_like,
            search_like,
            search_like,
            search_like
        )
    ).fetchall()

    connection.close()

    # =====================================================
    # ΚΑΝΕΝΑ ΑΠΟΤΕΛΕΣΜΑ
    # =====================================================

    if len(customers) == 0:
        return jsonify({
            "success": True,
            "found": False,
            "multiple": False,
            "search_text": search_text
        })

    # =====================================================
    # ΕΝΑΣ ΠΕΛΑΤΗΣ
    # =====================================================

    if len(customers) == 1:
        return jsonify({
            "success": True,
            "found": True,
            "multiple": False,
            "customer": dict(
                customers[0]
            )
        })

    # =====================================================
# ΠΕΡΙΣΣΟΤΕΡΟΙ ΑΠΟ ΕΝΑΣ
# =====================================================

    return jsonify({
    "success": True,
    "found": False,
    "multiple": True,
    "message": (
        "Βρέθηκαν περισσότεροι πελάτες. "
        "Γράψε τηλέφωνο ή πιο συγκεκριμένα στοιχεία."
    )
})

# =========================================================
# ΔΗΜΙΟΥΡΓΙΑ ΝΕΟΥ ΠΕΛΑΤΗ
# =========================================================

@app.post("/api/customer")
def create_customer():

    data = request.get_json(
        silent=True
    ) or {}


    # -----------------------------------------------------
    # ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ
    # -----------------------------------------------------

    fullname = str(
        data.get(
            "fullname",
            ""
        )
    ).strip()


    phone1 = str(
        data.get(
            "phone1",
            ""
        )
    ).strip()


    phone2 = str(
        data.get(
            "phone2",
            ""
        )
    ).strip()


    phone3 = str(
        data.get(
            "phone3",
            ""
        )
    ).strip()


    area = str(
        data.get(
            "area",
            ""
        )
    ).strip()


    address = str(
        data.get(
            "address",
            ""
        )
    ).strip()


    floor = str(
        data.get(
            "floor",
            ""
        )
    ).strip()


    notes = str(
        data.get(
            "notes",
            ""
        )
    ).strip()


    # -----------------------------------------------------
    # ΦΙΑΛΕΣ ΠΟΥ ΧΡΗΣΙΜΟΠΟΙΕΙ Ο ΠΕΛΑΤΗΣ
    # -----------------------------------------------------

    cylinder_screw = checkbox_value(
        data,
        "cylinder_screw"
    )

    cylinder_clip = checkbox_value(
        data,
        "cylinder_clip"
    )

    cylinder_3kg = checkbox_value(
        data,
        "cylinder_3kg"
    )

    cylinder_10_mix = checkbox_value(
        data,
        "cylinder_10_mix"
    )

    cylinder_10_propane = checkbox_value(
        data,
        "cylinder_10_propane"
    )

    cylinder_13kg = checkbox_value(
        data,
        "cylinder_13kg"
    )

    cylinder_25kg = checkbox_value(
        data,
        "cylinder_25kg"
    )

    cylinder_barrel = checkbox_value(
        data,
        "cylinder_barrel"
    )

    cylinder_short = checkbox_value(
        data,
        "cylinder_short"
    )

    cylinder_tall = checkbox_value(
        data,
        "cylinder_tall"
    )


    # -----------------------------------------------------
    # ΕΛΕΓΧΟΣ ΟΝΟΜΑΤΟΣ
    # -----------------------------------------------------

    if not fullname:

        return jsonify({
            "success": False,

            "message": (
                "Το ονοματεπώνυμο είναι υποχρεωτικό."
            )
        }), 400


    # -----------------------------------------------------
    # ΕΛΕΓΧΟΣ ΤΗΛΕΦΩΝΟΥ
    # -----------------------------------------------------

    if not phone1:

        return jsonify({
            "success": False,

            "message": (
                "Το κύριο τηλέφωνο είναι υποχρεωτικό."
            )
        }), 400


    # -----------------------------------------------------
    # ΕΛΕΓΧΟΣ ΑΝ ΥΠΑΡΧΕΙ ΗΔΗ
    # -----------------------------------------------------

    existing_customer = get_customer_by_phone(
        phone1
    )

    if existing_customer is not None:

        return jsonify({
            "success": False,

            "message": (
                "Υπάρχει ήδη πελάτης "
                "με αυτό το τηλέφωνο."
            )
        }), 409


    # -----------------------------------------------------
    # ΑΠΟΘΗΚΕΥΣΗ
    # -----------------------------------------------------

    connection = get_connection()

    try:

        cursor = connection.execute(
            """
            INSERT INTO customers (

                fullname,

                phone1,
                phone2,
                phone3,

                area,
                address,
                floor,
                notes,

                cylinder_screw,
                cylinder_clip,

                cylinder_3kg,
                cylinder_10_mix,
                cylinder_10_propane,
                cylinder_13kg,
                cylinder_25kg,

                cylinder_barrel,
                cylinder_short,
                cylinder_tall

            )

            VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            """,
            (
                fullname,

                phone1,
                phone2 or None,
                phone3 or None,

                area or None,
                address or None,
                floor or None,
                notes or None,

                cylinder_screw,
                cylinder_clip,

                cylinder_3kg,
                cylinder_10_mix,
                cylinder_10_propane,
                cylinder_13kg,
                cylinder_25kg,

                cylinder_barrel,
                cylinder_short,
                cylinder_tall
            )
        )

        connection.commit()

        customer_id = cursor.lastrowid

        customer = connection.execute(
            """
            SELECT *
            FROM customers
            WHERE id = ?
            """,
            (
                customer_id,
            )
        ).fetchone()


    except sqlite3.IntegrityError:

        connection.close()

        return jsonify({
            "success": False,

            "message": (
                "Υπάρχει ήδη πελάτης "
                "με αυτό το κύριο τηλέφωνο."
            )
        }), 409


    connection.close()


    return jsonify({
        "success": True,

        "message": (
            "Ο πελάτης αποθηκεύτηκε σωστά."
        ),

        "customer": dict(customer)
    }), 201


# =========================================================
# ΕΝΗΜΕΡΩΣΗ ΥΠΑΡΧΟΝΤΟΣ ΠΕΛΑΤΗ
# =========================================================

@app.put(
    "/api/customer/<int:customer_id>"
)
def update_customer(customer_id):

    data = request.get_json(
        silent=True
    ) or {}


    # -----------------------------------------------------
    # ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ
    # -----------------------------------------------------

    fullname = str(
        data.get(
            "fullname",
            ""
        )
    ).strip()


    phone1 = str(
        data.get(
            "phone1",
            ""
        )
    ).strip()


    phone2 = str(
        data.get(
            "phone2",
            ""
        )
    ).strip()


    phone3 = str(
        data.get(
            "phone3",
            ""
        )
    ).strip()


    area = str(
        data.get(
            "area",
            ""
        )
    ).strip()


    address = str(
        data.get(
            "address",
            ""
        )
    ).strip()


    floor = str(
        data.get(
            "floor",
            ""
        )
    ).strip()


    notes = str(
        data.get(
            "notes",
            ""
        )
    ).strip()


    # -----------------------------------------------------
    # ΦΙΑΛΕΣ ΠΟΥ ΧΡΗΣΙΜΟΠΟΙΕΙ Ο ΠΕΛΑΤΗΣ
    # -----------------------------------------------------

    cylinder_screw = checkbox_value(
        data,
        "cylinder_screw"
    )

    cylinder_clip = checkbox_value(
        data,
        "cylinder_clip"
    )

    cylinder_3kg = checkbox_value(
        data,
        "cylinder_3kg"
    )

    cylinder_10_mix = checkbox_value(
        data,
        "cylinder_10_mix"
    )

    cylinder_10_propane = checkbox_value(
        data,
        "cylinder_10_propane"
    )

    cylinder_13kg = checkbox_value(
        data,
        "cylinder_13kg"
    )

    cylinder_25kg = checkbox_value(
        data,
        "cylinder_25kg"
    )

    cylinder_barrel = checkbox_value(
        data,
        "cylinder_barrel"
    )

    cylinder_short = checkbox_value(
        data,
        "cylinder_short"
    )

    cylinder_tall = checkbox_value(
        data,
        "cylinder_tall"
    )


    # -----------------------------------------------------
    # ΕΛΕΓΧΟΣ
    # -----------------------------------------------------

    if not fullname:

        return jsonify({
            "success": False,

            "message": (
                "Το ονοματεπώνυμο είναι υποχρεωτικό."
            )
        }), 400


    if not phone1:

        return jsonify({
            "success": False,

            "message": (
                "Το κύριο τηλέφωνο είναι υποχρεωτικό."
            )
        }), 400


    connection = get_connection()


    # -----------------------------------------------------
    # ΕΛΕΓΧΟΥΜΕ ΟΤΙ ΥΠΑΡΧΕΙ
    # -----------------------------------------------------

    customer = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE id = ?
        LIMIT 1
        """,
        (
            customer_id,
        )
    ).fetchone()


    if customer is None:

        connection.close()

        return jsonify({
            "success": False,

            "message": (
                "Ο πελάτης δεν βρέθηκε."
            )
        }), 404


    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    try:

        connection.execute(
            """
            UPDATE customers

            SET

                fullname = ?,

                phone1 = ?,
                phone2 = ?,
                phone3 = ?,

                area = ?,
                address = ?,
                floor = ?,
                notes = ?,

                cylinder_screw = ?,
                cylinder_clip = ?,

                cylinder_3kg = ?,
                cylinder_10_mix = ?,
                cylinder_10_propane = ?,
                cylinder_13kg = ?,
                cylinder_25kg = ?,

                cylinder_barrel = ?,
                cylinder_short = ?,
                cylinder_tall = ?

            WHERE id = ?
            """,
            (
                fullname,

                phone1,
                phone2 or None,
                phone3 or None,

                area or None,
                address or None,
                floor or None,
                notes or None,

                cylinder_screw,
                cylinder_clip,

                cylinder_3kg,
                cylinder_10_mix,
                cylinder_10_propane,
                cylinder_13kg,
                cylinder_25kg,

                cylinder_barrel,
                cylinder_short,
                cylinder_tall,

                customer_id
            )
        )

        connection.commit()


        customer = connection.execute(
            """
            SELECT *
            FROM customers
            WHERE id = ?
            LIMIT 1
            """,
            (
                customer_id,
            )
        ).fetchone()


    except sqlite3.IntegrityError:

        connection.close()

        return jsonify({
            "success": False,

            "message": (
                "Υπάρχει ήδη πελάτης "
                "με ένα από αυτά τα τηλέφωνα."
            )
        }), 409


    connection.close()


    return jsonify({
        "success": True,

        "message": (
            "Τα στοιχεία του πελάτη "
            "ενημερώθηκαν σωστά."
        ),

        "customer": dict(customer)
    })


# =========================================================
# ΕΙΣΕΡΧΟΜΕΝΗ ΚΛΗΣΗ
# =========================================================

@app.post("/api/incoming-call")
def incoming_call():

    data = request.get_json(
        silent=True
    ) or {}


    phone = str(
        data.get(
            "phone",
            ""
        )
    ).strip()


    if not phone:

        return jsonify({
            "success": False,

            "message": (
                "Δεν δόθηκε αριθμός."
            )
        }), 400


    now = datetime.now().astimezone()


    connection = get_connection()


    cursor = connection.execute(
        """
        INSERT INTO call_history (
            phone,
            called_at
        )
        VALUES (?, ?)
        """,
        (
            phone,
            now.isoformat()
        )
    )


    connection.commit()


    call_id = cursor.lastrowid


    call_row = connection.execute(
        """
        SELECT *
        FROM call_history
        WHERE id = ?
        """,
        (
            call_id,
        )
    ).fetchone()


    connection.close()


    call_data = make_call_response(
        call_row
    )


    customer = get_customer_by_phone(
        phone
    )


    if customer is not None:

        print(
            f"📞 {call_data['date']} "
            f"{call_data['time']} - "
            f"Αναγνωρίστηκε πελάτης: "
            f"{customer['fullname']}"
        )


        return jsonify({
            "success": True,

            "found": True,

            "call": call_data,

            "customer": dict(customer)
        }), 201


    print(
        f"📞 {call_data['date']} "
        f"{call_data['time']} - "
        f"Άγνωστος αριθμός: {phone}"
    )


    return jsonify({
        "success": True,

        "found": False,

        "call": call_data,

        "phone": phone
    }), 201


# =========================================================
# ΤΕΛΕΥΤΑΙΑ ΚΛΗΣΗ
# =========================================================

@app.get("/api/latest-call")
def get_latest_call():

    connection = get_connection()


    call_row = connection.execute(
        """
        SELECT *
        FROM call_history
        ORDER BY id DESC
        LIMIT 1
        """
    ).fetchone()


    connection.close()


    if call_row is None:

        return jsonify({
            "success": True,

            "has_call": False
        })


    return jsonify({
        "success": True,

        "has_call": True,

        "call": make_call_response(
            call_row
        )
    })


# =========================================================
# ΙΣΤΟΡΙΚΟ ΚΛΗΣΕΩΝ
# =========================================================

@app.get("/api/calls")
def get_call_history():

    limit_text = request.args.get(
        "limit",
        "50"
    )


    try:

        limit = int(
            limit_text
        )


    except ValueError:

        limit = 50


    limit = max(
        1,
        min(
            limit,
            200
        )
    )


    connection = get_connection()


    call_rows = connection.execute(
        """
        SELECT *
        FROM call_history
        ORDER BY id DESC
        LIMIT ?
        """,
        (
            limit,
        )
    ).fetchall()


    connection.close()


    calls = [
        make_call_response(
            call_row
        )
        for call_row in call_rows
    ]


    return jsonify({
        "success": True,

        "calls": calls
    })


# =========================================================
# ΔΙΑΓΡΑΦΗ ΜΙΑΣ ΚΛΗΣΗΣ
# =========================================================

@app.delete(
    "/api/calls/<int:call_id>"
)
def delete_call(call_id):

    connection = get_connection()


    cursor = connection.execute(
        """
        UPDATE call_history
        SET deleted = 1
        WHERE id = ?
        """,
        (
            call_id,
        )
    )


    connection.commit()


    deleted = (
        cursor.rowcount > 0
    )


    connection.close()


    if not deleted:

        return jsonify({
            "success": False,

            "message": (
                "Η κλήση δεν βρέθηκε."
            )
        }), 404


    return jsonify({
        "success": True,

        "message": (
            "Η κλήση μεταφέρθηκε "
            "στα διαγραμμένα."
        )
    })


# =========================================================
# ΕΠΑΝΑΦΟΡΑ ΔΙΑΓΡΑΜΜΕΝΗΣ ΚΛΗΣΗΣ
# =========================================================

@app.post(
    "/api/calls/<int:call_id>/restore"
)
def restore_call(call_id):

    connection = get_connection()


    cursor = connection.execute(
        """
        UPDATE call_history
        SET deleted = 0
        WHERE id = ?
        """,
        (
            call_id,
        )
    )


    connection.commit()


    restored = (
        cursor.rowcount > 0
    )


    connection.close()


    if not restored:

        return jsonify({
            "success": False,

            "message": (
                "Η κλήση δεν βρέθηκε."
            )
        }), 404


    return jsonify({
        "success": True,

        "message": (
            "Η κλήση επαναφέρθηκε."
        )
    })

# =========================================================
# ΑΠΟΘΗΚΕΥΣΗ ΠΑΡΑΓΓΕΛΙΑΣ
# =========================================================

@app.post("/api/orders")
def save_order():

    data = request.get_json(silent=True) or {}

    fullname = str(data.get("fullname") or "").strip()
    phone1 = str(data.get("phone1") or "").strip()
    phone2 = str(data.get("phone2") or "").strip()
    phone3 = str(data.get("phone3") or "").strip()
    area = str(data.get("area") or "").strip()
    address = str(data.get("address") or "").strip()
    floor = str(data.get("floor") or "").strip()
    notes = str(data.get("notes") or "").strip()
    order_notes = str(data.get("order_notes") or "").strip()

    if not fullname or not phone1:
        return jsonify({
            "success": False,
            "message": "Χρειάζονται ονοματεπώνυμο και κύριο τηλέφωνο."
        }), 400

    connection = get_connection()

    customer_row = connection.execute(
        """
        SELECT id
        FROM customers
        WHERE phone1 = ?
           OR phone2 = ?
           OR phone3 = ?
        LIMIT 1
        """,
        (
            phone1,
            phone1,
            phone1
        )
    ).fetchone()

    customer_id = (
        customer_row["id"]
        if customer_row
        else None
    )

    cursor = connection.execute(
        """
        INSERT INTO orders (
            customer_id,
            fullname,
            phone1,
            phone2,
            phone3,
            area,
            address,
            floor,
            notes,

            delivery_3kg,
            delivery_10kg_mix,
            delivery_10kg_propane,
            delivery_13kg,
            delivery_25kg,

            return_3kg,
            return_10kg_mix,
            return_10kg_propane,
            return_13kg,
            return_25kg,

            order_notes
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?
        )
        """,
        (
            customer_id,
            fullname,
            phone1,
            phone2,
            phone3,
            area,
            address,
            floor,
            notes,

            int(data.get("delivery_3kg") or 0),
            int(data.get("delivery_10kg_mix") or 0),
            int(data.get("delivery_10kg_propane") or 0),
            int(data.get("delivery_13kg") or 0),
            int(data.get("delivery_25kg") or 0),

            int(data.get("return_3kg") or 0),
            int(data.get("return_10kg_mix") or 0),
            int(data.get("return_10kg_propane") or 0),
            int(data.get("return_13kg") or 0),
            int(data.get("return_25kg") or 0),

            order_notes
        )
    )

    connection.commit()

    order_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "success": True,
        "order_id": order_id,
        "message": "Η παραγγελία αποθηκεύτηκε."
    })
# =========================================================
# ΠΛΗΘΟΣ ΣΗΜΕΡΙΝΩΝ ΠΑΡΑΓΓΕΛΙΩΝ
# =========================================================

@app.get("/api/orders/today-count")
def get_today_orders_count():

    connection = get_connection()

    row = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM orders
        WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime')
        """
    ).fetchone()

    connection.close()

    return jsonify({
        "success": True,
        "count": row["total"] if row else 0
    })
# =========================================================
# ΛΙΣΤΑ ΣΗΜΕΡΙΝΩΝ ΠΑΡΑΓΓΕΛΙΩΝ
# =========================================================

@app.get("/api/orders/today")
def get_today_orders():

    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            fullname,
            phone1,
            area,
            address,
            delivery_3kg,
            delivery_10kg_mix,
            delivery_10kg_propane,
            delivery_13kg,
            delivery_25kg,
            order_notes,
            created_at
        FROM orders
        WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime')
  AND COALESCE(status, 'new') != 'cleared'
ORDER BY created_at DESC
        """
    ).fetchall()

    connection.close()

    orders = []

    for row in rows:
        orders.append({
            "id": row["id"],
            "fullname": row["fullname"],
            "phone1": row["phone1"],
            "area": row["area"],
            "address": row["address"],
            "delivery_3kg": row["delivery_3kg"],
            "delivery_10kg_mix": row["delivery_10kg_mix"],
            "delivery_10kg_propane": row["delivery_10kg_propane"],
            "delivery_13kg": row["delivery_13kg"],
            "delivery_25kg": row["delivery_25kg"],
            "order_notes": row["order_notes"],
            "created_at": row["created_at"]
        })

    return jsonify({
        "success": True,
        "orders": orders
    })

def create_order_status_column():
    connection = get_connection()

    columns = connection.execute(
        "PRAGMA table_info(orders)"
    ).fetchall()

    column_names = [column["name"] for column in columns]

    if "status" not in column_names:
        connection.execute(
            "ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'new'"
        )
        connection.commit()

    connection.close()
    # =========================================================
# ΚΑΘΑΡΙΣΜΟΣ ΟΛΩΝ ΤΩΝ ΣΗΜΕΡΙΝΩΝ ΠΑΡΑΓΓΕΛΙΩΝ
# ΧΩΡΙΣ ΔΙΑΓΡΑΦΗ ΑΠΟ ΤΟ ΙΣΤΟΡΙΚΟ
# =========================================================

@app.post("/api/orders/today/clear")
def clear_today_orders():

    connection = get_connection()

    cursor = connection.execute(
        """
        UPDATE orders
        SET status = 'cleared'
        WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime')
          AND COALESCE(status, 'new') != 'cleared'
        """
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "cleared": cursor.rowcount
    })
# =========================================================
# ΑΡΧΙΚΟΠΟΙΗΣΗ ΒΑΣΗΣ
# =========================================================

create_call_history_table()

create_customer_cylinder_columns()

create_order_status_column()


# =========================================================
# ΕΚΚΙΝΗΣΗ FLASK
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False
    )