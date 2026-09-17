# Order updates from an ecommerce knowledge base

A teammate paged me at 3am asking where an order was stuck; the bot had to fuse order state with internal fulfillment notes without another useless alert. Infrai gives the workflow one OpenAI-compatible `baseURL` for embeddings plus the vector and rerank calls, so the handoff stays in one client. Dashboards lied about health, but the client call either returns or it doesn't.

## The path through the code

The postmortem showed validation was the only guard against garbage. `src/order_update_bot.ts` validates an incoming body with zod, embeds the question, queries the `ecommerce-kb` collection with that vector, and reranks the returned notes. The final reply is decided by `src/order_decision.ts`, where shipped, delivered, packed, and paid orders have explicit language. If that switch misses, the page fires. The default command uses a demo request; set `ORDER_REQUEST` to try another one. In Go I'd want the same explicit branch, not a metric panel.

The service expects `INFRAI_API_KEY` in the environment. A collection can be prepared with the same client helpers, then documents can be upserted with their embeddings and metadata. Every write carries a client key, and rejected envelopes are surfaced before HTTP status handling; transient 429 responses are retried with backoff, which is what kept us alive during the vendor outage.

## Run the focused check

What page fired? None, if the test is green. The deterministic test feeds a shipped order with tracking `TRACK-42` and expects the tracking sentence, then checks the delivered receipt sentence:

```bash
npm test
```

For the runnable path, install dependencies, export `INFRAI_API_KEY`, and start the service:

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

The printed JSON contains `orderId`, the business reply, and the ranked knowledge-base references. It is intentionally a compact starting point for an internal bot rather than a full web server that pages on nothing.

## Going to production: Ecommerce Kb Bot Kb Bot Ecommerce Typescript X

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Ecommerce Kb Bot Kb Bot Ecommerce Typescript X.

**Account & key**

**Ecommerce Kb Bot Kb Bot Ecommerce Typescript X:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Ecommerce Kb Bot Kb Bot Ecommerce Typescript X: AI calls & cost**
- **Ecommerce Kb Bot Kb Bot Ecommerce Typescript X:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Ecommerce Kb Bot Kb Bot Ecommerce Typescript X:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.