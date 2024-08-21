"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
const PORT = 8000;
server.listen(PORT, () => console.log(`Server is started at port ${PORT}`));
server.get("/", (req, res) => {
    res.send("Hello World");
});
