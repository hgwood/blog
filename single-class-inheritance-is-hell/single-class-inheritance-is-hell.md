---
title: Single Class Inheritance is Hell
date: 2013-09-07T01:10
---

Multiple class inheritance is complicated. So complicated in fact, that some languages, such as Java, simply don't support it. Even in languages that support it, it is often discouraged in order to avoid famous issues like the [diamond problem](http://en.wikipedia.org/wiki/Multiple_inheritance#The_diamond_problem). In this post, I explain why I think single class inheritance is just as bad.

# It's Hard to Test

Single class inheritance makes it impossible to test a child class without testing part or whole of parent class, which mean tests targeting the child class might fail even though there is nothing wrong with it. This is a consequence of not being able to mock out `super`. It can't be mocked out because it is (kind of) `new`ed! Consider the following simple code:

```java
class Parent {
    public void method1() {}
    public void method2() {}
}

class Child extends Parent {
    @Override
    public void method2() {
        // do stuff before
        super.method2();
    }
}
```

It is, from a functional point of view, equivalent to this:

```java
interface Parent {
    void method1();
    void method2();
}

class ParentImpl implements Parent {
    public void method1() {}
    public void method2() {}
}

class Child implements Parent {
    private final Parent _super = new ParentImpl();

    public void method1() { _super.method1(); }
    public void method2() {
        // do stuff before
        _super.method2();
    }
}
```

See how `Child` creates its own instance of `ParentImpl`? It conflicts with [dependency injection](http://en.wikipedia.org/wiki/Dependency_Injection). It's a hard dependency, which make the code hard to test.

# It's Hard to Maintain

Some languages allow a child class to have special access permissions to its parent class (often through the `protected` access level). Congratulations! Now the parent class has two separate interfaces for you to maintain! Also, this is license to break encapsulation. I can't see any reason for this feature to exist.

# Abstract what?!

Although abstract classes are not a part of single class inheritance *per se*, it is a popular extension of it. Here's an example, inspired from Java's base class library.

```java
abstract class AbstractCollection<T> implements Collection<T> {

    public boolean contains(Object o) {
        for (T item : this) {
            if (item.equals(o)) {
                return true;
            }
        }
        return false;
    }

    public abstract Iterator<T> iterator();
}
```

Abstract classes like this one are not standalone, as you can't instantiate them. They depend on some method(s) being implemented in child classes. In other words, they depend on their children. But the children also depend on the parent! It's weird. Isn't this simpler?

```java
class CollectionDecorator<T> implements Collection<T> {

    private final Iterable<T> iterable;

    public CollectionDecorator(Iterable<T> iterable) {
        this.iterable = iterable;
    }

    public boolean contains(Object o) {
        for (T item : this) {
            if (item.equals(o)) {
                return true;
            }
        }
        return false;
    }

    public Iterator<T> iterator() {
        return iterable.iterator();
    }
}
```

No class inheritance or abstract thingies here! The dependency is explicit. It's a little bit more code, but that's a language issue. Java revolves around class inheritance, so it provides nice syntax for it, but doesn't provide you with any help when it comes to composition.

# It's Useless

Is there something that class inheritance enables that can't be done using simple [composition](http://en.wikipedia.org/wiki/Object_composition)? I think not. It allows delegation with less code, true, but not worth it. And again, it's just a question of language. Automatic delegation could be done in a simpler way. Maybe something like:

```java
interface Parent {
    void method1();
    void method2();
}

class ParentImpl implements Parent {
    public void method1() {}
    public void method2() {}
}

class Child implements Parent {
    @Delegate(Parent.class)
    private final Parent backend;

    public Child(Parent backend) {
        this.backend = backend;
    }

    public void method2() {
        // do stuff before
        backend.method2();
    }
}
```

...where, you probably guessed, `@Delegate(Parent.class)` means that for all methods of the `Parent` interface called on an instance of `Child`, the call actually happens on `backend`, except when `Child` has its own implementation of the method.
