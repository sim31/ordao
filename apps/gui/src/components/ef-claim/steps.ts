import { ORClientType } from "@ordao/orclient";
import { EthAddress } from "@ordao/ortypes";
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
  clickedClaim?: true
  requestTxId?: string
  ethAddress?: EthAddress
}

export interface State extends InitState {
  eosAccount?: string;
  balance?: number;
}
export type StepProps = {
  input: State,
  onComplete: (output: State) => void
  onBack: (newState: State) => void
}

export type EosLoginStepIn = Required<State>;
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
export type EthLoginStepOut = Required<EthLoginStepIn, 'ethAddress'>;
export interface EthLoginStepProps extends StepProps {
  input: EthLoginStepIn
}

export type RequestSubmitStepIn = EthLoginStepOut;
export type RequestSubmitStepOut = Required<RequestSubmitStepIn, 'requestTxId'>;
export interface RequestSubmitStepProps extends StepProps {
  input: RequestSubmitStepIn
}

export type PropsParser<T extends StepProps> = (props: StepProps | T) => T | undefined

export function isEosLoginIn(st: State): st is EosLoginStepIn {
  return true;
}

export function isClaimStatusIn(st: State): st is ClaimStatusStepIn {
  return isEosLoginIn(st) && st.session !== undefined;
}

export function isEthLoginIn(st: State): st is EthLoginStepIn {
  return isClaimStatusIn(st) && st.eosAccount !== undefined && st.balance !== undefined && st.clickedClaim;
}

export function isRequestSubmitIn(st: State): st is RequestSubmitStepIn {
  return isEthLoginIn(st) && st.ethAddress !== undefined;
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

export const requestSubmitParse: PropsParser<RequestSubmitStepProps> = (props): RequestSubmitStepProps | undefined => {
  if (isRequestSubmitIn(props.input)) {
    return props as RequestSubmitStepProps;
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

export interface Step<T extends StepProps> {
  title: string,
  component: React.ComponentType<T>,
  propsParse: PropsParser<T>
  inputValid: (state: State) => state is T['input']
}

