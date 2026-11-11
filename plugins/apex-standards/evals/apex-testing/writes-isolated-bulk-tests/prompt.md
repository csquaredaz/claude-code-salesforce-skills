---
description: Asking for a test class should load the testing skill and produce Stub API isolation, a 200-record case and Assert-class assertions.
tags: [testing, positive]
max_turns: 8
allowed_tools: [Skill]
---

Write the Apex test class for this service. The selector and unit of work are resolved through our Application factory, which supports setMock().

```apex
public with sharing class ShipmentsService {
    public static void markReady(Set<Id> orderIds) {
        IShipmentsSelector selector = (IShipmentsSelector) Application.Selector.newInstance(Shipment__c.SObjectType);
        IUnitOfWork uow = Application.UnitOfWork.newInstance();
        for (Shipment__c s : selector.selectByOrderIds(orderIds)) {
            if (s.Status__c == 'Pending') {
                s.Status__c = 'Ready';
                uow.registerDirty(s);
            }
        }
        uow.commitWork();
    }
}
```
