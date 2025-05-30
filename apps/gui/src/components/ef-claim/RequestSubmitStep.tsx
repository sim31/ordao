import { Text } from './Text';
import StepFrame from './StepFrame';
import { Code } from '@chakra-ui/react';
import { RequestSubmitStepProps } from './steps';
import { Button } from '../Button';
import { Serializer } from '@wharfkit/session';
import { stringify } from '@ordao/ts-utils';
import { Link } from "@chakra-ui/react"

const RequestSubmitStep = ({
  input,
  onComplete,
  onBack,
}: RequestSubmitStepProps) => {
  const onSubmitClick = async () => {
    const str = `I, ${input.eosAccount}, request my EDEN Respect at ${input.ethAddress}`;
    const action = await input.tsContract.action('timestamp', { str: str });
    const res = await input.session.transact({ action });
    if (res.resolved) {
      onComplete({
        ...input,
        requestTxId: Serializer.objectify(res.resolved.transaction.id)
      });
    } else {
      throw new Error("Unable to resolve transaction. TransactResult: " + stringify(res));
    }
  };

  const onBackClick = () => {
    onBack({
      ...input,
      requestTxId: undefined,
    });
  }

  const onLogoutClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input, session: undefined, requestTxId: undefined });
  }

  return (
    <StepFrame onBack={onBackClick} onLogout={onLogoutClick} account={input.eosAccount}>
      <Text wordBreak={"break-word"}>
        {`Sign a request to receive your Respect on Base. We need to submit this request to EOS blockchain.`}
      </Text>
      <Text wordBreak={"break-word"}>
        {"If you get an error like: "}
      </Text>
      <Code>
        Error: billed CPU time (_ us) is greater than the maximum billable CPU time for the transaction (_ us) reached account cpu limit _us
      </Code>
      <Text>
        Then use <Link href="https://eospowerup.io/" target="_blank">EOS PowerUp service</Link> to claim your free power up and then try again.
      </Text>
      <Button size="xl" onClick={onSubmitClick}>
        Submit request
      </Button>
    </StepFrame>
  );
};

export default RequestSubmitStep;