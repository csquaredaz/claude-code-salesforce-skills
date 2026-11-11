# Stub API mocks without a mocking library

The platform's `System.StubProvider` is enough for most unit isolation. A small recording stub keeps tests readable without depending on a third-party mocking framework.

## A recording stub

```apex
@IsTest
public class RecordingStub implements System.StubProvider {
    private final Map<String, Object> returnsByMethod = new Map<String, Object>();
    public final List<String> calls = new List<String>();
    public final Map<String, List<Object>> argsByMethod = new Map<String, List<Object>>();

    public RecordingStub returns(String methodName, Object value) {
        returnsByMethod.put(methodName, value);
        return this;
    }

    public Object handleMethodCall(
        Object stubbedObject, String methodName, Type returnType,
        List<Type> paramTypes, List<String> paramNames, List<Object> args
    ) {
        calls.add(methodName);
        argsByMethod.put(methodName, args);
        Object value = returnsByMethod.get(methodName);
        if (value instanceof Exception) {
            throw (Exception) value;
        }
        return value;
    }

    public Object create(Type typeToMock) {
        return Test.createStub(typeToMock, this);
    }
}
```

## Using it through the factory

```apex
@IsTest
static void fulfil_ordersAcrossWarehouses_registersOneShipmentPerWarehouse() {
    // Arrange
    List<Order> orders = TestDataFactory.ordersAcrossWarehouses(200, 3); // unsaved, fake Ids
    RecordingStub selectorStub = new RecordingStub().returns('selectByIdWithLines', orders);
    RecordingStub uowStub = new RecordingStub();
    Application.Selector.setMock(Order.SObjectType, (IOrdersSelector) selectorStub.create(OrdersSelector.class));
    Application.UnitOfWork.setMock((IUnitOfWork) uowStub.create(UnitOfWork.class));

    // Act
    Test.startTest();
    OrdersService.fulfil(new Map<Id, Order>(orders).keySet());
    Test.stopTest();

    // Assert
    Integer shipmentsRegistered = 0;
    for (String call : uowStub.calls) {
        if (call == 'registerNew') shipmentsRegistered++;
    }
    Assert.areEqual(3, shipmentsRegistered, 'One shipment per warehouse');
    Assert.isTrue(uowStub.calls.contains('commitWork'), 'Work is committed once');
}
```

## Limits of the Stub API

- You can't stub static methods, private methods, constructors, or system types such as `Database` or `HttpRequest`. That's why collaborators are resolved through a factory and callouts go through an injectable client.
- Classes you stub must be non-final (`virtual`) or interfaces, and visible to the test.
- If a test needs argument matchers, call-count verification or ordered verification across many collaborators, a mocking library (for example `fflib-apex-mocks`) earns its weight. Adopt it explicitly with an ADR rather than mixing styles.

## Fake Ids

```apex
public static Id fakeId(SObjectType type, Integer i) {
    String prefix = type.getDescribe().getKeyPrefix();
    return Id.valueOf(prefix + String.valueOf(i).leftPad(12, '0'));
}
```
