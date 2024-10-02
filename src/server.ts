import express from "express";
import userRoutes from "./routes/userRoutes";
import matchRoutes from "./routes/matchRoutes";
import chatRoutes from "./routes/chatRoutes";
import authMiddleware from "./middlewares/authMiddleware";
import eventRoutes from "./routes/eventRoutes";
import petRoutes from "./routes/petRoutes";

const server = express();
const PORT = 8000;

server.use(express.json()); // Middleware to parse JSON bodies

server.use("/api", userRoutes, matchRoutes, chatRoutes, eventRoutes, petRoutes);

server.listen(PORT, () => console.log(`Server is started at port ${PORT}`));

server.get("/", (req, res) => {
  res.send("Hello World");
});
