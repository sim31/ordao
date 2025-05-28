import ContractKit, { Contract } from "@wharfkit/contract";
import SessionKit, { Session } from "@wharfkit/session"
import { Required } from "utility-types";

export interface InitState {
  sessionKit: SessionKit
  session?: Session
  contractKit: ContractKit
  efContract: Contract
  tsContract: Contract
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
export type ClaimStatusStepOut = Required<ClaimStatusStepIn, 'eosAccount' | 'balance'>;
export interface ClaimStatusStepProps extends StepProps {
  input: ClaimStatusStepIn,
}

export type PropsParser<T extends StepProps> = (props: StepProps | T) => T | undefined

export function isEosLoginIn(st: State): st is EosLoginStepIn {
  return true;
}

export function isClaimStatusIn(st: State): st is ClaimStatusStepIn {
  return isEosLoginIn(st) && st.session !== undefined;
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

export interface Step<T extends StepProps> {
  title: string,
  component: React.ComponentType<T>,
  propsParse: PropsParser<T>
  inputValid: (state: State) => state is T['input']
}


// export type StepComponent = ExoticComponent<StepProps>;

// interface Step<T extends StepComponent> {
//   title: string,
//   component: T,
//   inputValidator: InputValidator<T>
//   render: (input: StateOfComponent<T>, onComplete: (st: State) => void) => JSX.Element
// }
