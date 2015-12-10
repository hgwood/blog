---
title: Single-method Class Instanciation is the same as Partial Application
date: 2013-09-06T23:38
---

Just a thought.

Given this Java code:

```java
class SingleMethodClass {

    private final Dependency dependency;

    public SingleMethodClass(Dependency dependency) {
        this.dependency = dependency
    }

    public Result singleMethod(WhateverType parameter) {
        // compute something using dependency and parameter
    }

    public static void main(String[] args) {
        // get hold of some values for dependencies and parameters

        SingleMethodClass instance1 = new SingleMethodClass(dependency1);
        Result result1A = instance1.singleMethod(parameter1A);
        Result result1B = instance1.singleMethod(parameter1B);

        SingleMethodClass instance2 = new SingleMethodClass(dependency2);
        Result result2 = instance2.singleMethod(parameter2);
    }
}
```

The class is a factory for objects that compute values of type `Result`. The computation depends on `dependency` and `parameter`. So actually the computation has 2 inputs, but I want to be able to easily repeat the computation with the first input fixed. I don't want to have to pass it every time, hence the class, which holds on to the fixed value. Thinking of it like that, this mechanism ranged a bell. Partial application!

So I can do the same using partial applications in Haskell (names are chosen to map to the code above, even though they don't make sense here):

```haskell
-- get hold of some values for dependencies and parameters

singleMethodClass dependency parameter = -- compute something using dependency and parameter

instance1 = singleMethodClass dependency1
result1A = instance1 parameter1A
result1B = instance1 parameter1B

instance2 = singleMethodClass dependency2
result2 = instance2 parameter2
```

...which is, in my opinion, way more simple. With partial application, functions are function factories.
