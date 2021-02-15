import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
app.use(cors());
app.use(bodyParser.json());
import * as myApi from "./myApi.js";

import { expose } from "no-more-rest";
expose(app, myApi);

app.listen(8000);
