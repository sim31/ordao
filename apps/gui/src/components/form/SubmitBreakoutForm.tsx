import { 
  Stack,
  Input,
  Button,
  Text,
  Link,
  VStack,
  Spinner,
  Field,
  Icon,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RespectBreakoutRequest, zRespectBreakoutRequest } from "@ordao/ortypes/orclient.js";
import { ORClient } from "@ordao/orclient";
import { fromError } from 'zod-validation-error';
import { hashObject } from "../../utils/objectHash";
import SubmitBreakoutResModal from "./SubmitBreakoutResModal";
import TxProgressModal from "../TxProgressModal";
import { decodeError } from "../../utils/decodeTxError";
import { linkToTx } from "../../utils/blockExplorerLink";
import { FiExternalLink } from "react-icons/fi";
import copy from "copy-to-clipboard";
import { toaster } from "../ui/toaster";
import { SearchParams, isSearchParamsKey } from "../../global/submitBreakoutSearchParams.js";

export type SubmitBreakoutFormProps = {
  orclient: ORClient;
  searchParams: SearchParams;
  setSearchParams: (searchParams: object) => void
  onComplete: () => void;
}

export default function SubmitBreakoutForm({ orclient, onComplete, searchParams, setSearchParams}: SubmitBreakoutFormProps) {
  const [meeting, setMeeting] = useState<string>("");
  const [initialized, setInitialized] = useState<boolean>(false);
  const [errorStr, setErrorStr] = useState<string | undefined>(undefined);
  const [submitOpen, setSubmitOpen] = useState<boolean>(false);
  const [consensusId, setConsensusId] = useState<string>("");
  const [request, setRequest] = useState<RespectBreakoutRequest>();
  const [txProgressOpen, setTxProgressOpen] = useState<boolean>(false);
  const [txProgressStr, setTxProgressStr] = useState("");
  const [txProgressStatus, setTxProgressStatus] = 
    useState<'submitting' | 'submitted' | 'error' | undefined>()
  const [txHash, setTxHash] = useState("");


  useEffect(() => {
    const f = async () => {
      const meetingNum = await orclient.getNextMeetingNum();
      setMeeting(meetingNum.toString());
      setInitialized(true);
    }
    f();
  }, [orclient])

  const closeSubmitModal = () => {
    setSubmitOpen(false);
  }

  const openSubmitModal = async (req: RespectBreakoutRequest) => {
    setRequest(req);
    setConsensusId(await hashObject(searchParams));
    setSubmitOpen(true);
  }

  // This should only be called when tx is finished
  const closeTxProgressModal = () => {
    setTxProgressStr("");
    setTxProgressStatus(undefined);
    setTxProgressOpen(false);
    onComplete();
  }

  const onResSubmit = useCallback(async () => {
    if (request === undefined) {
      throw new Error("Request undefined");
    }
    if (!initialized) {
      throw new Error("orclient not initialized");
    }
    closeSubmitModal();
    setTxProgressStatus('submitting');
    setTxProgressStr("");
    setTxProgressOpen(true);
    try {
      const res = await orclient.proposeBreakoutResult(request);
      // TODO: block explorer link
      setTxProgressStatus('submitted');
      setTxHash(res.txReceipt.hash);
    } catch (err) {
      setTxProgressStr("");
      const decoded = decodeError(err);
      if (decoded) {
        // TODO: more friendly error message, explaining if it is a revert or what
        setTxProgressStr(`Transaction failed. Error type: ${decoded.type}, reason: ${decoded.reason}`)
        setTxProgressStatus('error');
      } else {
        setTxProgressOpen(false);
        throw err;
      }
    }
  }, [request, orclient, initialized])

  const onSubmitClick = async () => {
    const rankings: Array<string> = [];
    for (let i = 1; i <= 6; i++) {
      const key = `vote${i}`;
      if (isSearchParamsKey(key) && typeof searchParams[key] === 'string' && searchParams[key].length > 0) {
        rankings.push(searchParams[key]);
      } else {
        break;
      }
    }
    const request: RespectBreakoutRequest = {
      // Will be validated below
      meetingNum: (meeting as unknown) as number,
      groupNum: (searchParams.groupNumber as unknown) as number,
      rankings
    }

    try {
      const parsed = zRespectBreakoutRequest.parse(request);
      setErrorStr(undefined);
      console.log("Parsed: ", parsed);
      await openSubmitModal(parsed);
    } catch (err) {
      const validationError = fromError(err);
      const errStr = validationError.toString();
      console.log("Error: ", validationError);
      setErrorStr(errStr);
    }
  }

  const explorerLink = useMemo(() => {
    if (typeof txHash === 'string' && txHash.length > 0) {
      return linkToTx(txHash);
    } else {
      return undefined;
    }
  }, [txHash]);

  const fieldsFilled = useMemo(() => {
    return meeting !== "" && searchParams.groupNumber !== undefined
           && searchParams.vote1 !== "" && searchParams.vote2 !== ""
           && searchParams.vote3 !== "";
  }, [meeting, searchParams])

  const copyUrl = useCallback(() => {
    copy(window.location.href);

    toaster.create({
      description: 'Link copied to clipboard!',
      type: 'info',
      closable: true
    })
  }, []);

  console.log("fieldsFilled: ", fieldsFilled);

  return (
    initialized ? (
      <Stack direction="column" gap="1em" width="34em">

        <SubmitBreakoutResModal
          isOpen={submitOpen}
          onClose={closeSubmitModal}
          onSubmit={onResSubmit}
          consensusId={consensusId}
        />

        <TxProgressModal
          isOpen={txProgressOpen}
          operationStr="Voting"
          done={txProgressStatus === 'error' || txProgressStatus === 'submitted'}
          onClose={closeTxProgressModal}
        >
          {txProgressStatus === 'submitting' || txProgressStatus === 'error'
            ? <Text>{txProgressStr}</Text>
            : (
              <VStack>
                <Text fontSize="md">Vote Submitted!</Text>
                <Link fontSize="md" color="teal.500" href={explorerLink} target="_blank">
                  Transaction in Block Explorer
                  <Icon color="black" background="transparent" size="sm" marginLeft="1px">
                    <FiExternalLink />
                  </Icon>
                </Link>
              </VStack>
            )
          }
        </TxProgressModal>

        <Field.Root>
          <Field.Label>Meeting number</Field.Label>
          <Input
            type="number"
            value={meeting}
            onChange={e => setMeeting(e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Group number</Field.Label>
          <Input
            type="number"
            value={searchParams.groupNumber ?? ""}
            onChange={e => setSearchParams({ ...searchParams, groupNumber: e.target.value })}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Level 6</Field.Label>
          <Input
            placeholder="Level 6 account"
            value={searchParams.vote1 ?? ""}
            onChange={e => setSearchParams({ ...searchParams, vote1: e.target.value })}
          />
          <Field.HelperText>Who contributed the most?</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Level 5</Field.Label>
          <Input
            placeholder="Level 5 account"
            value={searchParams.vote2 ?? ""}
            onChange={e => setSearchParams({ ...searchParams, vote2: e.target.value })}
          />
          <Field.HelperText>Who contributed the 2nd most?</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Level 4</Field.Label>
          <Input
            placeholder="Level 4 account"
            value={searchParams.vote3 ?? ""}
            onChange={e => setSearchParams({ ...searchParams, vote3: e.target.value })}
          />
        </Field.Root>
        
        <Field.Root>
          <Field.Label>Level 3</Field.Label>
          <Input
            placeholder="Level 3 account"
            value={searchParams.vote4 ?? ""}
            onChange={e => setSearchParams({ ...searchParams, vote4: e.target.value })}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Level 2</Field.Label>
          <Input
            placeholder="Level 2 account"
            value={searchParams.vote5 ?? ""}
            onChange={e => setSearchParams({ ...searchParams, vote5: e.target.value })}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Level 1</Field.Label>
          <Input
            placeholder="Level 1 account"
            value={searchParams.vote6 ?? ""}
            onChange={e => setSearchParams({ ...searchParams, vote6: e.target.value })}
          />
        </Field.Root>

        <Text color="red">{errorStr ?? ""}</Text>

        <Button onClick={onSubmitClick} color="black" disabled={!fieldsFilled || !initialized}>
          Submit
        </Button>
        <Button onClick={copyUrl} color="black">Share</Button>

      </Stack>
    )
    : <Spinner size="xl"/>
  )
}