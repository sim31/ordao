import { Card, Center, Fieldset, Flex, Spacer, Text } from "@chakra-ui/react";
import { IconButton } from "../IconButton";
import { IoMdClose } from "react-icons/io";
import SubmitBreakoutForm from "./SubmitBreakoutForm";
import { SearchParams } from "../../global/submitBreakoutSearchParams";

interface SubmitBreakoutCardProps {
  searchParams: SearchParams;
  setSearchParams: (searchParams: object) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function SubmitBreakoutCard({
  onComplete,
  onCancel,
  searchParams,
  setSearchParams
}: SubmitBreakoutCardProps ) {
  const propTitle = "Submit Breakout room results";
  const description = "Submit results from a breakout room in Respect game";

  return (
    <Center>
      <Card.Root
        variant="outline"
        padding={4}
        gap={2}
        flexDirection="column"
        minWidth="40em"
        boxShadow="sm"
      >
        <Flex gap={2} alignItems="center" mb={2}>
          <Text fontWeight="bold" fontSize="2xl">
            {propTitle}
          </Text>
          <Spacer />
          <IconButton
            onClick={onCancel}
            aria-label="Open menu"
            variant="ghost"
          >
            <IoMdClose />
          </IconButton>
        </Flex>
        <Fieldset.Root>
          <Fieldset.HelperText fontSize="md" maxWidth="42em">{description}</Fieldset.HelperText>
          <SubmitBreakoutForm
            onComplete={onComplete}
            setSearchParams={setSearchParams}
            searchParams={searchParams}
          />
        </Fieldset.Root>
      </Card.Root>
    </Center>
  )
}