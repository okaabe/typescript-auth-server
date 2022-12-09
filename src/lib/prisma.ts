import { PrismaClient } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { logger } from "../logger"

const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }, "info", "warn", "error"],
})
prisma.$on("query", (e: any) => {
  logger.debug("Query: " + e.query)
  logger.debug("Params: " + e.params)
  logger.debug("Duration: " + e.duration + "ms")
})

export enum PrismaKnownRequestErrorCode {
  UniqueConstraintFailed = "P2002",
  RecordDoesNotExist = "P2001",
}

export const isPrismaClientKnownRequestError = (err: any) =>
  err instanceof PrismaClientKnownRequestError

export default prisma
