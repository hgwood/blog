---
title: Angular.js Custom Component Properties
date: 2016-06-17T22:20
---

Here's a trick I learned today. It is possible to attach custom properties to component definition objects in Angular 1.5.

```js
.component('customComponent', {
  ...
  $customProperty: customValue,
}
```

You can then consume those from anywhere using the [`$injector`](https://docs.angularjs.org/api/auto/service/$injector).

```js
$injector.get('customComponentDirective')[0].$customProperty
```

The property names have to start with a `$`, otherwise they are not retained by Angular.

Now how can this be useful? I think it may be useful when a group of components have a common behavior for which the code can be factored out in one place, but individual components still need to provide some different input values to the algorithm. Of course, this can also be done through a directive in the template of each component, but if those input values are objects with a few properties, then it can be a bit awkward to write them out in the middle of HTML.
