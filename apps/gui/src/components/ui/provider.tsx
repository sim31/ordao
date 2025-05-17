"use client"

import { ChakraProvider, ChakraProviderProps, /**defaultSystem*/ } from "@chakra-ui/react"
import { system } from "./theme"
import { Optional } from "utility-types"
// import {
//   ColorModeProvider,
//   type ColorModeProviderProps,
// } from "./color-mode"

export function Provider(props: Optional<ChakraProviderProps, 'value'>) {
  return (
    <ChakraProvider value={system} {...props}>
      {/* <ColorModeProvider {...props} forcedTheme="light"/> */}
    </ChakraProvider>
  )
}
