import { Router } from "express"

import * as session from "../usecase/session"
import * as SessionSchemas from "./yup"
import httpCodes from "../../../lib/codes"
import { ValidationError } from "yup"
import { logger } from "../../../logger"
import { inspect } from "util"

const router = Router()

router.post("/signin", async (req, res) => {
  try {
    const body = await SessionSchemas.SignInRequestYupObject.validate(req.body)

    const user = await session.authenticate(body)

    if (user.type !== "ok") {
      return res.status(httpCodes.UNAUTHORIZED).json({
        ok: false,
        message: "wrong-credentials",
      })
    }

    res.status(httpCodes.OK).json({
      ok: true,
      message: "ok",
      data: user,
    })
  } catch (err: any) {
    if (err instanceof ValidationError) {
      return res.status(httpCodes.BAD_REQUEST).json({
        ok: false,
        message: "bad-request",
      })
    }

    throw err
  }
})

router.post("/signup", async (req, res) => {
  try {
    const isBodyValid = await SessionSchemas.SignUpRequestYupObject.validate(
      req.body
    )

    const created = await session.create(isBodyValid)

    if (created.type === "email-taken") {
      return res.status(httpCodes.CONFLICT).json({
        ok: false,
        message: "conflict",
      })
    }

    return res.status(httpCodes.CREATED).json({
      ok: true,
      message: "created",
      data: created,
    })
  } catch (err) {
    logger.error(inspect(err))
    if (err instanceof ValidationError) {
      return res.status(httpCodes.BAD_REQUEST).json({
        ok: false,
        message: "bad-request",
      })
    }

    throw err
  }
})

export default router
