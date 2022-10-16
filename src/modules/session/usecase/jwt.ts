import * as JwtRaw from "jwt-simple"
import { DecodeResult } from "../model/DecodeResult"

import { EncodeResult } from "../model/EncodeResult"
import { PartialSession } from "../model/PartialSession"

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
  const expiresAt = Date.now() + 60 ** 3 * 10 //3h

  const encoded = JwtRaw.encode(
    {
      ...partial,
      issuedAt: now,
      expiresAt: now,
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

        throw err
    }
  }
}

const checkExpiration = () => {}

export { encode, decode, checkExpiration }
