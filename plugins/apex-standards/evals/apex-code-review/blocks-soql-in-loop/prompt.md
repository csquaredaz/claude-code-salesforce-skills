---
description: A review request on code with SOQL and DML in a loop and an empty catch should load the review skill, grade the issues High or Critical and request changes.
tags: [review, positive]
max_turns: 6
allowed_tools: [Skill]
---

Please review this before I merge it.

```apex
public with sharing class OrderFulfilment {
    public static void fulfil(List<Order> orders) {
        for (Order o : orders) {
            List<OrderItem> items = [SELECT Id, Quantity FROM OrderItem WHERE OrderId = :o.Id];
            try {
                insert new Shipment__c(Order__c = o.Id, Item_Count__c = items.size());
            } catch (Exception e) {
            }
        }
    }
}
```
