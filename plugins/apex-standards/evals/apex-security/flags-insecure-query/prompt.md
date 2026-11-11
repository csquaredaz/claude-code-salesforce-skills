---
description: Insecure Apex (no sharing keyword, concatenated dynamic SOQL, legacy security clause, hard-coded token) should load the security skill and produce the modern fixes.
tags: [security, positive]
max_turns: 6
allowed_tools: [Skill]
---

Is this Apex secure? List the problems and how to fix each one.

```apex
public class ShipmentSearch {
    private static final String CARRIER_TOKEN = 'demo-carrier-token';

    public static List<Shipment__c> search(String carrierName) {
        String q = 'SELECT Id, Status__c FROM Shipment__c WHERE Carrier__c = \'' + carrierName + '\' WITH SECURITY_ENFORCED';
        return Database.query(q);
    }
}
```
