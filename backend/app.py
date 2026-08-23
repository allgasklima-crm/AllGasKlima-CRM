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
# ΙΣΤΟΡΙΚΟ ΚΛΗΣΕΩΝ
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
        "cylinder_screw": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_clip": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_3kg": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_10_mix": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_10_propane": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_13kg": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_25kg": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_barrel": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_short": "INTEGER NOT NULL DEFAULT 0",
        "cylinder_tall": "INTEGER NOT NULL DEFAULT 0",
        "loan_heaters": "INTEGER NOT NULL DEFAULT 0",
        "loan_empty_cylinders": "INTEGER NOT NULL DEFAULT 0",
        "customer_type": "TEXT NOT NULL DEFAULT 'retail'"
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
# STATUS ΠΑΡΑΓΓΕΛΙΑΣ
# =========================================================

def create_order_status_column():
    connection = get_connection()

    columns = connection.execute(
        "PRAGMA table_info(orders)"
    ).fetchall()

    column_names = [
        column["name"]
        for column in columns
    ]

    if "status" not in column_names:
        connection.execute(
            """
            ALTER TABLE orders
            ADD COLUMN status TEXT DEFAULT 'new'
            """
        )

        connection.commit()

    connection.close()


# =========================================================
# ΠΕΔΙΑ ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΗΣ ΠΑΡΑΓΓΕΛΙΑΣ
# =========================================================

def create_order_schedule_columns():

    connection = get_connection()

    columns = connection.execute(
        "PRAGMA table_info(orders)"
    ).fetchall()

    column_names = [
        column["name"]
        for column in columns
    ]

    if "scheduled_date" not in column_names:

        connection.execute(
            """
            ALTER TABLE orders
            ADD COLUMN scheduled_date TEXT
            """
        )

    if "scheduled_time" not in column_names:

        connection.execute(
            """
            ALTER TABLE orders
            ADD COLUMN scheduled_time TEXT
            """
        )

    if "reminder_minutes" not in column_names:

        connection.execute(
            """
            ALTER TABLE orders
            ADD COLUMN reminder_minutes INTEGER DEFAULT 30
            """
        )

    connection.commit()
    connection.close()


# =========================================================
# BOOLEAN CHECKBOX
# =========================================================

def checkbox_value(data, key):
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
            phone
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
# ΑΡΧΙΚΗ
# =========================================================

@app.route("/")
def index():
    return send_from_directory(
        "../frontend",
        "index.html"
    )


# =========================================================
# ΕΥΡΕΤΗΡΙΟ ΠΕΛΑΤΩΝ
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


# =========================================================
# ΔΙΑΓΡΑΦΗ ΠΕΛΑΤΗ
# =========================================================

@app.delete("/api/customer/<int:customer_id>")
def delete_customer(customer_id):
    connection = get_connection()

    customer = connection.execute(
        """
        SELECT id
        FROM customers
        WHERE id = ?
        """,
        (
            customer_id,
        )
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
        (
            customer_id,
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Ο πελάτης διαγράφηκε επιτυχώς."
    })


# =========================================================
# ΑΝΑΖΗΤΗΣΗ ΠΕΛΑΤΗ
# =========================================================

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

    connection = get_connection()

    search_like = (
        f"%{search_text}%"
    )

    customers = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE fullname LIKE ?
           OR phone1 LIKE ?
           OR phone2 LIKE ?
           OR phone3 LIKE ?
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
            search_like
        )
    ).fetchall()

    connection.close()

    if len(customers) == 0:
        return jsonify({
            "success": True,
            "found": False,
            "multiple": False,
            "search_text": search_text
        })

    if len(customers) == 1:
        return jsonify({
            "success": True,
            "found": True,
            "multiple": False,
            "customer": dict(
                customers[0]
            )
        })

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

    customer_type = str(
        data.get(
            "customer_type",
            "retail"
        )
    ).strip().lower()

    if customer_type not in (
        "retail",
        "wholesale"
    ):
        customer_type = "retail"

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

    loan_empty_cylinders = int(
    data.get(
        "loan_empty_cylinders",
        0
    ) or 0
)

    if loan_empty_cylinders < 0:
        loan_empty_cylinders = 0
    

    if loan_heaters < 0:
        loan_heaters = 0

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
                cylinder_tall,
                loan_heaters,
                loan_empty_cylinders,
                customer_type
            )
                VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?
            )
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
                cylinder_tall,
                loan_heaters,
                loan_empty_cylinders,
                customer_type
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
# ΕΝΗΜΕΡΩΣΗ ΠΕΛΑΤΗ
# =========================================================

