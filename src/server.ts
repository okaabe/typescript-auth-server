import * as express from "express"
import * as cors from "cors"
import session from "./modules/session/router"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/ok", (req, res) => {
  return res.status(201).json({
    ok: true,
    message: "Server is running",
  })
})

app.use("/api/session/", session)

export default app
