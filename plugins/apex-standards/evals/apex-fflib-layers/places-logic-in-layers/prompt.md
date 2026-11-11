---
description: Asking where business logic belongs should load the layering skill and name selector plus service or domain classes.
tags: [fflib, positive]
max_turns: 6
allowed_tools: [Skill]
---

In our Salesforce org, when every OrderItem on an Order is allocated, the related Shipment__c records should move to Status__c = 'Ready'. This has to work for data loads of thousands of rows. Where should this logic live in Apex, and which classes do I need? Keep it brief.
