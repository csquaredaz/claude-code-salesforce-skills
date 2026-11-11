---
name: apex-fflib-layers
description: Designs and writes Salesforce Apex in FFLIB (Apex Enterprise Patterns) layers, covering trigger routing, Domain, Selector, Service and Unit of Work, with dependency injection through an application factory. Use when creating or restructuring Apex classes, triggers or async jobs, or when deciding which layer a piece of logic belongs in.
when_to_use: "Triggers: write an apex class, add a trigger, trigger handler, domain class, selector, service layer, unit of work, uow, fflib, apex enterprise patterns, application factory, dependency injection in apex, where should this logic go, queueable vs batch, refactor apex into layers."
---

# Apex FFLIB layers

Put each piece of logic in exactly one layer, inject every collaborator through the application factory, and send all DML through a Unit of Work.

## Layer contract

| Layer        | Owns                                                                                     | Never does              |
| ------------ | ---------------------------------------------------------------------------------------- | ----------------------- |
| Trigger      | One trigger per object, a single dispatch call                                           | Logic, queries, DML     |
| Domain       | Behaviour and validation for a set of records of one SObject type                        | SOQL, DML, callouts     |
| Selector     | Every SOQL query for one SObject type, with security applied                             | DML, business rules     |
| Service      | Stateless use-case orchestration across domains and selectors, and owns the Unit of Work | Inline SOQL, direct DML |
| Unit of Work | Ordered, transactional DML for one business operation                                    | Business rules          |

When code doesn't fit a row, it's usually a service method that hasn't been named yet. Don't create a "helper" or "utils" class to hold it.

## Rules

1. **Resolve collaborators through the factory**, never with `new`, so tests can swap in a Stub API mock. Example: `IShipmentsSelector selector = (IShipmentsSelector) Application.Selector.newInstance(Shipment__c.SObjectType);`
2. **Program to interfaces.** Services and selectors expose an `I*` interface, and callers depend on the interface.
3. **Services are stateless.** Inputs are collections and outputs are collections or DTOs. No instance fields that hold data between calls.
4. **Domains operate on `Records`.** Validation goes in `onValidate`, and derived-field logic goes in `onApplyDefaults` or before-trigger handlers. A domain that needs related data receives it from the service as an argument.
5. **Selectors define the field list once.** Query methods take `Set<Id>` or another collection, never a single Id. Every query enforces security (see the `apex-security` skill).
6. **Register DML; don't perform it.** `registerNew`, `registerDirty`, `registerDeleted` and `registerRelationship`, then one `commitWork()` per service operation. Commit order follows the SObject type list given to the Unit of Work, with parents before children. See [references/unit-of-work.md](references/unit-of-work.md).
7. **Bulk by default.** Assume 200 records per trigger chunk. No SOQL, DML or callouts inside loops. Build maps keyed by Id or external key before iterating.
8. **One public entry point per use case.** A service method name reads as a business verb, such as `OrdersService.fulfil(Set<Id> orderIds)`, not `processRecords`.
9. **Pick async deliberately.** Use the decision table in [references/async-selection.md](references/async-selection.md) and state the limit context in the class ApexDoc.
10. **Document every public class with ApexDoc** (`@description`, `@param`, `@return`, `@throws`). Names carry the meaning; comments explain only the _why_.

## Naming

| Artifact | Convention                               | Example             |
| -------- | ---------------------------------------- | ------------------- |
| Trigger  | `<Object>Trigger`                        | `ShipmentTrigger`   |
| Domain   | Plural SObject name                      | `Shipments`         |
| Selector | `<Plural>Selector` + `I<Plural>Selector` | `ShipmentsSelector` |
| Service  | `<Plural>Service` + `I<Plural>Service`   | `OrdersService`     |
| Test     | `<ClassUnderTest>Test`                   | `OrdersServiceTest` |

## Mapping to the upstream library

This skill describes the pattern, not one implementation. Map the concepts to whichever library the project uses:

| Concept       | Upstream `fflib-apex-common`             | Project-specific core library          |
| ------------- | ---------------------------------------- | -------------------------------------- |
| Factory       | `fflib_Application`                      | Read the project's `Application` class |
| Domain base   | `fflib_SObjectDomain` / `fflib_SObjects` | Read its domain base class             |
| Selector base | `fflib_SObjectSelector`                  | Read its selector base class           |
| Unit of Work  | `fflib_SObjectUnitOfWork`                | Read its UoW interface                 |

Before writing code, read the project's existing base classes and factory bindings and match them exactly. Don't introduce a second pattern alongside the one already there.

## Output

When asked to implement, produce:

1. A layer plan: which classes are touched, which layer each one is in, and why.
2. The classes, complete. No placeholders and no `TODO`.
3. One comment line per method with real governor cost, for example `// Limits: 1 SOQL (selector), DML via UoW, bulk-safe at 200`.
4. Tests, written to the `apex-testing` skill.

When asked where logic belongs, answer with the layer, the class name it should live in, and the rule from the table above that decides it.
