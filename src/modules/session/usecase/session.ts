import prisma, {
  PrismaKnownRequestErrorCode,
  isPrismaClientKnownRequestError,
} from "../../../lib/prisma"

import * as bcrypt from "bcrypt"
import * as JWT from "./jwt"

import { User } from "../model/User"
import { SignUpResult } from "../model/SignUpResult"
import { SignInResult } from "../model/SignInResult"

/**
 *  password wont be stored uncrypted
 *  check if the email is rlly unique
 */

export const create = async (
  data: Omit<User, "createdAt" | "updatedAt" | "id">
): Promise<SignUpResult> => {
  try {
    const encryptedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: encryptedPassword,
      },
    })

    const token = JWT.encode({
      email: user.email,
      name: user.name,
      surname: user.surname,
      createdAt: user.createdAt,
    })

    return {
      type: "ok",
      token,
    }
  } catch (err: any) {
    if (
      isPrismaClientKnownRequestError(err) &&
      err.code === PrismaKnownRequestErrorCode.UniqueConstraintFailed &&
      err.meta.target.includes("email")
    ) {
      return { type: "email-taken" }
    }

    throw err
  }
}

export const authenticate = async (data: {
  email: string
  password: string
}): Promise<SignInResult> => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  })

  if (!user) {
    return { type: "invalid-email" }
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password)

  if (!isPasswordValid) {
    return { type: "wrong-password" }
  }

  const encoded = JWT.encode({
    email: user.email,
    createdAt: user.createdAt,
    surname: user.surname,
    name: user.name,
  })

  return {
    type: "ok",
    data: encoded,
  }
}
