---
title: Why I contributed the multi-line option to the eslint curly rule
date: 2016-03-19T23:46
---

About a year ago, I submitted a
[contribution](https://github.com/eslint/eslint/pull/1825) to the eslint
JavaScript linter. This contribution involved adding a new option to the `curly`
rule, named  [`multi-line`](http://eslint.org/docs/rules/curly#multi-line),
which makes eslint allow the absence of curly braces when the opening and the
closing braces would have been on the same line. All other  cases behave as they
would have without that option.

For example, the `multi-line` option will accept this following code:

```js
if (time.midnight) goToSleep()
else writeThisBlogPost()
```

While it will reject this code:

```js
if (time.midnight)
  goToSleep()
else
  writeThisBlogPost()
```

I would like to go a bit more in-depth about why I programmed this option into
eslint. Actually, I will explain why I use this style at all, because it seems
that it is not so common, and it tends to surprise my co-workers.

Most  programmers will impose to them-selves to always use braces in any
situation. The main reason for this is to prevent programming errors while
maintaining the code. This:

```js
if (time.midnight)
  goToSleep()
```

gets transformed into this too easily if not paying enough attention:

```js
if (time.midnight)
  brushTeeth()
  goToSleep()
```

This new code is incorrect.

I understand the rationale for enforcing braces and I completely agree with it.
Now I argue that the problem is not as significant when the statement is on the
same line as the condition: `if (time.midnight) goToSleep()`. In this
configuration, adding a second statement is a more involved operation, and the
maintainer is a lot less likely to make the infamous mistake, I think. I have no
data to back up that claim though.

Joining the condition and the consequence on the same line also presents a
clear-cut advantage: it is more compact. While simply omitting the braces saves
you one line, joining will save you two out of three. Of course, compactness is
not a virtue of its own and should not sought blindly. However, one-line
conditional statements often are trivial, even tangential to the behavior at
hand.

Readable code reveals the intent of the writer. It makes the relevant stand out
and greys out details. If a conditional statement is part of these details, then
I don't want it to span three lines when one is enough. This might apply to
conditionals like returning or throwing when a parameter is a special value.
Special cases in general are not something I want to clutter my algorithm with,
so I find handling them on one line a neat way to tidy up the code and make it
more readable.

In conclusion, I find one-line braceless compound statements to have double the
advantage of two-line ones, while being less problematic. So why not use it?

The `multi-line` option is available from eslint 0.15.  [Checkstyle supports it
too](http://checkstyle.sourceforge.net/config_blocks.html#NeedBraces) using the
`allowSingleLineStatement` property.
