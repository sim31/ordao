import { VStack, HStack } from "@chakra-ui/react";
import { Button as OrigButton, ButtonProps } from "../Button";
import { config } from "../../global/config";

function Button(props: ButtonProps) {
  return <OrigButton size={{ base: "sm", md: "xl" }} {...props} />
}

export interface StepFrameProps {
  onBack?: () => void;
  onLogout?: () => void;
  account?: string;
  children: React.ReactNode;
}

function StepFrame({ onBack, onLogout, account, children }: StepFrameProps) {
  const onHelpClick = () => {
    window.open(config.claimSupportUrl, "_blank");
  }

  return (
    <VStack gap="2em">
      <HStack alignSelf="flex-end" wrap={"wrap"}>
        {onBack && <Button onClick={onBack}>Go back</Button>}
        <Button onClick={onHelpClick}>Get help</Button>
        {account && onLogout
          && <Button wordBreak={"break-word"} onClick={onLogout}>{account} (logout)</Button>
        }
      </HStack>
      {children}
    </VStack>
  );
}

export default StepFrame;
