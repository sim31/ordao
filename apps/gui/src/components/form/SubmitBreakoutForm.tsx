import {
  Button,
  Field,
  Input,
  Spinner,
  Stack,
  Text
} from "@chakra-ui/react";
import { ProposeRes } from "@ordao/orclient";
import { RespectBreakoutRequest, zRespectBreakoutRequest } from "@ordao/ortypes/orclient.js";
import copy from "copy-to-clipboard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fromError } from 'zod-validation-error';
import { SearchParams, isSearchParamsKey } from "../../global/submitBreakoutSearchParams.js";
import { hashObject } from "../../utils/objectHash";
import OnchainActionModal from "../OnchainActionModal.js";
import { toaster } from "../ui/toaster";
import SubmitBreakoutResModal from "./SubmitBreakoutResModal";
import { useAssertFullOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";

export type SubmitBreakoutFormProps = {
  searchParams: SearchParams;
  setSearchParams: (searchParams: object) => void
  onComplete: () => void;
}

export default function SubmitBreakoutForm({ onComplete, searchParams, setSearchParams}: SubmitBreakoutFormProps) {
  const orclient = useAssertFullOrclient();

  const [meeting, setMeeting] = useState<string>("");
  const [initialized, setInitialized] = useState<boolean>(false);
  const [errorStr, setErrorStr] = useState<string | undefined>(undefined);
  const [submitOpen, setSubmitOpen] = useState<boolean>(false);
  const [consensusId, setConsensusId] = useState<string>("");
  const [request, setRequest] = useState<RespectBreakoutRequest>();
  const [txPromise, setTxPromise] = useState<Promise<ProposeRes> | undefined>(undefined);

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
  const closeTxProgressModal = (success: boolean) => {
    setTxPromise(undefined);
    if (success) {
      onComplete();
    }
  }

  const onResSubmit = useCallback(async () => {
    if (request === undefined) {
      throw new Error("Request undefined");
    }
    if (!initialized) {
      throw new Error("orclient not initialized");
    }
    closeSubmitModal();
    setTxPromise(orclient.proposeBreakoutResult(request));
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

        <OnchainActionModal
          action={txPromise}
          title="Submitting Breakout Results"
          onClose={closeTxProgressModal}
        />

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