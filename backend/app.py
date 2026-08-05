from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import time
from datetime import datetime
from pathlib import Path


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


# Εδώ κρατάμε προσωρινά την τελευταία εισερχόμενη κλήση.
latest_incoming_call = None


@app.route("/")
def index():
    return send_from_directory("../frontend", "index.html")


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


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


@app.get("/api/customer")
def find_customer():
    phone = request.args.get("phone", "").strip()

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
    data = request.get_json(silent=True) or {}

    fullname = str(data.get("fullname", "")).strip()
    phone1 = str(data.get("phone1", "")).strip()
    phone2 = str(data.get("phone2", "")).strip()
    phone3 = str(data.get("phone3", "")).strip()
    area = str(data.get("area", "")).strip()
    address = str(data.get("address", "")).strip()
    floor = str(data.get("floor", "")).strip()
    notes = str(data.get("notes", "")).strip()

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

    except sqlite3.IntegrityError:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Υπάρχει ήδη πελάτης με αυτό το κύριο τηλέφωνο."
        }), 409

    customer = connection.execute(
        """
        SELECT *
        FROM customers
        WHERE id = ?
        """,
        (customer_id,)
    ).fetchone()

    connection.close()

    return jsonify({
        "success": True,
        "message": "Ο πελάτης αποθηκεύτηκε σωστά.",
        "customer": dict(customer)
    }), 201


@app.post("/api/incoming-call")
def incoming_call():
    global latest_incoming_call

    data = request.get_json(silent=True) or {}

    phone = str(data.get("phone", "")).strip()

    if not phone:
        return jsonify({
            "success": False,
            "message": "Δεν δόθηκε αριθμός."
        }), 400

    now = datetime.now().astimezone()

    latest_incoming_call = {
        "id": str(time.time_ns()),
        "phone": phone,
        "date": now.strftime("%d/%m/%Y"),
        "time": now.strftime("%H:%M:%S"),
        "timestamp": now.isoformat()
    }

    customer = get_customer_by_phone(phone)

    if customer:
        print(
            f"📞 {latest_incoming_call['date']} "
            f"{latest_incoming_call['time']} - "
            f"Αναγνωρίστηκε πελάτης: {customer['fullname']}"
        )

        return jsonify({
            "success": True,
            "found": True,
            "call": latest_incoming_call,
            "customer": dict(customer)
        })

    print(
        f"📞 {latest_incoming_call['date']} "
        f"{latest_incoming_call['time']} - "
        f"Άγνωστος αριθμός: {phone}"
    )

    return jsonify({
        "success": True,
        "found": False,
        "call": latest_incoming_call,
        "phone": phone
    })


@app.get("/api/latest-call")
def get_latest_call():
    if latest_incoming_call is None:
        return jsonify({
            "success": True,
            "has_call": False
        })

    return jsonify({
        "success": True,
        "has_call": True,
        "call": latest_incoming_call
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False
    )
