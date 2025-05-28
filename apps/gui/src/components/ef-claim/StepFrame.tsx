import { VStack, HStack } from "@chakra-ui/react";
import { Button } from "../Button";

export interface StepFrameProps {
  onBack: () => void;
  onLogout: () => void;
  account?: string;
  children: React.ReactNode;
}

function StepComponent({ onBack, onLogout, account, children }: StepFrameProps) {
  return (
    <VStack gap="2em">
      <HStack alignSelf="flex-end">
        <Button size="xl" onClick={onBack}>Go back</Button>
        {account
          && <Button size="xl" onClick={onLogout}>{account} (logout)</Button>
        }
      </HStack>
      {children}
    </VStack>
  );
}

export default StepComponent;
