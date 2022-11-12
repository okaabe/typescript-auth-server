import { EncodeResult } from "./EncodeResult"

export type SignUpResult =
  | { type: "ok"; token: EncodeResult }
  | { type: "email-taken" }
