import SessionKit, { Session } from "@wharfkit/session"
import { Required } from "utility-types";

export interface State {
  sessionKit?: SessionKit
  session?: Session
  eosAccount?: string;
  balance?: number;
}
export type StepProps = {
  input: State,
  onComplete: (output: State) => void
}

export type EosLoginStepIn = Required<State, 'sessionKit'>;
export type EosLoginStepOut = Required<EosLoginStepIn, 'session'>;
export interface EosLoginStepProps extends StepProps {
  input: EosLoginStepIn,
}

export type ClaimStatusStepIn = EosLoginStepOut;
export type ClaimStatusStepOut = Required<ClaimStatusStepIn, 'eosAccount' | 'balance'>;
export interface ClaimStatusStepProps extends StepProps {
  input: ClaimStatusStepIn,
}

// export type StepComponent = ExoticComponent<StepProps>;

// interface Step<T extends StepComponent> {
//   title: string,
//   component: T,
//   inputValidator: InputValidator<T>
//   render: (input: StateOfComponent<T>, onComplete: (st: State) => void) => JSX.Element
// }
