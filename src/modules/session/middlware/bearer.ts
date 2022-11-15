import { Request, Response, NextFunction } from "express"

import * as JWT from "../usecase/jwt"
import codes from "../../../lib/codes"

export const REQUEST_HEADER = "authorization"
export const RESPONSE_HEADER = "renewed-authorization"

export const middlware = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers[REQUEST_HEADER]

  if (!authorization) {
    return res.status(codes.BAD_REQUEST).json({
      ok: false,
      message: "bad-request",
    })
  }

  try {
    const session = JWT.decode(authorization)

    if (session.type !== "ok") {
      return res.status(codes.UNAUTHORIZED).json({
        ok: false,
        message: "unauthorized",
      })
    }

    const expirationStatus = JWT.checkExpiration(session.decodeResult)

    if (expirationStatus === "expired") {
      return res.status(codes.UNAUTHORIZED).json({
        ok: false,
        message: "unauthorized",
      })
    }

    if (expirationStatus === "renew") {
      const renewedToken = JWT.encode({
        name: session.decodeResult.name,
        email: session.decodeResult.email,
        surname: session.decodeResult.surname,
        createdAt: session.decodeResult.createdAt,
      })

      res.setHeader(RESPONSE_HEADER, renewedToken.token)

      session.decodeResult = {
        ...session.decodeResult,
        expiresAt: renewedToken.expiresAt,
        issuedAt: renewedToken.issuedAt,
      }
    }

    res.locals.session = session.decodeResult

    next()
  } catch (err) {
    return res.status(codes.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: "internal-server-error",
    })
  }

  next()
}
