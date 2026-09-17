import { z } from "zod";
import { embed, query, rerank } from "./infrai_client.ts";
import { orderReply } from "./order_decision.js";

const Request = z.object({ orderId: z.string().min(1), question: z.string().min(1), status: z.enum(["paid", "packed", "shipped", "delivered"]), tracking: z.string().optional() });
export async function answer(body: unknown) {
  const input = Request.parse(body);
  const embedding = await embed(input.question);
  const matches = await query("ecommerce-kb", embedding, 5);
  const ranked = await rerank(input.question, (matches as { items?: unknown[] }).items ?? [], 3);
  return { orderId: input.orderId, reply: orderReply({ status: input.status, tracking: input.tracking }), references: ranked };
}

if (process.argv[1]?.endsWith("order_update_bot.ts")) {
  const body = JSON.parse(process.env.ORDER_REQUEST ?? "{\"orderId\":\"demo-1\",\"question\":\"Where is my package?\",\"status\":\"shipped\",\"tracking\":\"TRACK-42\"}");
  answer(body).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
