let routeCurrentPosition = null;

function getCurrentPositionForRoute() {
    if (!navigator.geolocation) {
        console.error("GPS is not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            routeCurrentPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            console.log(
                "Current location:",
                routeCurrentPosition
            );
        },
        (error) => {
            console.error(
                "GPS error:",
                "code =",
                error.code,
                "message =",
                error.message
            );
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
        }
    );
}

getCurrentPositionForRoute();

const routeOpenGoogleMapsBtn =
    document.getElementById("openGoogleMapsBtn");

const routeAddressInput =
    document.getElementById("address");

const routeAreaInput =
    document.getElementById("area");

if (routeOpenGoogleMapsBtn) {
    routeOpenGoogleMapsBtn.addEventListener(
        "click",
        () => {
            const address = routeAddressInput
                ? routeAddressInput.value.trim()
                : "";

            const area = routeAreaInput
                ? routeAreaInput.value.trim()
                : "";

            if (!address) {
                alert("Δεν υπάρχει διεύθυνση πελάτη.");
                return;
            }

            const destination = encodeURIComponent(
                [address, area]
                    .filter(Boolean)
                    .join(", ")
            );

            let mapsUrl =
                "https://www.google.com/maps/dir/?api=1" +
                "&destination=" +
                destination +
                "&travelmode=driving";

            if (routeCurrentPosition) {
                mapsUrl +=
                    "&origin=" +
                    routeCurrentPosition.latitude +
                    "," +
                    routeCurrentPosition.longitude;
            }

            window.open(
                mapsUrl,
                "_blank",
                "noopener,noreferrer"
            );
        }
    );
}

const routeDistanceOutput =
    document.getElementById("routeDistance");

const routeDurationOutput =
    document.getElementById("routeDuration");

const routeDeliveryOutput =
    document.getElementById("routeDeliveryTime");

let routeLastCalculationKey = "";
let routeCalculationInProgress = false;
let routeRetryAfter = 0;

function resetAutomaticRouteInfo() {
    if (routeDistanceOutput) {
        routeDistanceOutput.textContent = "— km";
    }

    if (routeDurationOutput) {
        routeDurationOutput.textContent = "— λεπτά";
    }

    if (routeDeliveryOutput) {
        routeDeliveryOutput.textContent = "— λεπτά";
    }
}

async function findCustomerCoordinates(
    address,
    area
) {
    const fullAddress = [
        address,
        area,
        "Θεσσαλονίκη",
        "Ελλάδα"
    ]
        .filter(Boolean)
        .join(", ");

    let geocodingUrl =
        "https://geocode.arcgis.com/arcgis/rest/services/" +
        "World/GeocodeServer/findAddressCandidates" +
        "?f=json" +
        "&maxLocations=1" +
        "&outFields=Match_addr" +
        "&countryCode=GRC" +
        "&SingleLine=" +
        encodeURIComponent(fullAddress);

    if (routeCurrentPosition) {
        geocodingUrl +=
            "&location=" +
            routeCurrentPosition.longitude +
            "," +
            routeCurrentPosition.latitude;
    }

    const response = await fetch(
        geocodingUrl
    );

    if (!response.ok) {
        throw new Error(
            "Αποτυχία εύρεσης διεύθυνσης."
        );
    }

    const data = await response.json();

    if (
        !Array.isArray(data.candidates) ||
        data.candidates.length === 0
    ) {
        throw new Error(
            "Η διεύθυνση δεν βρέθηκε στον χάρτη."
        );
    }

    const candidate =
        data.candidates[0];

    if (
        !candidate.location ||
        candidate.score < 80
    ) {
        throw new Error(
            "Η διεύθυνση δεν αναγνωρίστηκε με ασφάλεια."
        );
    }

    console.log(
        "Address found:",
        {
            address: candidate.address,
            score: candidate.score,
            location: candidate.location
        }
    );

    return {
        latitude:
            Number(candidate.location.y),

        longitude:
            Number(candidate.location.x)
    };
}

async function getDrivingRoute(
    origin,
    destination
) {
    const coordinates =
        origin.longitude +
        "," +
        origin.latitude +
        ";" +
        destination.longitude +
        "," +
        destination.latitude;

    const routingUrl =
        "https://router.project-osrm.org/route/v1/driving/" +
        coordinates +
        "?overview=false&steps=false";

    const response = await fetch(routingUrl);

    if (!response.ok) {
        throw new Error(
            "Αποτυχία υπολογισμού διαδρομής."
        );
    }

    const data = await response.json();

    if (
        data.code !== "Ok" ||
        !Array.isArray(data.routes) ||
        data.routes.length === 0
    ) {
        throw new Error(
            "Δεν βρέθηκε διαθέσιμη διαδρομή."
        );
    }

    return data.routes[0];
}

async function updateAutomaticRouteInfo() {
    if (
        !routeCurrentPosition ||
        !routeAddressInput ||
        routeCalculationInProgress
    ) {
        return;
    }

    const address =
        routeAddressInput.value.trim();

    const area = routeAreaInput
        ? routeAreaInput.value.trim()
        : "";

    if (!address) {
        routeLastCalculationKey = "";
        resetAutomaticRouteInfo();
        return;
    }

    const calculationKey = [
        routeCurrentPosition.latitude,
        routeCurrentPosition.longitude,
        address,
        area
    ].join("|");

    if (
        calculationKey === routeLastCalculationKey ||
        Date.now() < routeRetryAfter
    ) {
        return;
    }

    routeLastCalculationKey = calculationKey;
    routeCalculationInProgress = true;

    if (routeDistanceOutput) {
        routeDistanceOutput.textContent =
            "Υπολογισμός...";
    }

    if (routeDurationOutput) {
        routeDurationOutput.textContent = "";
    }

    try {
        const destination =
            await findCustomerCoordinates(
                address,
                area
            );

        const route = await getDrivingRoute(
            routeCurrentPosition,
            destination
        );

        const distanceKm =
            route.distance / 1000;

        const durationMinutes = Math.max(
            1,
            Math.ceil(route.duration / 60)
        );

        const deliveryMinutes =
            durationMinutes + 15;

        if (routeDistanceOutput) {
            routeDistanceOutput.textContent =
                distanceKm.toLocaleString(
                    "el-GR",
                    {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                    }
                ) +
                " km";
        }

        if (routeDurationOutput) {
            routeDurationOutput.textContent =
                durationMinutes +
                " λεπτά";
        }

        if (routeDeliveryOutput) {
            routeDeliveryOutput.textContent =
                deliveryMinutes +
                " λεπτά";
        }

        console.log(
            "Route calculated:",
            {
                distanceKm,
                durationMinutes,
                deliveryMinutes,
                destination
            }
        );
    } catch (error) {
        console.error(
            "Automatic route error:",
            error
        );

        resetAutomaticRouteInfo();

        routeRetryAfter =
            Date.now() + 10000;

        routeLastCalculationKey = "";
    } finally {
        routeCalculationInProgress = false;
    }
}

setInterval(
    updateAutomaticRouteInfo,
    1500
);

updateAutomaticRouteInfo();