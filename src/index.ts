import "make-promises-safe"
import { logger } from "./logger"
import app from "./server"

app.listen(3333, () => {
  logger.debug("Server is running")
})
