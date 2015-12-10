---
title: Object-Orientation Doesn't Need Classes
date: 2013-08-25T00:42
---

JavaScript doesn't have classes. People don't like that. They've been trying hard to fix it. CoffeeScript has classes. TypeScript has classes. Dart has classes. Stop it!

- Classes complicate the language by adding constructs and keywords
- Class inheritance complicate the language by adding even more constructs and keywords
- <a href="http://elevatedabstractions.wordpress.com/2013/09/07/single-class-inheritance-is-hell/" title="Single class inheritance is hell">Single class inheritance is hell</a>
- Multiple class inheritance is forbidden territory
- Classes violate the Single Responsability Principle by defining both the class object itself and instance objects at the same level
- Classes are potentially stateful, mutable global objects
- Composition already provides implementation reuse
- Interfaces (or duck typing) already provide polymorphism
- Closures already provide encapsulation

Classes are factories. Factories are useful, but not always. Often you just want that one object. You shouldn't need to write a factory in such a case. You should be able to just write the object.

Imagine you could do that. Inside a function. A function that return the object. Then this function can accept parameters, which are used by the object. Then the function can be called multiple times and multiple objects of similar form are created. Just like with classes. This is possible in JavaScript. Douglas Crockford calls such functions Power Constructors. They are factories. They provide encapsulation through closures. Classes without classes.

Of course, JavaScript objects are not perfect: they lack immutability. But that's another story.
