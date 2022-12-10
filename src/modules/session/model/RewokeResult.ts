import { PartialSession } from "./PartialSession"

export type RewokeResult =
  | { type: "found"; partialSession: PartialSession }
  | { type: "not-found" }
