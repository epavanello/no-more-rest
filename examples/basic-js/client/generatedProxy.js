"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
function proxy(address, name, parameters) {
    return new Promise(function (resolve, reject) {
        fetch(address + "/nmr/" + name, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                parameters: __spread(parameters),
            }),
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            resolve(data.result);
        })
            .catch(reject);
    });
}

export function doLogin(username, password) {
  return proxy('http://localhost:8000','doLogin', arguments);
}

export function getLoggedUsers() {
  return proxy('http://localhost:8000','getLoggedUsers', arguments);
}
