import { Request, Response, NextFunction } from "express"

import * as JWT from "../usecase/jwt"
import * as session from "../usecase/session"

import httpStatusCodes from "../../../lib/codes"
import { logger } from "../../../logger"

export const REQUEST_AUTH_HEADER = "authorization"
export const RESPONSE_AUTH_HEADER = "x-renew-authorization"

export const middlware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authorization = request.headers[REQUEST_AUTH_HEADER]

  if (!authorization) {
    return response.status(httpStatusCodes.BAD_REQUEST).json({
      ok: false,
      message: "bad-request",
    })
  }

  try {
    const decodedJWT = JWT.decode(authorization)

    if (decodedJWT.type !== "ok") {
      logger.error(
        `Bearer middlware rejected the request because: ${decodedJWT.type}`
      )
      return response.status(httpStatusCodes.UNAUTHORIZED).json({
        ok: false,
        message: `${decodedJWT.type}`,
      })
    }

    const tokenExpiration = JWT.checkExpiration(decodedJWT.session)

    if (tokenExpiration === "expired") {
      return response.status(httpStatusCodes.UNAUTHORIZED).json({
        ok: false,
        message: "The token is expired",
      })
    }

    /**
     * Rewoke session (also checking if the session stored in JWT is still valid)
     */
    const rewoked = await session.rewokeSession(decodedJWT.session.email)

    if (rewoked.type !== "found") {
      return response.status(httpStatusCodes.UNAUTHORIZED).json({
        ok: false,
        message: "Unauthorized! User doesn't exist anymore in our database",
      })
    }

    if (tokenExpiration === "renew") {
      const renewedToken = JWT.encode({
        name: rewoked.partialSession.name,
        email: rewoked.partialSession.email,
        surname: rewoked.partialSession.surname,
        createdAt: rewoked.partialSession.createdAt,
      })

      response.setHeader(RESPONSE_AUTH_HEADER, renewedToken.token)

      response.locals.session = {
        ...rewoked.partialSession,
        expiresAt: renewedToken.expiresAt,
        issuedAt: renewedToken.issuedAt,
      }

      return next()
    }

    response.locals.session = {
      ...rewoked.partialSession,
      expiresAt: decodedJWT.session.expiresAt,
      issuedAt: decodedJWT.session.issuedAt,
    }

    return next()
  } catch (err) {
    return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: "internal-server-error",
    })
  }
}
