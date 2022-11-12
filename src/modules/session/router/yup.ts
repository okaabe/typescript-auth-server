import * as yup from "yup"

export const SignInRequestYupObject = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
})

export const SignUpRequestYupObject = yup.object().shape({
  name: yup.string().required(),
  surname: yup.string().default(""),
  email: yup.string().email().required(),
  password: yup.string().required(),
})
