import React, { ReactElement, useState, useEffect } from "react"
import SigninWrapper from "./SigninWrapper"
import GetFromSpreadsheet from "./GetFromSpreadsheet"

type Argument1<T extends Function> = T extends (a: infer U, ...b: any[]) => any
  ? U
  : never

type Props = {}

export default function Root(props: Props): ReactElement | null {
  return (
    <SigninWrapper>
      <GetFromSpreadsheet></GetFromSpreadsheet>
    </SigninWrapper>
  )
}
