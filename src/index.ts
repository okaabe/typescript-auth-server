import "make-promises-safe"
import { inspect } from "util"
import { logger } from "./logger"

import * as JWT from "./modules/session/usecase/jwt"

const encoded = JWT.encode(
  {
    name: "oi",
    email: "a",
    createdAt: new Date(),
    surname: "oidaw",
  },
  "KDOPAWD",
  "HS256"
)

// logger.debug(
//   `Encoded session: ${inspect(encoded)}\n\nTOken expires at ${new Date(
//     encoded.expiresAt
//   )}`
// )

try {
  const decoded = JWT.decode(
    ["oi", ...encoded.token.split(".").slice(1)].join("."),
    "KDOPAWD",
    "HS256"
  )

  logger.debug(`Decoded session: ${inspect(decoded)}`)
} catch (err) {
  logger.error(`${inspect(err)}`)
}
