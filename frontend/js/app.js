console.log("APP.JS ΦΟΡΤΩΘΗΚΕ");

const uiScript = document.createElement("script");
uiScript.src = "js/ui.js";
document.body.appendChild(uiScript);

const customersScript = document.createElement("script");
customersScript.src = "js/customers.js";
document.body.appendChild(customersScript);

const callsScript = document.createElement("script");
callsScript.src = "js/calls.js";
document.body.appendChild(callsScript);

const ordersScript = document.createElement("script");
ordersScript.src = "js/orders.js";
document.body.appendChild(ordersScript);