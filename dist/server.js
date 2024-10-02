"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
const server = (0, express_1.default)();
const PORT = 8000;
server.use(express_1.default.json()); // Middleware to parse JSON bodies
server.use("/api", userRoutes_1.default, matchRoutes_1.default, chatRoutes_1.default, eventRoutes_1.default, petRoutes_1.default);
server.listen(PORT, () => console.log(`Server is started at port ${PORT}`));
server.get("/", (req, res) => {
    res.send("Hello World");
});
