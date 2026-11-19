import "./ui/styles.css";
import { App } from "./ui/app";
import * as engine from "./engine";
import { missing } from "./i18n";

const app = new App();
// For the automated tests and the picture tools: a small, stable handle on the running app.
(window as any).__app = app;
(window as any).__engine = engine;
(window as any).__i18n = { missing };
