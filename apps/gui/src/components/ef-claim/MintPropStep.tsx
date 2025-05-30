import StepFrame from './StepFrame';
import { Text } from './Text';
import { Button } from '../Button';
import { ProposeRes, RespectAccountRequest } from '@ordao/orclient';
import { config } from '../../global/config';
import Fallback from '../Fallback';
import { useState } from 'react';
import { MintPropStepProps } from './steps';
import { Link } from '@chakra-ui/react';
import OnchainActionModal from '../OnchainActionModal';
import { zMigrationMintType } from '@ordao/ortypes/respect1155.js';

export default function MintPropStep({ input, onComplete, onBack }: MintPropStepProps) {
  // Have to handle 
  const [error, setError] = useState<unknown | undefined>(undefined);
  const orclient = input.fullOrclient;
  const requestUrl = `${config.eosExplorerTxPrefix}${input.requestTxId}`;

  const [txPromise, setTxPromise] = useState<Promise<ProposeRes> | undefined>(undefined);

  const handleSubmit = async () => {
    try {
      const req: RespectAccountRequest = {
        mintType: zMigrationMintType.value,
        account: input.ethAddress,
        value: BigInt(input.balance),
        title: input.eosAccount,
        reason: requestUrl
      }
      const res = orclient.proposeRespectTo(req);
      setTxPromise(res);
    } catch (error) {
      setError(error);
    }
  };

  const onBackClick = () => {
    onBack({
      ...input,
      mintPropId: undefined,
      // We need to skip previous step when going back,
      // otherwise we would get stuck here, because previous step
      // goes forward in case eos request is already submitted
      ethAddress: undefined,
    });
  }

  const onLogoutClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input,
      session: undefined,
      mintPropId: undefined,
      ethAddress: undefined
    });
  }

  const onTxModalClose = async (success: boolean) => {
    setTxPromise(undefined);
    if (success) {
      if (txPromise === undefined) {
        throw new Error("OnchainActionModal closed with success but no txPromise");
      } else {
        const res = await txPromise;
        onComplete({ ...input, mintPropId: res.proposal.id });
      }
    }
  }

  return (
    <StepFrame onBack={onBackClick} onLogout={onLogoutClick} account={input.eosAccount}>
      <Text wordBreak={"break-word"}>
        Now we need to submit this request to Base blockchain, initiating a proposal to mint your Respect. Click the button below to submit.
      </Text>
      <Text wordBreak={"break-word"}>
        If it doesn't work or you don't have ETH to pay for transaction, ask for help in{' '}
        <Link href={config.claimSupportUrl} target="_blank">
          telegram
        </Link>
        , sharing this link (this is your proof of claim):
      </Text>

      <Link href={requestUrl} wordBreak={"break-word"} target="_blank">{requestUrl}</Link>

      <OnchainActionModal action={txPromise} onClose={onTxModalClose} title="Submitting transaction" />

      <Button onClick={handleSubmit}>Submit</Button>
      {error !== undefined && <Fallback error={error} />}
    </StepFrame>
  );
}