---
title: Upgrading JUnit and Test Execution Order
date: 2014-02-08T13:11
---

For a couple of months or so, I've been working on purely technical stuff at work and I've been deeply enjoying it. The customer plans to upgrade their execution platform from Java 5 to Java 7, so we've been tasked to make the app Java 7 compatible. Since it currently depends on Spring 2.5, which is not Java 7 compatible, one sub-task is to upgrade Spring to version 3, which itself depends on JUnit 4.5 or newer. Of course,  we only had JUnit 4.3. Of the two upgrades, we honestly thought Spring would cause more trouble. We were so confident of that actually, that we didn't even bother upgrading JUnit to 4.11 prior to upgrading Spring. We changed both versions in the POM, checked that it compiled, and committed that, leaning on CI to run the tests. The build turned red, which usually mean there is compilation issue, but that was not the case here. The build failed because it timed out. Looking more closely, I realized that a test had been running indefinitely until Jenkins gave up. I opened up the test's code and that's what I read:

```java
@Test
public void test1() {
    // stuff
    countDownLatch.countDown();
    // more stuff
}

@Test
public void test2() {
    countDownLatch.await();
    // other stuff
}
```

This means `test2` was waiting for `test1` to do its thing before starting. Turns out this accidentally works with JUnit 4.3 on a version 5 JRE, which consistently runs test methods in the order they are written in. This is not true of JUnit 4.11, in which `test2` is run (always?) before `test1`, effectively blocking indefinitely.

The lesson is clear and already well-known of course: never depend on the test execution order. Tests must be independent, and here's a practical consequence of breaking the rule.

Other causes of order-dependent tests I've found:

- mutation of static fields in the test class
- mutation of public static fields in other classes
- mutation of instance fields of singleton instances, including aspects
- mutation of instance fields of singleton Spring beans, without using `@DirtiesContext`

Some tests were order-dependent for a reason I was unable to find in a reasonable amount of time. For these, I used the `@FixMethodOrder` annotation from JUnit. Passing `MethodSorters.JVM` as a parameter to this annotation, tests are run in the order returned by the JVM, which in Java 5 in the order of declaration. The annotation was also very useful to confirm order dependency.

