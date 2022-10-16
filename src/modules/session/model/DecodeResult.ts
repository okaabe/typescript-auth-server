import { Session } from "./Session"

export type DecodeResult =
  | { type: "ok"; decodeResult: Session }
  | { type: "integrity-error" } //the signature/algorithm isnt right
  | { type: "invalid-token" } //token isnt on jwt format
  | { type: "error" } //an error that isnt handled
