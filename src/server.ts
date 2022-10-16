import * as express from "express"

const app = express()

app.get("/ok", (req, res) => {
  return res.status(201).json({
    ok: true,
    message: "Server is running",
  })
})

export default app
