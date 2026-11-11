# User mode cheat sheet

## Queries

```apex
// Static
List<Shipment__c> rows = [
    SELECT Id, Status__c, Carrier__c
    FROM Shipment__c
    WHERE Order__c IN :orderIds
    WITH USER_MODE
];

// Dynamic, with binds and user mode
Map<String, Object> binds = new Map<String, Object>{ 'orderIds' => orderIds };
List<Shipment__c> rows = Database.queryWithBinds(
    'SELECT Id, Status__c FROM Shipment__c WHERE Order__c IN :orderIds',
    binds,
    AccessLevel.USER_MODE
);
```

## DML

```apex
insert as user shipments;
Database.SaveResult[] results = Database.update(shipments, false, AccessLevel.USER_MODE);
```

## Partial access

```apex
SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, shipments);
update as user decision.getRecords();
Map<String, Set<String>> removed = decision.getRemovedFields(); // e.g. {Shipment__c => {Cost__c}}
```

## What fails, and how

| Mode                                             | Inaccessible field or object            | Exception                                           |
| ------------------------------------------------ | --------------------------------------- | --------------------------------------------------- |
| `WITH USER_MODE` / `AccessLevel.USER_MODE` query | Reports **all** inaccessible fields     | `System.QueryException` (`getInaccessibleFields()`) |
| `as user` DML                                    | First CRUD/FLS violation                | `System.DmlException` / `SecurityException`         |
| `WITH SECURITY_ENFORCED` (legacy)                | First inaccessible field in SELECT only | `System.QueryException`                             |
| `stripInaccessible`                              | Nothing thrown; fields removed          | n/a                                                 |

## Callout through a Named Credential

```apex
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:Shipping_Carrier/v2/rates');   // auth comes from the External Credential
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');
req.setBody(JSON.serialize(rateRequest));
req.setTimeout(10000);
HttpResponse res = new Http().send(req);
```

Permission to use the credential is granted through the External Credential principal on a permission set, so it's tested like any other permission.
