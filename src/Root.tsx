import React, { ReactElement, useState, useEffect } from "react"
import LoginUi from "./LoginUi"
import GetFromSpreadsheet from "./GetFromSpreadsheet"
import { AuthProvider } from "./auth"

type Argument1<T extends Function> = T extends (a: infer U, ...b: any[]) => any
  ? U
  : never

type Props = {}

export default function Root(props: Props): ReactElement | null {
  return (
    <AuthProvider unauthenticatedView={<LoginUi></LoginUi>}>
      <GetFromSpreadsheet></GetFromSpreadsheet>
    </AuthProvider>
  )
}