@app.put("/api/customer/<int:customer_id>")
def update_customer(customer_id):
    data = request.get_json(
        silent=True
    ) or {}
    print("UPDATE CUSTOMER DATA:", data, flush=True)
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

    customer_type = str(
        data.get(
            "customer_type",
            "retail"
        )
    ).strip().lower()

    if customer_type not in (
        "retail",
        "wholesale"
    ):
        customer_type = "retail"

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

    loan_heaters = int(
        data.get(
            "loan_heaters",
            0
        ) or 0
    )

    if loan_heaters < 0:
        loan_heaters = 0

    loan_empty_cylinders = int(
        data.get(
            "loan_empty_cylinders",
            0
        ) or 0
    )

    if loan_empty_cylinders < 0:
        loan_empty_cylinders = 0

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
            "message": "Ο πελάτης δεν βρέθηκε."
        }), 404

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
                cylinder_tall = ?,
                loan_heaters = ?,
                loan_empty_cylinders = ?,
                customer_type = ?
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
                loan_heaters,
                loan_empty_cylinders,
                customer_type,
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
            "message": "Δεν δόθηκε αριθμός."
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

@app.delete("/api/calls/<int:call_id>")
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
            "message": "Η κλήση δεν βρέθηκε."
        }), 404

    return jsonify({
        "success": True,

        "message": (
            "Η κλήση μεταφέρθηκε "
            "στα διαγραμμένα."
        )
    })


# =========================================================
# ΕΠΑΝΑΦΟΡΑ ΚΛΗΣΗΣ
# =========================================================

@app.post("/api/calls/<int:call_id>/restore")
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
            "message": "Η κλήση δεν βρέθηκε."
        }), 404

    return jsonify({
        "success": True,
        "message": "Η κλήση επαναφέρθηκε."
    })


# =========================================================
# ΑΠΟΘΗΚΕΥΣΗ ΠΑΡΑΓΓΕΛΙΑΣ
# =========================================================

