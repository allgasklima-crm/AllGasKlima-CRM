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


@app.route("/")
def index():
    return send_from_directory(
        "../frontend",
        "index.html"
    )


def get_connection():
    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    return connection


def create_call_history_table():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS call_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            called_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


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
        (phone, phone, phone)
    ).fetchone()

    connection.close()

    return customer


def make_call_response(call_row):
    phone = call_row["phone"]

    called_at = datetime.fromisoformat(
        call_row["called_at"]
    )

    customer = get_customer_by_phone(phone)

    return {
        "id": call_row["id"],
        "phone": phone,
        "date": called_at.strftime("%d/%m/%Y"),
        "time": called_at.strftime("%H:%M:%S"),
        "timestamp": called_at.isoformat(),
        "found": customer is not None,
        "customer_name": (
            customer["fullname"]
            if customer is not None
            else None
        )
    }


@app.get("/api/customer")
def find_customer():
    phone = request.args.get(
        "phone",
        ""
    ).strip()

    if not phone:
        return jsonify({
            "success": False,
            "message": "Δεν δόθηκε αριθμός τηλεφώνου."
        }), 400

    customer = get_customer_by_phone(phone)

    if customer is None:
        return jsonify({
            "success": True,
            "found": False,
            "phone": phone
        })

    return jsonify({
        "success": True,
        "found": True,
        "customer": dict(customer)
    })


@app.post("/api/customer")
def create_customer():
    data = request.get_json(
        silent=True
    ) or {}

    fullname = str(
        data.get("fullname", "")
    ).strip()

    phone1 = str(
        data.get("phone1", "")
    ).strip()

    phone2 = str(
        data.get("phone2", "")
    ).strip()

    phone3 = str(
        data.get("phone3", "")
    ).strip()

    area = str(
        data.get("area", "")
    ).strip()

    address = str(
        data.get("address", "")
    ).strip()

    floor = str(
        data.get("floor", "")
    ).strip()

    notes = str(
        data.get("notes", "")
    ).strip()

    if not fullname:
        return jsonify({
            "success": False,
            "message": "Το ονοματεπώνυμο είναι υποχρεωτικό."
        }), 400

    if not phone1:
        return jsonify({
            "success": False,
            "message": "Το κύριο τηλέφωνο είναι υποχρεωτικό."
        }), 400

    existing_customer = get_customer_by_phone(
        phone1
    )

    if existing_customer is not None:
        return jsonify({
            "success": False,
            "message": "Υπάρχει ήδη πελάτης με αυτό το τηλέφωνο."
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
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                fullname,
                phone1,
                phone2 or None,
                phone3 or None,
                area or None,
                address or None,
                floor or None,
                notes or None
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
            (customer_id,)
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
        "message": "Ο πελάτης αποθηκεύτηκε σωστά.",
        "customer": dict(customer)
    }), 201


@app.post("/api/incoming-call")
def incoming_call():
    data = request.get_json(
        silent=True
    ) or {}

    phone = str(
        data.get("phone", "")
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
        (call_id,)
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
        "call": make_call_response(call_row)
    })


@app.get("/api/calls")
def get_call_history():
    limit_text = request.args.get(
        "limit",
        "50"
    )

    try:
        limit = int(limit_text)
    except ValueError:
        limit = 50

    limit = max(
        1,
        min(limit, 200)
    )

    connection = get_connection()

    call_rows = connection.execute(
        """
        SELECT *
        FROM call_history
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,)
    ).fetchall()

    connection.close()

    calls = [
        make_call_response(call_row)
        for call_row in call_rows
    ]

    return jsonify({
        "success": True,
        "calls": calls
    })


@app.delete("/api/calls/<int:call_id>")
def delete_call(call_id):
    connection = get_connection()

    cursor = connection.execute(
        """
        DELETE FROM call_history
        WHERE id = ?
        """,
        (call_id,)
    )

    connection.commit()

    deleted = cursor.rowcount > 0

    connection.close()

    if not deleted:
        return jsonify({
            "success": False,
            "message": "Η κλήση δεν βρέθηκε."
        }), 404

    return jsonify({
        "success": True,
        "message": "Η κλήση διαγράφηκε."
    })


create_call_history_table()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False
    )