---
title: Personal secrets in Vault 0.11+
date: 2018-08-21
---

# Personal secrets in Vault 0.11+

*Disclaimer: I've only been discovering Vault for a few days, this article may contain some approximative descriptions, incorrect use of vocabulary, or event blatant mistakes. Hopefully not though* 😄.


## Vault Basics

[Vault](https://www.vaultproject.io/) is an open-source "tool for managing secrets". There's lots of stuff it can do but perharps its most basic features is to be a secure data store for secrets. That's what the [key-value secret engine](https://www.vaultproject.io/docs/secrets/kv/index.html) does. You put key-value pairs into Vault, and then you read them back.

```sh
vault kv put secret/data/hello-world secret_key=1234
vault kv get secret/data/hello-world
> secret_key=1234
```

The first argument to `kv put` and `kv get` is a path. The path is used to control permissions to read and write keys, using policies. While policies may restrict a Vault user to access a given path, all users still share the same paths. This means that users have no personal space to store personal secrets in the key-value secret engine. It can only be achieved by writing a specific policy for each and every user, allowing them to use a unique path that no other user has access to. Not very practical.


## What's the use case for personal secrets?

The primary use case for Vault is as a dispenser for secrets usually stored in application configuration. In this scenario, the Vault users are applications. A team manually sets secrets in Vault, then running applications connect to Vault to retrieve them. There is no real need for dynamism here. 

However, Vault supports multiple [authentication backends](https://www.vaultproject.io/docs/concepts/auth.html) including [LDAP](https://www.vaultproject.io/docs/auth/ldap.html) and [OpenID Connect](https://www.vaultproject.io/docs/auth/jwt.html). Those backends make it possible for applications to connect to Vault not as them-selves, but on behalf of actual people. And people need their personal space, right?

Right. And it was never as right as right now, because [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation). The GDPR defines personal data as anything than can be linked back to a person. As soon as a system manipulates personal data, GDPR requires it to comply with quite of lot of regulations. In particular, all accesses to personal data should be auditable.

Well, what if every piece of data than can identify a person could be stored in Vault, on the behalf of this person? It would only be accessible to them, or to an application where they have logged in through a compatible authentication system (like LDAP or OpenID Connect). Besides, Vault already has good auditability.

So where's the personal space?


## What about the cubbyhole engine?

Vault provides at alternate secret engine, the [cubbyhole engine](https://www.vaultproject.io/docs/secrets/cubbyhole/index.html), which works the same as the KV engine, except that all paths are namespaced to a token. Tokens are the most basic way you may log into Vault. They are opaque strings that have policies and a time-to-live attached to them. When a token is revoked, its cubbyhole is deleted. Consequently, having personal data inside a cubbyhole would mean having long-lived tokens, and while I'm not sure about this, I think that's not great. Also, logging in to Vault with an authentication backend as described earlier generates a new token everytime, so using cubbyhole would force applications to save the token resulting from the first login and keep renewing it forever. Again, not very practical.


## Vault 0.11 saves the day

The cubbyhole engine is not the right tool, because tokens are not the right scope. What we need is a private space not for tokens, but for the user entities provided by authentication backends. [There is an issue for that](https://github.com/hashicorp/vault/issues/3229) on the GitHub repository for Vault. It teaches us that policies will support interpolation of user entities inside paths at some point in the future. After following a couple of links we learn that that's been merged a few days ago! 🎉 And better yet, right after that a beta version was released (0.11.0-beta1), which means compiled binaries are available [here](https://releases.hashicorp.com/vault/)! 🎉🎉

There is no documentation yet but [looking at the Go source code](https://github.com/hashicorp/vault/pull/4994/files#diff-0f0052448a554a075a8140ca1a0d7598R190) we should be able to use `{{identity.entity.id}}` or `{{identity.entity.name}}` inside paths in policies.

And voilà!

```hcl
path "secret/{{identity.entity.id}}/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
```

Assuming we have a token with the above policy attached, we can do the following:

```sh
vault token lookup
> ... entity id: <entidy id> ...
vault kv put secret/data/<entity id>/app1 email=...
```


## Limitation?

Since the personal space is part of the shared key-value namespace, it is accessible by root tokens. However, [root tokens should not exist in normal operation](https://www.vaultproject.io/docs/concepts/tokens.html#root-tokens), and [their generation is complex](https://www.vaultproject.io/docs/commands/operator/generate-root.html), so I think that's OK, even desirable maybe, in some exceptional cases.


## What now?

The Vault personal space enables applications to securely store identifiable personal data. Application data that would normally be personal because it would be linked to this identifiable data can be anonymized but still linked using a user ID stored into the personal space. The application database doesn't store any personal data anymore and thus doesn't fall under the GDPR.

That's the idea anyway. I haven't put this into production. Yet. 😁