@app.post("/api/orders")
def save_order():
    data = request.get_json(
        silent=True
    ) or {}

    fullname = str(
        data.get("fullname") or ""
    ).strip()

    phone1 = str(
        data.get("phone1") or ""
    ).strip()

    phone2 = str(
        data.get("phone2") or ""
    ).strip()

    phone3 = str(
        data.get("phone3") or ""
    ).strip()

    area = str(
        data.get("area") or ""
    ).strip()

    address = str(
        data.get("address") or ""
    ).strip()

    floor = str(
        data.get("floor") or ""
    ).strip()

    notes = str(
        data.get("notes") or ""
    ).strip()

    order_notes = str(
        data.get("order_notes") or ""
    ).strip()

    if not fullname or not phone1:
        return jsonify({
            "success": False,

            "message": (
                "Χρειάζονται ονοματεπώνυμο "
                "και κύριο τηλέφωνο."
            )
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
            loan_heaters,
            loan_empty_cylinders,
            order_notes,
            status
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            'new'
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

            int(
                data.get(
                    "delivery_3kg"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_10kg_mix"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_10kg_propane"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_13kg"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_25kg"
                ) or 0
            ),

            int(
                data.get(
                    "return_3kg"
                ) or 0
            ),

            int(
                data.get(
                    "return_10kg_mix"
                ) or 0
            ),

            int(
                data.get(
                    "return_10kg_propane"
                ) or 0
            ),

            int(
                data.get(
                    "return_13kg"
                ) or 0
            ),

            int(
                data.get(
                    "return_25kg"
                ) or 0
            ),
            int(
                data.get(
                    "loan_heaters"
                ) or 0
            ),

            int(
                data.get(
                    "loan_empty_cylinders"
                ) or 0
            ),
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
        WHERE DATE(
            created_at,
            'localtime'
        ) = DATE(
            'now',
            'localtime'
        )
        AND COALESCE(
            status,
            'new'
        ) != 'cleared'
        """
    ).fetchone()

    connection.close()

    return jsonify({
        "success": True,
        "count": (
            row["total"]
            if row
            else 0
        )
    })


# =========================================================
# ΣΗΜΕΡΙΝΕΣ ΠΑΡΑΓΓΕΛΙΕΣ
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
            status,
            created_at
        FROM orders
        WHERE DATE(
            created_at,
            'localtime'
        ) = DATE(
            'now',
            'localtime'
        )
        AND COALESCE(
            status,
            'new'
        ) != 'cleared'
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

            "delivery_3kg":
                row["delivery_3kg"],

            "delivery_10kg_mix":
                row["delivery_10kg_mix"],

            "delivery_10kg_propane":
                row["delivery_10kg_propane"],

            "delivery_13kg":
                row["delivery_13kg"],

            "delivery_25kg":
                row["delivery_25kg"],

            "order_notes":
                row["order_notes"],

            "status":
                row["status"],

            "created_at":
                row["created_at"]
        })

    return jsonify({
        "success": True,
        "orders": orders
    })

# =========================================================
# ΙΣΤΟΡΙΚΟ ΠΑΡΑΓΓΕΛΙΩΝ ΠΕΛΑΤΗ
# =========================================================

@app.get("/api/customer/<int:customer_id>/history")
def get_customer_history(customer_id):

    connection = get_connection()

    customer = connection.execute(
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
        WHERE id = ?
        """,
        (customer_id,)
    ).fetchone()

    if not customer:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Ο πελάτης δεν βρέθηκε."
        }), 404


    rows = connection.execute(
        """
        SELECT
            id,
            customer_id,

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

            loan_heaters,
            loan_empty_cylinders,

            order_notes,
            status,
            created_at,
            scheduled_date,
            scheduled_time

        FROM orders

        WHERE customer_id = ?

        ORDER BY
            created_at DESC,
            id DESC
        """,
        (customer_id,)
    ).fetchall()


    history = []

    for row in rows:

        history.append({

            "id":
                row["id"],

            "delivery_3kg":
                row["delivery_3kg"],

            "delivery_10kg_mix":
                row["delivery_10kg_mix"],

            "delivery_10kg_propane":
                row["delivery_10kg_propane"],

            "delivery_13kg":
                row["delivery_13kg"],

            "delivery_25kg":
                row["delivery_25kg"],


            "return_3kg":
                row["return_3kg"],

            "return_10kg_mix":
                row["return_10kg_mix"],

            "return_10kg_propane":
                row["return_10kg_propane"],

            "return_13kg":
                row["return_13kg"],

            "return_25kg":
                row["return_25kg"],

            "loan_heaters":
                row["loan_heaters"],

            "loan_empty_cylinders":
                row["loan_empty_cylinders"],


            "order_notes":
                row["order_notes"],

            "status":
                row["status"],

            "created_at":
                row["created_at"],

            "scheduled_date":
                row["scheduled_date"],

            "scheduled_time":
                row["scheduled_time"]
        })


    connection.close()


    return jsonify({

        "success": True,

        "customer": {
            "id":
                customer["id"],

            "fullname":
                customer["fullname"],

            "phone1":
                customer["phone1"],

            "phone2":
                customer["phone2"],

            "phone3":
                customer["phone3"],

            "area":
                customer["area"],

            "address":
                customer["address"]
        },

        "history": history
    })

# =========================================================
# ΑΠΟΣΤΟΛΗ ΣΤΟΝ ΟΔΗΓΟ
# =========================================================

@app.post(
    "/api/orders/<int:order_id>/send-to-driver"
)
def send_order_to_driver(order_id):
    connection = get_connection()

    order = connection.execute(
        """
        SELECT id
        FROM orders
        WHERE id = ?
        """,
        (
            order_id,
        )
    ).fetchone()

    if not order:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Η παραγγελία δεν βρέθηκε."
        }), 404

    connection.execute(
        """
        UPDATE orders
        SET status = 'in_delivery'
        WHERE id = ?
        """,
        (
            order_id,
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,

        "message": (
            "Η παραγγελία πέρασε σε διανομή."
        )
    })


# =========================================================
# ΟΛΟΚΛΗΡΩΣΗ ΠΑΡΑΓΓΕΛΙΑΣ
# =========================================================

@app.post(
    "/api/orders/<int:order_id>/complete"
)
def complete_order(order_id):
    connection = get_connection()

    cursor = connection.execute(
        """
        UPDATE orders
        SET status = 'completed'
        WHERE id = ?
        """,
        (
            order_id,
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "updated": cursor.rowcount
    })


