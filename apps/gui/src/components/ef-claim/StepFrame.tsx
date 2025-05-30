import { VStack, HStack } from "@chakra-ui/react";
import { Button } from "../Button";

export interface StepFrameProps {
  onBack: () => void;
  onLogout: () => void;
  account?: string;
  children: React.ReactNode;
}

function StepFrame({ onBack, onLogout, account, children }: StepFrameProps) {
  return (
    <VStack gap="2em">
      <HStack alignSelf="flex-end" wrap={"wrap"}>
        <Button size={{ base: "sm", md: "xl" }} onClick={onBack}>Go back</Button>
        {account
          && <Button wordBreak={"break-word"} size={{ base: "sm", md: "xl" }} onClick={onLogout}>{account} (logout)</Button>
        }
      </HStack>
      {children}
    </VStack>
  );
}

export default StepFrame;
