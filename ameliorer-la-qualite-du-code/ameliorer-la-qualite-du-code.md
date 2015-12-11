---
title: Améliorer la qualité du code par restriction du langage
date: 2013-11-28T23:51
---

*This post is a written transposition of the talk I gave at Nantes' JUG on November 4th 2013. Since it took place in France, this article is in French.*

*Ce post est une transposition écrite de ma présentation au Nantes JUG le 4 novembre 2013. Les slides sont disponibles [ici](http://fr.slideshare.net/mercury_wood/amliorer-la-qualit-du-code-par-restriction-du-langage).*

Le titre de cette présentation peut paraitre un peu barbare mais derrière se cache une déclaration simple : Java est trop compliqué ! Je pense qu'il présente des fonctionnalités qui sont plus dangereuses qu'utiles, qui en perturbent l'apprentissage et l'écriture. Je suis programmeur auto-didacte depuis une dizaine d'années, et je n'ai rejoint que récemment l'industrie, au sein d'une grande SSII. Bien que j'ai été prévenu que la qualité du code dans l'industrie était mauvaise, j'ai tout de même été très surpris de la réalité. Pourtant, le projet auquel je participe a, sur le papier, tout pour réussir : des tests unitaires à foison, des tests bout-en-bout en veux-tu en voilà, une plate-forme d'intégration continue avec qualimétrie quotidienne, et un système de revue de code. Magnifique n'est-ce pas ? Eh bien non, car la qualité du code reste assez mauvaise.

Qu'est-ce que j'entends par qualité du code ? J'ai cherché une définition objective de la qualité dans le cadre d'une SSII comme la mienne, c'est-à-dire que je me suis demandé quel est l'objectif de l'aventure. Le but de la SSII est de répondre aux besoins du client rapidement pour pas cher. Ainsi elle sera capable de générer des marges et d'être attractive auprès des clients. La caractéristique technique du code qui permet d'atteindre ces objectifs est la maintenabilité. J'émets donc l'hypothèse que **rien n'est plus important que la maintenabilité**. Un code maintenable sera rapide et pas cher à faire évoluer, par définition. Il reste à obtenir cette maintenabilité. La solution est la **modularité**. Lorsqu'un système est modulaire, c'est-à-dire qu'il est découpable en parties autonomes, alors il devient possible de travailler sur un seul module est s'abstrayant des autres. L'application est ainsi plus facile à comprendre. Grâce aux frontières bien dessinées des modules, les évolutions seront cantonnées à une partie du système plus petite. Mais la modularité n'est pas triviale à implémenter. Pour nous aider, nous avons premièrement l'encapsulation, qui permet de fermer hermétiquement les modules. Mais surtout, nous avons nos tests. En effet, si un morceau de code est testable unitairement et simplement, alors c'est qu'il est instanciable indépendamment du système : c'est un module. Ce principe doit être appliqué à tous les niveaux (tests unitaires, d'intégration, d'acceptance, systèmes). Pour encore améliorer la maintenabilité, c'est encore mieux de s'assurer que les tests sont d'une **extrême lisibilité**, précis et concis. Il servent alors de spécification des modules. C'est pourquoi tout au long de cet article je mettrais un accent particulier sur la **testabilité** du code comme garant de la qualité.

Maintenant que la qualité est définie, je vais définir un autre mot du titre qu'est langage. Cet article se penche en particulier sur Java, puisque c'est le langage que "tout le monde" connait, mais la plupart sinon toutes les remarques qui seront faites sont applicables aux langages orientés classe. Ces langages présentent des fonctionnalités qui me semblent plus dangereuses qu'utiles. Je vais les présenter et expliquer pourquoi je pense que ces langages seraient mieux sans.

# null

### Problèmes

- NullPointerException est l'exception la plus courramment levée. Pour nous en prémunir, nous polluons notre code avec des instructions conditionnelles.
- Invisible à la compilation, il explose au runtime.
- C'est un concept totalement technique, mais auquel il est facile d'attacher un sens métier (`findFirstPersonWithName(String)` qui renvoie null si aucun résultat est un exemple commun) qui devient impossible à décoder une fois sorti du morceau de code qui l'a produit (que signifie le null dans la variable `person` 3 appel de méthode plus loin ?).
- Il casse complètement le typage du langage. Une méthode dont la signature comprend le type de retour T peut en effet renvoyé null, qui n'est pas un objet de type T.
- Il casse complètement le concept de l'orienté-objet, puisque ce n'est pas un objet.

### Alternatives

- Intégrer la notion d'absence de résultat dans le système de type. Par exemple avec le type [Optional](https://code.google.com/p/guava-libraries/wiki/UsingAndAvoidingNullExplained#Optional) de [Guava](https://code.google.com/p/guava-libraries/).
- Utiliser le [Null Object Pattern](http://en.wikipedia.org/wiki/Null_object_pattern).
- Lever une exception.

Article de ce blog sur le sujet : [No Nulls Shall Pass](../no-nulls-shall-pass/no-nulls-shall-pass)

# Les méthodes privées

*Les schémas sur les slides peuvent aider à comprendre.*

Prenons le cas d'utilisation des méthodes privées. Nous avons une classe avec une méthode publique est trop imposante et nous souhaitons la découper en plusieurs morceaux. Pour cela, nous créons deux méthodes privées, que la méthode publique appellent l'une après l'autre et nous partageons le code entre les deux. Il semblerait que nous avons gagné en lisibilité puisque nous avons des unités de code plus petites et nous avons pu nommer deux nouveau morceaux de code. Il subsiste cependant des problèmes majeurs.

### Problèmes

- Le code du test est resté le même. Pourtant, si la méthode testée était imposante, alors le test est sûrement lui aussi imposant, et il l'est toujours ! Nous n'avons donc rien gagné en termes de modularité. Le gain est strictement visuel.
- Il est possible qu'une ou plusieurs des méthodes privées n'accèdent à aucun champ de la classe. De toute évidence elle n'a rien à faire dedans.
- Une méthode privée a toutes les libertés au sein d'une classe. Lorsqu'une méthode privée est appelée, il est impossible de savoir quels peuvent être ces effets sur les champs environnants, tout comme si l'on avait à faire a des variables globales. Ceci diminue la lisibilité.
- Elles n'aident aucunement à encapsuler, contrairement à certaines croyances (voir l'alternative).
- Elles peuvent sournoisement cacher des concepts importants (voir l'alternative).

### Alternative

Une solution bien meilleure consiste à exporter les méthodes privées vers de nouvelles classes, où elles sont publiques. La ou les nouvelles classes deviennent alors des dépendances de la classe d'origine (des objets de type correspondant lui sont passés par son contructeur).

- Le test peut alors mocker ces dépendances et se contenter de tester la méthode d'origine, et elle seule (il est bien évidemment nécessaire d'écrire de nouveaux tests pour les nouvelles classes et méthodes).
- Chaque méthode n'a accès qu'à ce qui lui est nécessaire, et rien d'autre.
- Le développeur sera forcer de trouver un nom pour la ou les nouvelles classes, ce qui lui permettra de découvrir de nouveaux concepts, potentiellement importants, de son domaine métier. Par ailleurs, si ce concept est amené à évoluer par demande client, alors les modifications seront hermétiquement encapsulées par la classe qui l'implémente.
- La dépendance entre la classe d'origine et les nouvelles est implémentée au travers d'un champ privé. Il n'est toujours pas possible d'accéder aux méthodes anciennement privées lorsque l'on a un objet du type de la classe d'origine.

Article de ce blog sur le sujet : [Why I Avoid Private Methods](../why-i-avoid-private-methods/why-i-avoid-private-methods)

# L'héritage de classe

### Problèmes

- Impose une dépendance dure entre 2 classes. Impossible de tester une classe fille sans tester la classe mère.
- Admet que l'encapsulation puisse être brisée, via le mot-clé protected.

### Alternative

Une composition, tout simplement ! Voir les slides et [Single Class Inheritance Is Hell](../single-class-inheritance-is-hell/single-class-inheritance-is-hell).

# Les classes abstraites

Les classes abstraites sont bizarres. Très, très bizarre. La testabilité requiert que les dépendances soient explicites et remplaçables. Les classes abstraites sont tout le contraire. Impossible de les instancier sans une classe fille, et impossible d'instancier la classe fille sans classe mère. Une merveille de non-sens. Alternative : à nouveau une simple composition. Voir les slides et [Single Class Inheritance Is Hell](../single-class-inheritance-is-hell/single-class-inheritance-is-hell).

# Les champs et méthodes statiques

### Problèmes

- Une référence à une classe (System dans System.out par exemple, ou n'importe quelle utilisation de `new`) est une dépendance non remplaçable, ce qui rend le code qui l'utilise très difficile à tester.
- Le langage gère les membres statiques de manière très peu adaptée. En effet, les membres d'instance et les membres statiques sont tous mélangés au sein du même bloc de code alors qu'ils n'ont rien à voir entre eux ! Les membres statiques appartiennent à la classe, alors que les membres d'instance appartiennent aux objets instanciés par la classe. Aucun rapport.
- Les champs statiques non finaux sont autorisés alors qu'une classe est une entité globale ! On a donc des variables globales.

### Alternative

- Ne pas utiliser
- Quand il s'agit d'une API tierce (le JDK par exemple), wrapper dans une API non statique.

Avant :

```java
    class SomeDomainClass {
        public void sayHello() {
             System.out.println("hello!");
        }
    }
```

Après :

```java
class SomeDomainClass { // pure domain class
    private final Printer printer;
    public SomeDomainClass(Printer printer) {
        this.printer = printer;
    }
    public void sayHello() {
        printer.println("hello!");
    }
}

class SystemPrinter implements Printer { // adapter class
    public void println(String message) {
        System.out.println(message);
    }
}
```

### Exceptions

- En général il est acceptable d'appeler un constructeur pour obtenir un objet valeur ([value object](http://en.wikipedia.org/wiki/Value_object), [newables](http://misko.hevery.com/2008/09/30/to-new-or-not-to-new/)) comme une instance de String. Il faut faire attention à bien implémenter ces objets pour qu'ils respectent toutes les caractéristiques nécessaires.
- Les méthodes statiques avec `import static` sont extrêmement utiles pour écrire des tests très lisibles. Comme on ne teste pas les tests, ça pose moins de problèmes.

Article de ce blog sur le sujet : [Classes as Simple Type Definitions](http://elevatedabstractions.wordpress.com/2013/09/10/76/)

Ma référence en la matière : [Misko Hevery's Guide to Writing Testable Code](http://misko.hevery.com/code-reviewers-guide/flaw-brittle-global-state-singletons/)

# Pragmatisme et débutants

Je ne dis pas qu'il faut absolument et complètement banir toutes ces fonctionnalités. Il faut simplement reconnaitre et maitriser leurs inconvénients. On peut alors peser le pour et le contre et prendre de sages décisions. Les ennuis commencent quand on a affaire a des débutants. Les problèmes que j'ai exposé sont rarement (jamais ?) abordés lors de la formation des programmeurs, que ce soit à l'école ou dans les livres d'introduction. Au contraire, des fonctionnalités comme l'héritage de classe sont présentées comme héroïques, indispensables, à la base de l'orienté-objet ! Il n'en est rien. Et pourtant, les SSII demandent tous les jours à des débutants de prendre des décisions concernant le design de code. Il y a manifestement un sérieux problème au niveau de la formation des développeurs. C'est peut-être un des seuls métiers où l'on est traité comme compétent avant d'être sorti de l'école. Robert "Uncle Bob" Martin (fameux auteur de _Clean Code_) a récemment publié deux articles à ce sujet : "[Hordes of Novices](http://blog.8thlight.com/uncle-bob/2013/11/19/HoardsOfNovices.html)" et "[Novices. A Coda](http://blog.8thlight.com/uncle-bob/2013/11/25/Novices-Coda.html)". Je ne peux qu'être d'accord avec lui.

Article de ce blog à ce sujet : [Pragmatism &amp; Beginners](../pragmatism-beginners/pragmatism-beginners)
