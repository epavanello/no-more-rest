
import { Application } from "express";
import { Options } from "./cli";


export function expose(app: Application, api: { [key: string]: any }) {
  const keys = Object.keys(api);
  for (const key of keys) {
    const f = api[key];
    if (typeof f == "function") {
      console.log("Exposed", f.toString());
      app.post(`/fapi/${key}`, (req, res) => {
        const parameters: any[] = (req.body as any).parameters;

        const result = f.apply(null, parameters);
        if (result instanceof Promise) {
          result.then(function (data) {
            res.send({ result: data });
          });
        } else {
          res.send({ result: result });
        }
      });
    }
  }
}
