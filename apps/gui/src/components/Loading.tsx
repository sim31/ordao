import { Center, Spinner } from "@chakra-ui/react"

export function Loading() {
  return (
    <Center>
      <Spinner margin="1em" size="xl" color="black" backgroundColor="transparent" />
    </Center>
  );
}