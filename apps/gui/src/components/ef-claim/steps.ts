import { ORClient, ORClientType } from "@ordao/orclient";
import { EthAddress, PropId } from "@ordao/ortypes";
import ContractKit, { Contract } from "@wharfkit/contract";
import SessionKit, { Session } from "@wharfkit/session"
import { Required } from "utility-types";


export interface InitState {
  sessionKit: SessionKit
  session?: Session
  contractKit: ContractKit
  efContract: Contract
  tsContract: Contract
  orclient: ORClientType
}

export interface State extends InitState, Partial<RequestSubmission> {
  balance?: number;
  clickedClaim?: true;
  mintPropId?: PropId;
  fullOrclient?: ORClient
}

export type StepProps = {
  input: State,
  onComplete: (output: State) => void
  onBack: (newState: State) => void
}

export type EosLoginStepIn = State;
export type EosLoginStepOut = Required<EosLoginStepIn, 'session'>;
export interface EosLoginStepProps extends StepProps {
  input: EosLoginStepIn,
}

export type ClaimStatusStepIn = EosLoginStepOut;
export type ClaimStatusStepOut = Required<ClaimStatusStepIn, 'eosAccount' | 'balance' | 'clickedClaim'>;
export interface ClaimStatusStepProps extends StepProps {
  input: ClaimStatusStepIn,
}

export type EthLoginStepIn = ClaimStatusStepOut;
export type EthLoginStepOut = Required<EthLoginStepIn, 'ethAddress' | 'fullOrclient'>;
export interface EthLoginStepProps extends StepProps {
  input: EthLoginStepIn
}

export type RequestSubmitStepIn = EthLoginStepOut;
export type RequestSubmitStepOut = Required<RequestSubmitStepIn, 'requestTxId'>;
export interface RequestSubmitStepProps extends StepProps {
  input: RequestSubmitStepIn
}

export type MintPropStepIn = RequestSubmitStepOut;
export type MintPropStepOut = Required<MintPropStepIn, 'mintPropId'>;
export interface MintPropStepProps extends StepProps {
  input: MintPropStepIn
}

export type StepsCompleteState = MintPropStepOut;
export interface StepsCompleteProps {
  input: StepsCompleteState
}

export type PropsParser<T extends StepProps> = (props: StepProps | T) => T | undefined

export function isEosLoginIn(st: State): st is EosLoginStepIn {
  return true;
}

export function isClaimStatusIn(st: State): st is ClaimStatusStepIn {
  return isEosLoginIn(st) && st.session !== undefined;
}

export function isEthLoginIn(st: State): st is EthLoginStepIn {
  return isClaimStatusIn(st) && st.eosAccount !== undefined && st.balance !== undefined && st.clickedClaim !== undefined;
}

export function isRequestSubmitIn(st: State): st is RequestSubmitStepIn {
  return isEthLoginIn(st) && st.ethAddress !== undefined && st.fullOrclient !== undefined;
}

export function isMintPropIn(st: State): st is MintPropStepIn {
  return isRequestSubmitIn(st) && st.requestTxId !== undefined;
}

export function isStepsCompleteState(st: State): st is StepsCompleteState {
  return isMintPropIn(st) && st.mintPropId !== undefined;
}

export const eosLoginParse: PropsParser<EosLoginStepProps> = (props: StepProps): EosLoginStepProps | undefined => {
  if (isEosLoginIn(props.input)) {
    return props as EosLoginStepProps;
  } else {
    return undefined;
  }
}
export const claimStatusParse: PropsParser<ClaimStatusStepProps> = (props): ClaimStatusStepProps | undefined => {
  if (isClaimStatusIn(props.input)) {
    return props as ClaimStatusStepProps;
  } else {
    return undefined;
  }
}

export const ethLoginParse: PropsParser<EthLoginStepProps> = (props): EthLoginStepProps | undefined => {
  if (isEthLoginIn(props.input)) {
    return props as EthLoginStepProps;
  } else {
    return undefined;
  }
}

export const requestSubmitParse: PropsParser<RequestSubmitStepProps> = (props): RequestSubmitStepProps | undefined => {
  if (isRequestSubmitIn(props.input)) {
    return props as RequestSubmitStepProps;
  } else {
    return undefined;
  }
}

export const mintPropParse: PropsParser<MintPropStepProps> = (props): MintPropStepProps | undefined => {
  if (isMintPropIn(props.input)) {
    return props as MintPropStepProps;
  } else {
    return undefined;
  }
}

export interface Step<T extends StepProps> {
  title: string,
  component: React.ComponentType<T>,
  propsParse: PropsParser<T>
  inputValid: (state: State) => state is T['input']
}

export interface RequestSubmission {
  requestTxId: string
  eosAccount: string,
  ethAddress: EthAddress
}

export function saveRequestSubmission(submission: RequestSubmission) {
  localStorage.setItem('requestSubmission', JSON.stringify(submission));
}

export function loadRequestSubmission(): RequestSubmission | undefined {
  const json = localStorage.getItem('requestSubmission');
  if (json) {
    return JSON.parse(json);
  } else {
    return undefined;
  }
}

export function submissionMatchesState(
  state: State,
  submission: RequestSubmission
): boolean {
  return submission.eosAccount === state.eosAccount && submission.ethAddress === state.ethAddress && submission.requestTxId !== undefined;
}

/**
 * @returns tx id of submission
 */
export function getExistingSubmissionId(state: State): string | undefined {
  const submission = loadRequestSubmission();
  if (submission && submissionMatchesState(state, submission)) {
    return submission.requestTxId;
  }
}
