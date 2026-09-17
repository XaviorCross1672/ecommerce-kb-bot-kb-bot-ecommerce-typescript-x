import assert from "node:assert/strict";
import { orderReply } from "../src/order_decision.js";

assert.equal(orderReply({ status: "shipped", tracking: "TRACK-42" }), "Your order is on the way. Tracking: TRACK-42.");
assert.equal(orderReply({ status: "delivered" }), "Your order was delivered. Check the receipt email for the itemized total.");
console.log("order decision test passed");
