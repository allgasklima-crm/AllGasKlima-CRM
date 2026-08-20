import time
import re

import requests
from bs4 import BeautifulSoup
from requests.auth import HTTPBasicAuth


ROUTER_BASE_URL = "http://192.168.1.1"

HOME_URL = (
    f"{ROUTER_BASE_URL}/cgi-bin/page.pl"
    "?type=home"
)

PHONE_LINES_URL = (
    f"{ROUTER_BASE_URL}/cgi-bin/page.pl"
    "?type=status&page=voice"
)

CRM_INCOMING_CALL_URL = (
    "http://127.0.0.1:5001/api/incoming-call"
)

ROUTER_USERNAME = "user"
ROUTER_PASSWORD = "MWNDAQ6W"

BUSINESS_PHONE = "2310705109"

CHECK_INTERVAL_SECONDS = 1


def normalize_phone(value):
    return re.sub(r"\D", "", value or "")


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


def get_ringing_call(session):
    response = session.get(
        PHONE_LINES_URL,
        timeout=10
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    rows = soup.find_all("tr")

    header_found = False

    for row in rows:
        cells = row.find_all(
            ["td", "th"],
            recursive=False
        )

        values = [
            cell.get_text(
                " ",
                strip=True
            )
            for cell in cells
        ]

        if len(values) >= 6:
            first_six = [
                value.strip()
                for value in values[:6]
            ]

            if first_six == [
                "Calling",
                "Called",
                "Peers",
                "Codec",
                "Status",
                "Duration"
            ]:
                header_found = True
                continue

        if not header_found:
            continue

        if len(values) < 6:
            continue

        calling = values[0].strip()
        called = values[1].strip()
        peers = values[2].strip()
        codec = values[3].strip()
        status = values[4].strip()
        duration = values[5].strip()

        calling_digits = normalize_phone(calling)
        called_digits = normalize_phone(called)
        business_digits = normalize_phone(BUSINESS_PHONE)

        if not calling_digits:
            continue

        if not called_digits.endswith(
            business_digits
        ):
            continue

        if status.lower() != "ring":
            continue

        if len(calling_digits) < 10:
            continue

        return {
            "phone": calling_digits,
            "called": called_digits,
            "peers": peers,
            "codec": codec,
            "status": status,
            "duration": duration
        }

    return None


def send_number_to_crm(phone):
    response = requests.post(
        CRM_INCOMING_CALL_URL,
        json={
            "phone": phone
        },
        timeout=3
    )

    response.raise_for_status()

    print(
        "Ο αριθμός στάλθηκε στο CRM:",
        phone
    )


def main():
    print(
        "AllGasKlima Call Listener ξεκίνησε..."
    )

    session = None
    active_ringing_phone = None

    while True:
        try:
            if session is None:
                session = create_router_session()

            ringing_call = get_ringing_call(
                session
            )

            if ringing_call:
                current_phone = ringing_call["phone"]

                if current_phone != active_ringing_phone:
                    active_ringing_phone = current_phone

                    print(
                        "Νέα εισερχόμενη κλήση:",
                        current_phone
                    )

                    print(
                        "Κατάσταση:",
                        ringing_call["status"]
                    )

                    print(
                        "Διάρκεια:",
                        ringing_call["duration"]
                    )

                    try:
                        send_number_to_crm(
                            current_phone
                        )

                    except requests.RequestException as crm_error:
                        print(
                            "Δεν στάλθηκε ο αριθμός στο CRM:",
                            crm_error
                        )

            else:
                if active_ringing_phone is not None:
                    print(
                        "Η κλήση τερματίστηκε. "
                        "Έτοιμο για την επόμενη."
                    )

                active_ringing_phone = None

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