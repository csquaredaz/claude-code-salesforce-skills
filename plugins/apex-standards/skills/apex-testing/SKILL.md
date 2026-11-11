---
name: apex-testing
description: Writes and evaluates Salesforce Apex tests that assert behaviour, covering Stub API mocks for unit isolation, a test data factory, 200-record bulk cases, negative paths, async and callout tests, and a small set of real-DML integration tests. Use when writing an Apex test class, raising coverage meaningfully, or judging whether existing tests prove anything.
when_to_use: "Triggers: write a test, apex test class, unit test, test coverage, mock, stub, StubProvider, Test.createStub, test data factory, bulk test, HttpCalloutMock, Test.startTest, are these tests any good, coverage is low."
---

# Apex testing

Tests prove behaviour. Coverage is a by-product: 90% is the floor, never the goal.

## Test pyramid for Apex

| Kind                                                 | Share                         | Touches the database | Tool                                                                           |
| ---------------------------------------------------- | ----------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| Unit: service, domain or selector logic in isolation | Most                          | No                   | Stub API mocks injected via the factory, plus in-memory SObjects with fake Ids |
| Integration: trigger → domain → service → commit     | A few per feature             | Yes                  | Test data factory + real DML                                                   |
| Security: allowed and denied paths                   | One pair per data-access path | Yes                  | `System.runAs` with a least-privilege user                                     |

## Rules

1. **Name by behaviour:** `method_condition_expectedResult`, for example `fulfil_orderWithoutLines_throwsValidationException`.
2. **Arrange, act, assert.** One behaviour per test method, with `Test.startTest()` / `Test.stopTest()` around the act.
3. **Use the `Assert` class with a message:** `Assert.areEqual(3, shipments.size(), 'One shipment per warehouse');`. Never `Assert.isTrue(true)` and never an assert-less test.
4. **Isolate units with the Stub API.** Mock selectors, services and the Unit of Work through the factory's `setMock`. Don't stub the class under test. See [references/stub-api.md](references/stub-api.md).
5. **Build data through one factory** (`TestDataFactory`) that returns unsaved records with valid defaults. Each test overrides only the fields its behaviour depends on.
6. **Bulk is the default.** Every trigger path and every collection-taking service method has a 200-record test that asserts the outcome and that limits stay within budget (for example `Assert.isTrue(Limits.getQueries() < 10, …)`).
7. **Cover the unhappy paths.** Empty input, a missing parent, a duplicate key, a callout failure, an expected exception (`try { …; Assert.fail('Expected …'); } catch (ExpectedException e) { … }`).
8. **Async:** `Test.stopTest()` runs enqueued Queueables and Batches synchronously. Assert the end state after it. Test finalizers by forcing the job to fail.
9. **Callouts:** use `Test.setMock(HttpCalloutMock.class, …)` with a mock that can return each status code the client handles (2xx, 4xx, 5xx, timeout).
10. **Forbidden:** `@isTest(SeeAllData=true)`, hard-coded Ids, `Test.isRunningTest()` branches in production code, and sleeping or looping to wait for async work.

## Output

Before the code, write a four-line test plan:

```text
Subject: OrdersService.fulfil
Mocks:   IOrdersSelector, IShipmentsSelector, IUnitOfWork
Bulk:    200 orders across 3 warehouses → 3 shipments registered
Negative: no lines → ValidationException; carrier callout 503 → order stays Pending
```

Then write the complete test class. When asked to evaluate existing tests, list each test that wouldn't fail if the behaviour broke, with the reason, then list the missing cases.
