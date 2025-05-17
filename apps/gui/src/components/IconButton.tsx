import { IconButton as ChakraIconButton, IconButtonProps } from '@chakra-ui/react'
import { defaultButtonProps } from './Button'

export function IconButton(props: IconButtonProps) {
  return <ChakraIconButton {...defaultButtonProps} {...props} />
}