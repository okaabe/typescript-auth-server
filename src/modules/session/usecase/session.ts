import prisma from "../../../lib/prisma"
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
  const isEmailTaken = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  })

  if (isEmailTaken) {
    return { type: "email-taken" }
  }

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
}

export const authenticate = async (data: {
  email: string
  password: string
}): Promise<SignInResult> => {
  const isEmailValid = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  })

  if (!isEmailValid) {
    return { type: "invalid-email" }
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    isEmailValid.password
  )

  if (!isPasswordValid) {
    return { type: "wrong-password" }
  }

  const encoded = JWT.encode({
    email: isEmailValid.email,
    createdAt: isEmailValid.createdAt,
    surname: isEmailValid.surname,
    name: isEmailValid.name,
  })

  return {
    type: "ok",
    data: encoded,
  }
}
