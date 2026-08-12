import sqlite3
from pathlib import Path


DATABASE_PATH = Path(__file__).resolve().parent / "allgasklima.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            customer_code TEXT UNIQUE,

            fullname TEXT NOT NULL,

            phone1 TEXT NOT NULL UNIQUE,
            phone2 TEXT,
            phone3 TEXT,

            area TEXT,
            address TEXT,
            floor TEXT,
            notes TEXT,

            is_active INTEGER NOT NULL DEFAULT 1,

            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_customers_phone2
        ON customers(phone2)
        """
    )

    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_customers_phone3
        ON customers(phone3)
        """
    )
    cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        customer_id INTEGER,

        fullname TEXT NOT NULL,

        phone1 TEXT,
        phone2 TEXT,
        phone3 TEXT,

        area TEXT,
        address TEXT,
        floor TEXT,
        notes TEXT,

        delivery_3kg INTEGER NOT NULL DEFAULT 0,
        delivery_10kg_mix INTEGER NOT NULL DEFAULT 0,
        delivery_10kg_propane INTEGER NOT NULL DEFAULT 0,
        delivery_13kg INTEGER NOT NULL DEFAULT 0,
        delivery_25kg INTEGER NOT NULL DEFAULT 0,

        return_3kg INTEGER NOT NULL DEFAULT 0,
        return_10kg_mix INTEGER NOT NULL DEFAULT 0,
        return_10kg_propane INTEGER NOT NULL DEFAULT 0,
        return_13kg INTEGER NOT NULL DEFAULT 0,
        return_25kg INTEGER NOT NULL DEFAULT 0,

        order_notes TEXT,

        status TEXT NOT NULL DEFAULT 'pending',

        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (customer_id)
            REFERENCES customers(id)
    )
    """
)
    connection.commit()
    connection.close()

    print("Η επαγγελματική δομή της βάσης δημιουργήθηκε σωστά.")


if __name__ == "__main__":
    create_tables()