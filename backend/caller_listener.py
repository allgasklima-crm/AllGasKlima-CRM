import time

import requests
from bs4 import BeautifulSoup
from requests.auth import HTTPBasicAuth


ROUTER_BASE_URL = "http://192.168.1.1"

HOME_URL = (
    f"{ROUTER_BASE_URL}/cgi-bin/page.pl"
    "?type=home"
)

CALL_DETAILS_URL = (
    f"{ROUTER_BASE_URL}/cgi-bin/page.pl"
    "?type=status&page=voice_cdr"
)

CRM_INCOMING_CALL_URL = (
    "http://127.0.0.1:5000/api/incoming-call"
)

ROUTER_USERNAME = "user"

# Βάλε μέσα στα εισαγωγικά τον πραγματικό κωδικό του user.
ROUTER_PASSWORD = "MWNDAQ6W"

CHECK_INTERVAL_SECONDS = 2


def create_router_session():
    session = requests.Session()

    session.auth = HTTPBasicAuth(
        ROUTER_USERNAME,
        ROUTER_PASSWORD
    )

    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64)"
        )
    })

    response = session.get(
        HOME_URL,
        timeout=10
    )

    response.raise_for_status()

    print("Σύνδεση με το router επιτυχής.")
    print(
        "Cookies:",
        list(session.cookies.keys())
    )

    return session


def get_latest_incoming_number(session):
    response = session.get(
        CALL_DETAILS_URL,
        timeout=10
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    page_text = soup.get_text(
        " ",
        strip=True
    )

    if "Call Details" not in page_text:
        raise RuntimeError(
            "Η σελίδα Call Details δεν φορτώθηκε σωστά."
        )

    tables = soup.find_all("table")

    for table in tables:
        table_text = table.get_text(
            " ",
            strip=True
        )

        if (
            "Last Numbers per Line" not in table_text
            or "Incoming" not in table_text
        ):
            continue

        for row in table.find_all("tr"):
            cells = row.find_all(
                ["td", "th"]
            )

            values = [
                cell.get_text(
                    " ",
                    strip=True
                )
                for cell in cells
            ]

            if (
                len(values) >= 3
                and values[0] == "Line 1"
            ):
                return values[1]

    return None


def send_number_to_crm(incoming_number):
    response = requests.post(
        CRM_INCOMING_CALL_URL,
        json={
            "phone": incoming_number
        },
        timeout=3
    )

    response.raise_for_status()

    print(
        "Ο αριθμός στάλθηκε στο CRM:",
        incoming_number
    )


def main():
    print(
        "AllGasKlima Call Listener ξεκίνησε..."
    )

    session = None
    last_number = None

    while True:
        try:
            if session is None:
                session = create_router_session()

            incoming_number = (
                get_latest_incoming_number(session)
            )

            if (
                incoming_number
                and incoming_number != last_number
            ):
                last_number = incoming_number

                print(
                    "Τελευταίος εισερχόμενος αριθμός:",
                    incoming_number
                )

                try:
                    send_number_to_crm(
                        incoming_number
                    )

                except requests.RequestException as crm_error:
                    print(
                        "Δεν στάλθηκε ο αριθμός στο CRM:",
                        crm_error
                    )

        except requests.HTTPError as error:
            print(
                "Το router απέρριψε τη σύνδεση:",
                error
            )

            session = None

        except requests.RequestException as error:
            print(
                "Αποτυχία επικοινωνίας με το router:",
                error
            )

            session = None

        except Exception as error:
            print(
                "Σφάλμα ανάγνωσης:",
                error
            )

        time.sleep(
            CHECK_INTERVAL_SECONDS
        )


if __name__ == "__main__":
    main()