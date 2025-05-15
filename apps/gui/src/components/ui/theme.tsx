import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    "a": {
      // color: "black"
    }
  }
})

export const system = createSystem(defaultConfig, config)