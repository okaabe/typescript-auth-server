import { EncodeResult } from "./EncodeResult"

export type SignInResult =
  | { type: "ok"; data: EncodeResult }
  | { type: "invalid-email" }
  | { type: "wrong-password" }
