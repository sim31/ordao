"use client"

import { ChakraProvider, ChakraProviderProps, /**defaultSystem*/ } from "@chakra-ui/react"
import { system } from "./theme"
// import {
//   ColorModeProvider,
//   type ColorModeProviderProps,
// } from "./color-mode"

export function Provider(props: ChakraProviderProps) {
  return (
    <ChakraProvider {...props} value={system}>
      {/* <ColorModeProvider {...props} forcedTheme="light"/> */}
    </ChakraProvider>
  )
}
