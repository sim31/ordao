import { Card, Center, Checkbox, Fieldset, Flex, HStack, Spacer, Text } from "@chakra-ui/react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { DefaultValues } from 'react-hook-form';
import { TypeOf, z } from "zod";
import ZodForm from "./ZodForm";
import { extractZodDescription } from "@ordao/zod-utils";
import { useState } from "react";
import { ObjectTable } from "../proposal-view/ObjectTable";
import { IoMdClose } from "react-icons/io";
import OnchainActionModal from "../OnchainActionModal";
import { ProposeRes, VoteWithPropRequest } from "@ordao/orclient";
import { PropType } from "@ordao/ortypes";
import { assertUnreachable } from "@ordao/ts-utils";
import { useAssertFullOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";

interface ProposalZodCardProps<T extends z.AnyZodObject> {
  schema: T
  onComplete: () => void;
  onCancel: () => void;
  propType: PropType;
}

export function ProposalZodCard<T extends z.AnyZodObject>({ schema, onComplete, onCancel, propType }: ProposalZodCardProps<T>) {
  const orclient = useAssertFullOrclient();

  const desc = extractZodDescription(schema);
  const propTitle = desc?.title;
  const description = desc?.description;
  const [propRequest, setPropRequest] = useState<z.infer<T> | undefined>(undefined);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [withVote, setWithVote] = useState<boolean>(true);

  const [actionPromise, setActionPromise] = useState<Promise<ProposeRes> | undefined>(undefined);

  const handleZodFormSubmit = (data: z.infer<T>) => {
    setPropRequest(data);
    setStep('confirm');
  }

  const vote: VoteWithPropRequest = withVote ? { vote: 'Yes' } : { vote: 'None' }

  const handleConfirmSubmit = () => {
    if (propRequest === undefined) {
      return;
    }
    switch (propType) {
      case 'tick':
        setActionPromise(orclient.proposeTick(propRequest, vote));
        break;
      case 'respectAccount':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActionPromise(orclient.proposeRespectTo(propRequest as any, vote));
        break;
      case 'respectBreakout':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActionPromise(orclient.proposeBreakoutResult(propRequest as any, vote));
        break;
      case 'burnRespect':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActionPromise(orclient.proposeBurnRespect(propRequest as any, vote));
        break;
      case 'customCall':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActionPromise(orclient.proposeCustomCall(propRequest as any, vote));
        break;
      case 'customSignal':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActionPromise(orclient.proposeCustomSignal(propRequest as any, vote));
        break;
      default:
        assertUnreachable(propType);
        break;
    }
  }

  return (
    <Center>
      <OnchainActionModal
        title={"Creating a proposal"}
        onClose={() => { setActionPromise(undefined); onComplete() } }
        action={actionPromise}
      />
      <Card.Root
        mt="2em"
        variant="outline"
        padding={4}
        gap={2}
        flexDirection="column"
        width={{ base: "sm", md: "40em"}}
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
                <Button mt="2em" as="button" onClick={handleConfirmSubmit}>Submit</Button>
                <Button mt="2em" as="button" onClick={() => setStep('edit')}>Edit</Button>
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