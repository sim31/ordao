import { StepsCompleteProps } from './steps';
import { Text } from './Text';
import { Heading, VStack } from '@chakra-ui/react';
import { Link } from '../Link';

export function StepsComplete({ input }: StepsCompleteProps) {
  return (
    <VStack gap="2em">
      <Heading size="2xl" mt="2em">
        Success!
      </Heading>
      <Text>
        Proposal was created to mint your Respect. It is now up to an oracle to pass it. You can see status of your proposal in <Link to={"/proposals/$propId"} target="_blank" params={{ propId: input.mintPropId }}>its proposal page</Link>.
      </Text>
      <Text>
        More details about claiming process mechanism are in the <Link to="/about/intent" target="_blank">about page</Link>.
      </Text>
    </VStack>
  );
}