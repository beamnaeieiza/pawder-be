import express from "express";

const server = express();
const PORT = 8000;

server.listen(PORT, () => console.log(`Server is started at port ${PORT}`));

server.get("/", (req, res) => {
  res.send("Hello World");
});
