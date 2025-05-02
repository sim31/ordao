import { Button, Card, Center, Checkbox, Fieldset, Flex, HStack, IconButton, Spacer, Text } from "@chakra-ui/react";
import { DefaultValues } from 'react-hook-form';
import { TypeOf, z } from "zod";
import ZodForm from "./ZodForm";
import { extractZodDescription } from "@ordao/zod-utils";
import { useState } from "react";
import { ObjectTable } from "../proposal-view/ObjectTable";
import { IoMdClose } from "react-icons/io";

interface ProposalFormProps<T extends z.AnyZodObject> {
  schema: T
  onSubmit: (data: z.infer<T>) => void;
  onCancel: () => void;
}

export function ProposalForm<T extends z.AnyZodObject>({ schema, onSubmit, onCancel }: ProposalFormProps<T>) {
  const desc = extractZodDescription(schema);
  const propTitle = desc?.title;
  const description = desc?.description;
  const [propRequest, setPropRequest] = useState<z.infer<T> | undefined>(undefined);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [withVote, setWithVote] = useState<boolean>(true);

  const handleZodFormSubmit = (data: z.infer<T>) => {
    setPropRequest(data);
    setStep('confirm');
  }

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
            color="black"
          >
            <IoMdClose />
          </IconButton>
        </Flex>
        {step === 'confirm' && propRequest
          ? (
            <>
              <Fieldset.Root>
                <Fieldset.HelperText fontSize="md" maxWidth="42em">{description}</Fieldset.HelperText>
                <Fieldset.Content borderTop="solid" borderColor="gray.200" pt="1em">
                  <ObjectTable obj={propRequest} />
                  <Checkbox.Root mt="1em" checked={withVote} onCheckedChange={(e) => setWithVote(!!e.checked)}>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Submit with a YES vote on this proposal</Checkbox.Label>
                  </Checkbox.Root>
                </Fieldset.Content>
              </Fieldset.Root>
              <HStack>
                <Button color="black" mt="2em" as="button" onClick={() => onSubmit(propRequest)}>Submit</Button>
                <Button color="black" mt="2em" as="button" onClick={() => setStep('edit')}>Edit</Button>
              </HStack>
            </>
          )
          : (
            <ZodForm<T>
              schema={schema}
              onSubmit={handleZodFormSubmit}
              submitButtonText="Next"
              defaultValues={propRequest as DefaultValues<TypeOf<T>>}
            />
          )
        }
      </Card.Root>
    </Center>
  )
}