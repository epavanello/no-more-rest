# NO MORE REST

No more rest calls! Call directly your backend APIs from EVERYWHERE! 🌍🚀

Simplify and boost your development process, with this small package you are allowed to integrate continuously your backend APIs and your client code directly.

With a smart generator that create in real time (*with a -watch mode*) a small proxy, you're able to call transparently your remote functions with all the support you need (intellisense, types, return types and more).
<br>
* revolutionizes the ways you develop as full stack developer
* Easy to use and batteries included

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Configuration](#configuration)
4. [Dependencies](#dependencies)
5. [Examples](#example)

## Installation

Install the package on the server project with `npm i no-more-rest`

## Usage

Wrap your APIs and expose via express in this way

``` javascript
//server/myApi.js

export function doLogin(username, password) {
  return username == "admin" && password == "admin";
}

export function getLoggedUsers() {
  return ["Elon Musk", "admin"];
}
```

``` javascript
// server/server.js

import express from "express";
import { expose } from "no-more-rest";

import * as myApi from "./myApi";

const app = express();
expose(app, myApi);

app.listen(8000);
```

* Add this npm script to your package to generate the proxy script for the client from the exposed module

``` json
"scripts": {
   "sync-api": "no-more-rest --input myApi.js --output-dir ../your-client-path/ --watch"
}
```

* Import in the client your generated proxy and use it as if it were on your backend.

``` javascript
// client/index.js
import { doLogin, getLoggedUsers } from "./generatedProxy";

doLogin("admin", "admin")
  .then((result) => {
    if (result) {
      alert("Login success");

      getLoggedUsers().then((users) => {
        alert("The logged users are: " + users.join(", "));
      });
    } else {
      alert("Login failed");
    }
  })
  .catch(() => {
    alert("Network error");
  });
```

## Configuration

The *no-more-rest* cli support these parameters

* **--input** - *the file that exposes the functions*
* **--output-dir** - *The destination folder*
* **--typescript-output** - *Typescript output format*
* **--filename** - *Filename to generate*
* **--watch** - *Watch and generate the proxy file*

## Dependencies

Actually body-parser is a dependency on the server to be able to parse json body.

## Examples

Here the first basic working example 💪🏽

1. [basic-js](https://github.com/epavanello/no-more-rest/tree/master/examples/basic-js)

## Development

### Roadmap

* [x] Javascript generator
* [x] Proxy APIs
* [ ] Typescript generator
* [ ] Initialization command `no-more-rest init for` server and client
    * Server - Add "generate" script package.json
    * Server - Generate empty api.ts source
    * Server - Locate and generate config for client path
* [ ] Authorization example
* [ ] Plugin website