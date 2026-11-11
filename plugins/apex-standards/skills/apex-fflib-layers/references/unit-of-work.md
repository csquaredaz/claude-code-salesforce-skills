# Unit of Work: commit order and relationship handling

## Why order matters

A Unit of Work commits DML in the order of the SObject type list it was constructed with. Parents must be inserted before children so that `registerRelationship` can resolve the parent Id onto the child's lookup field at commit time.

```apex
// Parents first, children last. This list is the commit order.
private static final List<SObjectType> COMMIT_ORDER = new List<SObjectType>{
    Account.SObjectType,      // Customer
    Order.SObjectType,
    OrderItem.SObjectType,
    Shipment__c.SObjectType
};
```

Deletes run in **reverse** order, children before parents, so a lookup with restrict-delete doesn't block the commit.

## Registering a graph

```apex
IUnitOfWork uow = Application.UnitOfWork.newInstance();

Order order = new Order(Status = 'Draft', EffectiveDate = Date.today());
uow.registerNew(order, Order.AccountId, customer);   // customer may itself be new in this UoW

Shipment__c shipment = new Shipment__c(Carrier__c = 'Ground');
uow.registerNew(shipment, Shipment__c.Order__c, order);

uow.commitWork();   // one savepoint; any failure rolls back the whole graph
```

## Rules

1. **One `commitWork()` per service operation.** A second commit in the same operation means the operation should be split, or the second write belongs in the same UoW.
2. **Never mix direct DML with a UoW in the same transaction path.** Direct DML bypasses the savepoint and the ordering.
3. **Register a record once.** Registering the same record twice as dirty merges the field changes. Registering it as both new and dirty is a defect.
4. **Use `registerDirty(record, dirtyFields)`** when two code paths update different fields on the same record, so one doesn't overwrite the other.
5. **Callouts happen before `commitWork()`, or in async work after it.** Never between DML statements, because uncommitted work blocks callouts.
6. **Custom work** (for example publishing a Platform Event with `EventBus.publish`) is registered with `registerWork(IDoWork)` so it runs inside the same commit sequence.
7. **Test the order, not the database.** In unit tests, mock the UoW and verify that `registerNew` and `registerRelationship` were called. Leave real commits to a small number of integration tests.
