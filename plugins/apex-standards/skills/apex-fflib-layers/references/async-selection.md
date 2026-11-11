# Choosing an async pattern

| Need                                                              | Use                                                               | Why not the others                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Process a large or unbounded record set (over about 10k rows)     | `Database.Batchable` with a selector-built `QueryLocator`         | Queueable heap and SOQL limits don't scale to unbounded sets             |
| Chain steps, pass complex state, call out from async              | `Queueable` (+ `Database.AllowsCallouts`)                         | `@future` takes only primitives and can't chain or be monitored          |
| Recover or record the outcome of a Queueable, even when it fails  | `System.Finalizer` attached in `execute`                          | Try/catch doesn't survive uncatchable limit exceptions; a finalizer does |
| Run work after the trigger transaction commits, decoupled from it | Publish a Platform Event; handle it in a PE trigger or subscriber | Queueable enqueued from a trigger rolls back with the trigger            |
| Run on a schedule                                                 | `Schedulable` that enqueues a Queueable or Batch                  | Logic inside `execute` of a Schedulable is untestable in isolation       |
| Simple fire-and-forget callout in legacy code                     | `@future(callout=true)`                                           | Only for code already using it. Prefer Queueable for new work            |

## Limits to state in ApexDoc

For each async class, document:

- **Limit context:** async limits are separate from the caller's (for example 200 SOQL and a 12 MB heap in Queueable/Batch execute).
- **Chunk size:** the batch scope or Queueable chunk size, and why that number.
- **Idempotency:** what happens if this job runs twice for the same input, and the key that prevents duplicate effects.
- **Retry:** who retries (the finalizer, the platform for PE triggers via `EventBus.RetryableException`, or nobody) and the bound on attempts.
