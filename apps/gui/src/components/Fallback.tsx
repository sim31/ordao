import {
  Alert,
  AlertTitle,
  Card,
  Center,
  Flex,
  Text,
  VStack
} from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";
import { useMemo } from "react";
import { useRouteError } from "react-router-dom";
import { stringify } from "@ordao/ts-utils";

export default function Fallback() {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  const error = useRouteError();
  const [name, message] = useMemo(() => {
    if (typeof error === 'object' && error !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return [(error as any).name, (error as any).message]
    }
    return [undefined, undefined];
  }, [error])

  console.log("In Fallback");

  return (
    <Center width="100%">
      <VStack>
        <Card.Root
          variant="outline"
          padding={4}
          gap={2}
          flexDirection="column"
          minWidth="40em"
          boxShadow="sm"
        >
          <Flex gap={2} alignItems="center" mb={2}>
            <Alert.Root status='error'>
              <CircleAlert />
              <AlertTitle fontSize="lg">{`Unhandled Error ${name ?? ""}`}</AlertTitle>
            </Alert.Root>
          </Flex>
          <Text whiteSpace="pre-wrap" backgroundColor="gray.100" maxWidth="80vw" margin="2em" padding="1em" boxShadow="sm">
            {`Message: ${message}

              Full object: ${stringify(error)}
            `}
          </Text>
        </Card.Root>
      </VStack>
    </Center>
    
  );
}