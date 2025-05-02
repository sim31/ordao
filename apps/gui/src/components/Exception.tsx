import { Alert, Text, AlertRootProps, AlertTitle, Card, Center, Flex, VStack } from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";

export interface ExceptionProps {
  title: string;
  status: AlertRootProps['status']
  message?: string
  debugInfo?: string
}

export default function Exception({ status, title, message, debugInfo }: ExceptionProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

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
            <Alert.Root status={status}>
              <CircleAlert />
              <AlertTitle fontSize="lg">{title}</AlertTitle>
            </Alert.Root>
          </Flex>
          <Text whiteSpace="pre-wrap" maxWidth="80vw">{message}</Text>
          {debugInfo &&
            <Text whiteSpace="pre-wrap" backgroundColor="gray.100" maxWidth="80vw" margin="2em" padding="1em" boxShadow="sm">
              {debugInfo}
            </Text>
          }
        </Card.Root>
      </VStack>
    </Center>
    
  );
}