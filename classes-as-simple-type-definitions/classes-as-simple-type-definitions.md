---
title: Classes as Simple Type Definitions
date: 2013-09-10T00:13
---

As I was writing [my previous post](http://elevatedabstractions.wordpress.com/2013/09/07/single-class-inheritance-is-hell/), I realized [my criticism against classes](http://elevatedabstractions.wordpress.com/2013/08/25/object-orientation-doesnt-need-classes/) primarily revolves around two things: inheritance and `static`. I've already written about the first so let's have a look at the second. C# and Java call it `static` but other language have it as well. For example, VB.Net has `Shared`, Python has the `@staticmethod` and `@classmethod` decorators, while Ruby has the class-scoped `self` identifier. I know that under the covers, all those languages have very different semantics, but from a design point a view, I see them as the same concept. The concept grants to classes the same functionality as other objects (ie they can have fields and methods), which for the sake of consistency is a good idea. Two consequences bother me however.

The first is that it requires special syntax. If a class should be an object like any other, then it shouldn't be through special syntax. If it is, although consistency was gained on a design level, it doesn't transpire through the language and so is lost. It become a burden for the language (and consequently tools analyzing it) to support the feature. It bothers me that inside of single class definition block, there are both the definitions of the class object and the instance objects, and that you can mix them.

The second consequence bother me because classes are not any objects. Classes are most of the time global. They don't have to be but that's how they are used. Therefore, static methods and fields allow to attach state and behavior to global objects! Ouch. I love Misko Hevery's work on this so I invite you to read on his [site](http://misko.hevery.com/) how [all forms of `static` is death to testability](http://misko.hevery.com/code-reviewers-guide/flaw-brittle-global-state-singletons/).

As with class inheritance, I question the usefulness of static fields and methods. Is there anything that is not achievable without them? Again, I'm inclined to say no. Some might argue that something one can do without might still make work more easy. My hypothesis however, is that both class inheritance and `static` make things more difficult. Cons outweigh pros. Honestly they're just sneaky! They hide dependencies, thus making code hard to test ; they introduce additional, unnecessary concepts, thus making code hard to understand and maintain, especially for beginners. Aren't maintainability, readability and testability priorities that we should strive for?

To conclude, I'd say that once those two features are out of the way, classes are actually OK. They are simple type definitions.

# Hey, You Forgot The Code!

Oops! Here's a piece of Java code that would make me happy.

```java
interface Greeter { void greet(); }

public class Application {
    public static void main(String[] args){
        new Application().createCompositionRoot("Inara").greet();
    }

    public Greeter createCompositionRoot(final String name) {
        class ConsoleGreeter implements Greeter {
            public void greet() { System.out.println("Hello, " + name); }
        }
        return new ConsoleGreeter();
    }
}
```

A few comments:
- [Composition root means what Mark Seemann means](http://blog.ploeh.dk/2011/07/28/CompositionRoot/).
- Local classes solve the problem of classes being global, however always using them would result in writing all the code in one file. A convention would be more scalable.
- Encapsulation is ensured in two ways. First, clients only have access to the interface, never the class. Second, the closure. Unfortunatly Java only has read-only closures so instances built this way can only be immutable. Mutable instances can be made using fields and a constructor inside the local class.
- `createCompositionRoot` looks a lot like one of Douglas Crockford's Power Constructors.
- Even though Java allows such code, it wasn't really design for it. I have no idea how local classes perform vs global classes.
- The important question is: does this style scale?

EDIT: I looked up the consequences of using local classes, and it seems they work just the same as inner classes, meaning 1) there is no performance penalty, and 2) they old a reference to the outer instance. There is one difference however: the outer instance does not seem to have access to it. It seems impossible to get a reference to a local class, which what we want here. :)
