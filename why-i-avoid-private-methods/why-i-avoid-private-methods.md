---
title: Why I Avoid Private Methods
date: 2013-07-20T20:13
---

[All](http://stackoverflow.com/questions/105007/should-i-test-private-methods-or-only-public-ones) [over](http://stackoverflow.com/questions/34571/whats-the-proper-way-to-test-a-class-with-private-methods-using-junit) [StackOverflow](stackoverflow.com), you will read 'Should I test private methods or not?'. This question is actually hiding a better one: why is this method private is the first place?

Private methods have only two use cases: either you have this big public method and you'd like to split it up in several private methods, or you have several public methods that share a common behavior that you'd like to factor out to a private method. The only difference between those use cases is that the new private method is called from either one or multiple public methods. In both cases, the private method is a portion of code taken from a public method. Provided you forward the parameters, the code you've moved has access to the same stuff it had access to before. This means you can split the public method in whatever way you want. I'm tempted to say that this might be too much freedom.

I always find myself having difficulties naming the new private method. Either the name is too vague compared to the specificity of the method, or it's significantly longer that public methods' names. I feel compelled to document it. Sometimes the method doesn't even use the fields of the class it's in, so it could be static, but it's very awkward since only instance methods call it. This lack of cohesion introduces confusion.

Some more concrete difficulties arise on the testing side. Since private methods can't be mocked out, testing the public method that calls them means testing them too at the same time. Actually, splitting a method into several private ones does not impact the test code itself. Therefore, the test has a good chance of being complex and hard to read and maintain. I believe tests tell the truth: **relocating code to private methods does not decrease complexity. It only visually hides it.** Dispatching private methods into dependencies enables easy mocking and simplified tests.

There's another issue with private methods. As programmers we all know that the purpose of an object is to encapsulate stuff. An object has two layers: its interface and its implementation. Public stuff is part of the interface. Private stuff is part of the implementation. If an object has only public methods and private fields, the abstraction is crystal clear. The upper layer knows about the lower layer and uses it, nothing else. Add private methods into the mix, and trouble appears. Now, you have three layers, where the middle layer (private methods) can go back up to the upper layer (public methods), and the upper layer can shortcut the middle layer to access the lower layer (private fields) directly. The abstraction breaks down to a mess.

Note: a public method calling another public method is also an abstraction break. The interface of the object is exposing two tasks where one is a sub-task of the other? Confusing.

Now let's say private methods don't exist. Ex-private methods would have to be placed in other classes, where they would be public. A suitable (maybe new) class would have to be found, which would make you think about where the behavior conceptually belongs. You might discover a whole new concept that helps you understand new things about your application, infrastructure or domain. **Private methods hurt good design by hiding concepts from you**. Of course, you might choose to keep the concept private inside the original class, in order to decrease the number of classes in your system. The important thing is that you do it knowingly.

That's why I forbid myself to write private methods. They are a code smell that says I probably missed something, and my tests are going to be terrible. Of course they're OK in some intermediate state of the code, I just refactor them out as soon as I can.

## Further Reading / Example

Take [this post](http://jeffreypalermo.com/blog/constructor-over-injection-smell-ndash-follow-up/) from [Jeffrey Palermo's blog](http://jeffreypalermo.com/blog/) and look at the first code sample. There are two private methods.

`CreateStatus` doesn't use any field from its class `OrderProcessor`. It's clear it has nothing to do here. This method is about converting a boolean to a `SuccessResult` and should be relocated to this class as a [factory method](http://en.wikipedia.org/wiki/Factory_method).

`Collect` is more interesting because it uses three fields, and because it's actually the root of Jeffrey's problem. He's complaining that there's too much constructor parameters. Notice that those three fields are not used anywhere else. If he had avoided private methods, he would have come up with a new class for `Collect`, which would have had three dependencies (`IAccountsReceivable`, `IRateExchange`, and `IUserContext`). `OrderProcessor` would then have to take this new class as a dependency, instead of three, which would have reduced the number of constructor parameters to two! Problem solved. Take a look at the code below.

Note: [Mark Seeman](http://blog.ploeh.dk), although through different reasoning, reaches the same conclusion in [this blog post](http://blog.ploeh.dk/2010/02/02/RefactoringtoAggregateServices/).

```cs
namespace DIAntiPattern
{
    public class OrderCollecter : IOrderCollector
    {
        private readonly IAccountsReceivable _receivable;
        private readonly IRateExchange _exchange;
        private readonly IUserContext _userContext;

        public OrderCollecter(
            IAccountsReceivable receivable,
            IRateExchange exchange,
            IUserContext userContext)
        {
            _receivable = receivable;
            _exchange = exchange;
            _userContext = userContext;
        }

        public void Collect(Order order)
        {
            User user = _userContext.GetCurrentUser();
            Price price = order.GetPrice(_exchange, _userContext);
            _receivable.Collect(user, price);
        }
    }

    public class OrderProcessor : IOrderProcessor
    {
        private readonly IOrderValidator _validator;
        private readonly IOrderCollector _collector;

        public OrderProcessor(
            IOrderValidator validator,
            IOrderCollector collector)
        {
           _validator = validator;
           _collector = collector;
        }

        public SuccessResult Process(Order order)
        {
            bool isValid = _validator.Validate(order);
            if (isValid)
            {
                Collect(order);
                IOrderShipper shipper = new OrderShipperFactory().GetDefault();
                shipper.Ship(order);
            }
            return SuccessResult.fromBoolean(isValid);
        }
    }
}
```
