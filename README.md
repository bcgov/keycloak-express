# BCGov SSO Keycloak Integration

[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](Redirect-URL)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[![NodeJS](https://img.shields.io/badge/Node.js_18-43853D?style=for-the-badge&logo=node.js&logoColor=white)](NodeJS)
[![Typescript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](Typescript)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](Express)

<br />

## Table of Contents

- [General Information](#general-information)
- [Getting Started with the Integration](#getting-started-with-the-integration) - Start Here!
- [Environment Variables](#environment-variables) - Required variables for initialization.
- [Module Exports](#module-exports) - Functions and Types available from the module.
- [Initialization Options](#initialization-options) - Additional options.
- [Authentication Flow](#authentication-flow) - How it works from login button click.
- [Authentication on an Endpoint](#authentication-on-an-endpoint) - Require user to be signed in.
- [Authorization on an Endpoint](#authorization-on-an-endpoint) - Require user to have a permission.

## General Information

- For running on a NodeJS:18 Express API.
- For Keycloak Gold Standard.
- Works with Vanilla JavaScript or Typescript 5.
- For use with [@bcgov/keycloak-react]

<br/>

## Getting Started with the Integration

1. Add the following line to your `package.json` under `"dependencies":`:

```JSON
"@bcgov/keycloak-express": "https://github.com/bcgov/keycloak-express/releases/download/v1.0.0-alpha.1/bcgov-keycloak-express.tgz",
```

2. Add import `const { keycloakInit } = require('@bcgov/keycloak-express');` or `import { keycloakInit } from '@bcgov/keycloak-express';` to the top of the file that defines the express app. Add `keycloakInit(app);` below the definition of the express app, where `app` is defined by `express()`.
3. Add the required environment variables from the [Environment Variables](#environment-variables) section below.

[Return to Top](#bcgov-sso-keycloak-integration)

<br />

## Environment Variables

```ENV
# Ensure the following environment variables are defined on the container.

ENVIRONMENT= # (local only) Set to 'local' when running container locally.
FRONTEND_PORT= # (local only) Port of the frontend application.
PORT= # (local only) Port of the backend application.

FRONTEND_URL= # (production only) URL of the frontend application.
BACKEND_URL= # (production only) URL of the backend application.

SSO_CLIENT_ID= # Keycloak client_id
SSO_CLIENT_SECRET= # Keycloak client_secret
SSO_AUTH_SERVER_URL= # Keycloak auth URL, see example below.
# https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect
```

[Return to Top](#bcgov-sso-keycloak-integration)

<br />

## Module Exports

These are the functions and types exported by the `@bcgov/keycloak-express` module.

```JavaScript
import {
  keycloakInit, // Initializes the keycloak service in your express app.
  middleware, // Middleware function used for authentication and authorization.
} from '@bcgov/keycloak-express';

// Typescript Types
import {
  KeycloakUser, // Type for req.user
  KeycloakInitOptions, // Type of optional second parameter for keycloakInit
} from '@bcgov/keycloak-express';
```

[Return to Top](#bcgov-sso-keycloak-integration)

<br />

## Initialization Options

Optional second parameter to the `keycloakInit()` function.

Currently supports the following functionality:

```JavaScript
/*
 * A function that will be passed the userInfo defined as the
 * KeycloakUser type or the same as req.user.
 *
 * Use cases:
 * - Add user to database upon first login.
 * - Update a last login field in database.
 */
afterUserLogin?: (userInfo: KeycloakUser) => void;
```

Example usage:

```JavaScript
import express from 'express';
import { keycloakInit } from '@bcgov/keycloak-express';
import { activateUser } from './src/utils';

// Define Express App
const app = express();

// Initialize Keycloak.
const keycloakOptions = { afterUserLogin: activateUser };
keycloakInit(app, keycloakOptions);
```

[Return to Top](#bcgov-sso-keycloak-integration)

<br />

## Authentication Flow

The Keycloak Authentication system begins when the user visits the frontend application.

1. The user visits the frontend of the application. Here, the `KeycloakWrapper` component initializes and checks the URL for a query parameter named `token`.

- If the `token` query parameter is found:

  - The component strips the URL of the access token.
  - The user's information is set into the state using the token.
  - The user can now access the frontend of the application.

- If the `token` query parameter is not found, the component checks if the user is logged in by using the refresh token to get a new access token by communicating with the `/api/oauth/token` endpoint.
  - If the refresh token exists and is valid, the user can now access the frontend of the application without seeing the login button, as their session is authenticated through the refresh token.
  - If the refresh token doesn't exist or is invalid, the login button is displayed.

2. When the user clicks the login button, they are routed to the `/api/oauth/login` endpoint via a proxy pass, which then redirects them to the Keycloak login page.

3. Upon successful login at the Keycloak login page, Keycloak redirects the user to the `/oauth/login/callback` endpoint.

4. The authentication code returned by the callback endpoint is used to retrieve the access token and the refresh token for the user.

5. The user is redirected back to the frontend with the access token included as a `token` query parameter and the refresh token set as an httpOnly cookie.

6. The `KeycloakWrapper` component re-initiates and the process repeats from step 1, this time with the `token` query parameter available.

<img width="100%" src="https://github.com/bcgov/keycloak-react/assets/16313579/08c5d42a-b08a-46db-9e13-157417b6df3c">

[Return to Top](#bcgov-sso-keycloak-integration)

<br/>

## Authentication on an Endpoint

Require keycloak authentication before using an endpoint.
Import `middleware` from `@bcgov/keycloak-express` and add as middleware.

Example (`middleware` is aliased to `protect`):

```JavaScript
import { middleware: protect } from '@bcgov/keycloak-express';

app.use("/users", protect, usersRouter);
```

[Return to Top](#bcgov-sso-keycloak-integration)

<br/>

## Authorization on an Endpoint

Get the keycloak user info in a protected endpoint.  
**IMPORTANT:** `req.user` is either populated or null and the `req.user.client_roles` property is either a populated array or undefined.

Example within a controller of a protected route:

```JavaScript
const user = req.user;
if (!user) return res.status(404).send("User not found.");
else {
  if (!req.user?.client_roles?.includes('Admin'))
    return res.status(403).send('User must be Admin.');
  // Do something with user.
}
```

For all user properties reference [SSO Keycloak Wiki - Identity Provider Attribute Mapping].  
Example IDIR `req.user` object (Typescript Type is `KeycloakUser`):

```JSON
{
  "idir_user_guid": "W7802F34D2390EFA9E7JK15923770279",
  "identity_provider": "idir",
  "idir_username": "JOHNDOE",
  "name": "Doe, John CITZ:EX",
  "preferred_username": "a7254c34i2755fea9e7ed15918356158@idir",
  "given_name": "John",
  "display_name": "Doe, John CITZ:EX",
  "family_name": "Doe",
  "email": "john.doe@gov.bc.ca",
  "client_roles": ["Admin"]
}
```

[Return to Top](#bcgov-sso-keycloak-integration)

<!-- Link References -->

[access token]: https://auth0.com/docs/secure/tokens/access-tokens
[refresh token]: https://developer.okta.com/docs/guides/refresh-tokens/main/
[@bcgov/keycloak-react]: https://github.com/bcgov/keycloak-react
[SSO Keycloak Wiki - Identity Provider Attribute Mapping]: https://github.com/bcgov/sso-keycloak/wiki/Identity-Provider-Attribute-Mapping
