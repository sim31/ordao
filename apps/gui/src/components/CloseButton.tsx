import { CloseButton as ChakraCloseButton, CloseButtonProps } from "@chakra-ui/react";
import { defaultButtonProps } from "./Button";

export function CloseButton(props: CloseButtonProps) {
  return <ChakraCloseButton {...defaultButtonProps} {...props} />
}
