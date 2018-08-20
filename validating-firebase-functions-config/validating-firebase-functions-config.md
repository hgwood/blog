---
title: Validating Firebase Cloud Functions Configuration Before Deploying
date: 2018-08-20
---

When using [Firebase](https://firebase.google.com/) [Cloud Functions](https://firebase.google.com/docs/functions/), environment configuration for functions code is formed by a set of hierarchical key-value pairs. Values are set using `firebase functions:config:set key=value` (part of the [Firebase CLI](https://www.npmjs.com/package/firebase-tools)). Dots in the key names make up the hierarchy. All values may be dumped into a JSON file reflecting that hierarchy using `firebase functions:config:get`. Values may only be strings. In the functions code itself, values are accessed through `functions.config()` (from the [Firebase SDK for Cloud Functions](https://www.npmjs.com/package/firebase-functions)), which returns the same data structure as `firebase functions:config:get`.

The SDK does not provide any way for the code to express its requirements in terms of configuration. This means functions may be deployed without their required configuration being set on the target project, resulting in a runtime error. Let's see how the configuration can be validated before deploying to prevent such mistakes.

## Using JSON Schema

Since the Firebase CLI can print out the configuration as JSON, it is possible to validate that JSON against a JSON schema. Let's imagine a function that needs to connect to a Auth0 tenant. 

```js
new AuthenticationClient({
    domain: functions.config().auth0.domain,
    clientId: functions.config().auth0.client_id
});
```

This functions requires a Auth0 domain and a client ID for that.

```json
{
    "auth0": {
        "domain": "mydomain.auth0.com",
        "client_id": "fake_client_id"
    }
}
```

The presence of those two values can be ensured using the following schema:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "auth0": {
            "type": "object",
            "properties": {
                "domain": {
                    "type": "string"
                },
                "client_id": {
                    "type": "string"
                }
            },
            "required": [
                "domain",
                "client_id"
            ]
        }
    },
    "required": [
        "auth0"
    ]
}
```

Once this schema is stored in version control next to function code, then the CI pipeline can check the configuration against the schema and fail if it doesn't match. In the following snippet I use the [`ajv`](https://www.npmjs.com/package/ajv) npm package to do the validation.

```sh
firebase --project=$FIREBASE_PROJECT --token=$FIREBASE_TOKEN functions:config:get > config.json
ajv validate -s config-schema.json -d config.json
```

The schema can be made stricter by forbidding extra properties in objects (set `additionalProperties` to `false`).

### Limitations

- There is no guarantee the schema is up-to-date with the corresponding code.
- Since the configuration only supports strings, there is no way to validate that a value is a valid number. For booleans, a enum with the values `"true"` and `"false"` can be used.

I can't see any solution for the second limitation, however the first one can be solved using TypeScript.

## Using TypeScript

If the functions code is written with TypeScript, then types can be used to describe the configuration data structure.

```typescript
export interface Auth0Config {
  domain: string;
  client_id: string;
}

export interface Config {
  auth0: Auth0Config;
}
```

The TypeScript compiler guarantees that the code matches this definition. It's now a matter of ensuring the configuration matches that definition too. In order to do that, this type definition can be converted into a JSON schema, and then we're back to our first approach! I use [typescript-json-schema](https://www.npmjs.com/package/typescript-json-schema) to handle the conversion.

```sh
typescript-json-schema --required --out config-schema.json functions/src/config.ts Config
```

The output is equivalent to the schema shown earlier. Use `--noExtraProps` to forbid extra properties in the configuration.
