import * as JwtRaw from "jwt-simple"
import { DecodeResult } from "../model/DecodeResult"

import { EncodeResult } from "../model/EncodeResult"
import { ExpirationStatus } from "../model/ExpirationStatus"
import { PartialSession } from "../model/PartialSession"
import { Session } from "../model/Session"

/**
 * encode
 * decode
 * checkExpiration
 */

export const handleSecret = (throwable: string) => {
  if (process.env.JWT) {
    return String(process.env.JWT)
  }

  throw throwable
}

const encode = (
  partial: PartialSession,
  secret: string = handleSecret(
    "jwt secret enconding process requires a secret code"
  ),
  algorithm: JwtRaw.TAlgorithm = "HS256"
): EncodeResult => {
  const now = Date.now()
  const expiresAt = Date.now() + 5 * 60 * 60 * 1000 //3h

  const encoded = JwtRaw.encode(
    {
      ...partial,
      issuedAt: now,
      expiresAt,
    },
    secret,
    algorithm
  )

  return {
    token: encoded,
    issuedAt: now,
    expiresAt,
  }
}

const decode = (
  token: string,
  secret: string = handleSecret("PUT THE FUCK OF THE SECRET MOTHER FUCKER"),
  algorithm: JwtRaw.TAlgorithm = "HS256"
): DecodeResult => {
  try {
    const decoded = JwtRaw.decode(token, secret, false, algorithm)

    return {
      type: "ok",
      decodeResult: decoded,
    }
  } catch (err: any) {
    switch (err.message) {
      case "No token supplied":
      case "Not enough or too many segments":
        return { type: "invalid-token" }

      case "Signature verification failed":
      case "Algorithm not supported":
        return { type: "integrity-error" }

      default:
        if (!err.message.indexOf("Unexpected token")) {
          return { type: "invalid-token" }
        }

        if (!err.message.indexOf("Unexpected end of JSON input")) {
          return { type: "invalid-token" }
        }

        throw err
    }
  }
}

const checkExpiration = (session: Session): ExpirationStatus => {
  const now = Date.now()

  if (session.expiresAt > now) {
    return "active"
  }

  const renewTime = 3 * 60 * 60 * 1000

  if (now + renewTime > now) {
    return "renew"
  }

  return "expired"
}

export { encode, decode, checkExpiration }