# =========================================================
# ΚΑΘΑΡΙΣΜΟΣ ΣΗΜΕΡΙΝΩΝ ΠΑΡΑΓΓΕΛΙΩΝ
# =========================================================

@app.post("/api/orders/today/clear")
def clear_today_orders():
    connection = get_connection()

    cursor = connection.execute(
        """
        UPDATE orders
        SET status = 'cleared'
        WHERE DATE(
            created_at,
            'localtime'
        ) = DATE(
            'now',
            'localtime'
        )
        AND COALESCE(
            status,
            'new'
        ) != 'cleared'
        """
    )

    connection.commit()

    cleared = cursor.rowcount

    connection.close()

    return jsonify({
        "success": True,
        "cleared": cleared
    })


# =========================================================
# ΑΠΟΘΗΚΕΥΣΗ ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΗΣ ΠΑΡΑΓΓΕΛΙΑΣ
# =========================================================

@app.post("/api/orders/scheduled")
def save_scheduled_order():

    data = request.get_json(
        silent=True
    ) or {}

    fullname = str(
        data.get("fullname") or ""
    ).strip()

    phone1 = str(
        data.get("phone1") or ""
    ).strip()

    phone2 = str(
        data.get("phone2") or ""
    ).strip()

    phone3 = str(
        data.get("phone3") or ""
    ).strip()

    area = str(
        data.get("area") or ""
    ).strip()

    address = str(
        data.get("address") or ""
    ).strip()

    floor = str(
        data.get("floor") or ""
    ).strip()

    notes = str(
        data.get("notes") or ""
    ).strip()

    order_notes = str(
        data.get("order_notes") or ""
    ).strip()

    scheduled_date = str(
        data.get("scheduled_date") or ""
    ).strip()

    scheduled_time = str(
        data.get("scheduled_time") or ""
    ).strip()

    reminder_minutes = int(
        data.get("reminder_minutes") or 30
    )

    if not fullname or not phone1:

        return jsonify({
            "success": False,
            "message": (
                "Χρειάζονται ονοματεπώνυμο "
                "και κύριο τηλέφωνο."
            )
        }), 400

    if not scheduled_date or not scheduled_time:

        return jsonify({
            "success": False,
            "message": (
                "Χρειάζονται ημερομηνία "
                "και ώρα παράδοσης."
            )
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

            order_notes,
            status,
            scheduled_date,
            scheduled_time,
            reminder_minutes
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?,
            'scheduled',
            ?, ?, ?
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

            int(
                data.get(
                    "delivery_3kg"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_10kg_mix"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_10kg_propane"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_13kg"
                ) or 0
            ),

            int(
                data.get(
                    "delivery_25kg"
                ) or 0
            ),

            int(
                data.get(
                    "return_3kg"
                ) or 0
            ),

            int(
                data.get(
                    "return_10kg_mix"
                ) or 0
            ),

            int(
                data.get(
                    "return_10kg_propane"
                ) or 0
            ),

            int(
                data.get(
                    "return_13kg"
                ) or 0
            ),

            int(
                data.get(
                    "return_25kg"
                ) or 0
            ),

            order_notes,
            scheduled_date,
            scheduled_time,
            reminder_minutes
        )
    )

    connection.commit()

    order_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "success": True,
        "order_id": order_id,
        "message": (
            "Η προγραμματισμένη "
            "παραγγελία αποθηκεύτηκε."
        )
    })


# =========================================================
# ΛΙΣΤΑ ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΩΝ ΠΑΡΑΓΓΕΛΙΩΝ
# =========================================================

@app.get("/api/orders/scheduled")
def get_scheduled_orders():

    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            customer_id,
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
            scheduled_date,
            scheduled_time,
            reminder_minutes,
            status
        FROM orders
        WHERE status = 'scheduled'
        ORDER BY
            scheduled_date ASC,
            scheduled_time ASC
        """
    ).fetchall()

    connection.close()

    return jsonify({
        "success": True,
        "orders": [
            dict(row)
            for row in rows
        ]
    })


# =========================================================
# ΑΡΧΙΚΟΠΟΙΗΣΗ ΒΑΣΗΣ
# =========================================================

create_call_history_table()
create_customer_cylinder_columns()
create_order_status_column()
create_order_schedule_columns()


# =========================================================
# ΕΚΚΙΝΗΣΗ FLASK
# =========================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True,
        use_reloader=False
    )