---
title: No Nulls Shall Pass
date: 2013-11-28T20:28
---

The code I read at work is filled with null checks. I'd guess about 70% of conditionals are null checks. Most methods look like this:

```java
public void whatever(P1 p1, P2 p2)
{
    if ( p1 != null && p2 != null )
    {
        // actual behavior
        // and yes, it is formatted like that
        // it's like they were trying to get as far as possible from Sun's style
    }
    return null; // I guess you'll have to null-check too, dear caller!
}
```

I guess everyone has had to deal with this NullPointerException paranoia. I've seen 2 solutions: strict or lenient.

# Leniency

Being lenient means to be willing to work with null. Since null is not an object and you can't dispatch on it (at least in Java and C#), you have no other choice but to pass it as a parameter of another object's method...which will have to check for null, and might return null. We got nowhere. Worse, you might resort to a static method. Somehow, people seem to believe it's OK if that other method is in a library (think StringUtils.isEmpty from Apache Commons). I say static is worse because then you bring all [the inconvenience of static dispatch](classes-as-simple-type-definitions/classes-as-simple-type-definitions.md) into your code. There's also the permanent danger of null values trickling through the code until it blows very far down the flow.

# Strictness

Being strict means to want pure OO and act like null doesn't exist. Even if the language allows of variable of type String to store the value null, act as if it cannot. This is simply done by never ever returning null. The method says it's gonna return a string so the caller expects a string and nothing else. null is not a string (it doesn't behave like one / it doesn't respond to the same messages).

If a method might not have a result, it is likely the program wants to react according to the presence of the result. The OO way of branching is dynamic dispatch. Therefore, the behavior of the two cases should be included in two different object, and the method should return either one or the other. That's the Null Object Pattern. Alternatives have been proposed in the form of option types, inspired by monads. The option type is better than null to convey semantics in the method signature, but it still forces you to use a conditional to verify the presence of the value. Another solution is throwing an exception.

A drawback of being strict is that you have to deal carefully with API that are not strict. For example, a strict program cannot use JDK's Map without wrapping it in something that doesn't return null when queried with a non-existent key.

# Semantics

Some might argue that `StringUtils.isEmpty` is semantically what you want, because you need to know if the string contains text or not. You do not care about details such as null. This means there exist a ethereal concept of emptiness that applies to everything. That's a valid point of view. However, I argue that it is one imported from functional programming, where algorithms and data are cleanly separated, and functions are statically dispatched. Object-oriented programming is another paradigm. The most basic element is the object. Nothing transcends it. There are no concepts without objects implementing it, each one with its own idea of what the concept means. null is not an object, and so doesn't have any idea about any concept.

# So what?

`null` breaks type-safety and object-orientation. It requires work and compromises to get around it, while serving very little purpose. null is another language feature I'd like to see disapear.

# You're just a perfectionist!

Yes. <small>Though my experience tells me strictness is more efficient at eradicating NPEs. Maybe try it?</small>
