---
title: Best Programming Book Yet
date: 2013-10-03T14:46
---

A quick word about *Growing Object-Oriented Software, Guided by Tests*. It's a book from Steeve Freeman and Nat Pryce (unknown to me before), and it's the best programming book I've read so far. It shows how TDD can be applied at all levels : unit, integration, and acceptance.

I find it very effective because it features a whole part which is just a big example. The authors walk you through the test-driven development of a nearly real world application. It's written as a story of people making progress, mistakes and corrections. The example is big enough so that the design is not trivial, and the reader can really witness the shaping of it through the tests.

It also shows how system and acceptance tests, when written first, can drive the infrastructure to be just was is needed and not more.

I've been trying to apply those principles with a very small piece of software which connects to a CI server to read the last build status and display it using a USB traffic light. I'm quite amazed at how I can refactor all over the place while remaining confident that the app works (not just the components).

I highly recommend this read.
