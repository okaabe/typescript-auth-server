import * as express from "express"
import session from "./modules/session/router"

const app = express()

app.use(express.json())

app.get("/ok", (req, res) => {
  return res.status(201).json({
    ok: true,
    message: "Server is running",
  })
})

app.use("/api/session/", session)

export default app
