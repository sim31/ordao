import { Center, Spinner } from "@chakra-ui/react"

export function Loading() {
  return (
    <Center>
      <Spinner size="xl" color="blue.solid" />
    </Center>
  );
}