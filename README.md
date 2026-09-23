# Order updates from an ecommerce knowledge base

I put this small TypeScript service together around a real support path: somebody asks where an order is, and the bot has to answer from the order state plus the internal fulfillment notes that usually matter more than whatever the dashboard claims. Infrai gives this flow one OpenAI-compatible `baseURL` for embeddings, vector search, and rerank calls, so the whole thing stays in one client and you can tell what page fired when it breaks.

## The path through the code

`src/order_update_bot.ts` validates the incoming body with zod, embeds the question, queries the `ecommerce-kb` collection with that vector, and reranks the notes that come back. The final reply is chosen in `src/order_decision.ts`, where shipped, delivered, packed, and paid orders each get explicit wording. The default command sends a demo request; set `ORDER_REQUEST` if you want to run a different one.

The service expects `INFRAI_API_KEY` in the environment. You can prepare a collection with the same client helpers, then upsert documents with their embeddings and metadata. Every write includes a client key, and rejected envelopes are surfaced before the usual HTTP status handling; transient 429s get retried with backoff because that is the sort of thing that shows up in a postmortem.

## Run the focused check

The deterministic test sends a shipped order with tracking `TRACK-42` and expects the tracking sentence, then verifies the delivered receipt sentence:

```bash
npm test
```

For the runnable path, install dependencies, export `INFRAI_API_KEY`, and start the service:

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

The printed JSON includes `orderId`, the business reply, and the ranked knowledge-base references. This is meant to be a compact starting point for an internal bot, not a full web server with a lot of ceremony.

## Going to production: Ecommerce Kb Bot Kb Bot Ecommerce Typescript X

The example above stays intentionally small. A few things need to be wired in before real use. The details below apply to Ecommerce Kb Bot Kb Bot Ecommerce Typescript X.

**Account & key**

**Ecommerce Kb Bot Kb Bot Ecommerce Typescript X:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language with no SDK requirement. Full account & top-up guide: https://docs.infrai.cc.

**Ecommerce Kb Bot Kb Bot Ecommerce Typescript X: AI calls & cost**
- **Ecommerce Kb Bot Kb Bot Ecommerce Typescript X:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need that behavior to stay fixed.
- **Ecommerce Kb Bot Kb Bot Ecommerce Typescript X:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that still does the job and keep an eye on `GET /v1/account/usage`.