import { createFileRoute } from '@tanstack/react-router'
import { sessionKit } from '../../global/wharfSessionKit'
import React, { useEffect, useState } from 'react';
import { Steps } from '@chakra-ui/react';
import { State, StepProps, EosLoginStepProps, ClaimStatusStepProps, EosLoginStepIn, ClaimStatusStepIn } from '../../components/ef-claim/steps';
import { EosLoginStep } from '../../components/ef-claim/EosLoginStep';
import { ClaimStatusStep } from '../../components/ef-claim/ClaimStatusStep';

export const Route = createFileRoute('/_app/ef/claim')({
  component: RouteComponent,
  loader: async () => {
    const session = await sessionKit.restore();
    console.log("restored session: ", session);
    return { session, sessionKit };
  }
})

type PropsParser<T extends StepProps> = (props: StepProps | T) => T | undefined

function isEosLoginIn(st: State): st is EosLoginStepIn {
  return st.sessionKit !== undefined;
}

function isClaimStatusIn(st: State): st is ClaimStatusStepIn {
  return isEosLoginIn(st) && st.session !== undefined;
}

const eosLoginParse: PropsParser<EosLoginStepProps> = (props: StepProps): EosLoginStepProps | undefined => {
  if (isEosLoginIn(props.input)) {
    return props as EosLoginStepProps;
  } else {
    return undefined;
  }
}
const claimStatusParse: PropsParser<ClaimStatusStepProps> = (props): ClaimStatusStepProps | undefined => {
  if (isClaimStatusIn(props.input)) {
    return props as ClaimStatusStepProps;
  } else {
    return undefined;
  }
}

interface Step<T extends StepProps> {
  title: string,
  component: React.ComponentType<T>,
  propsParse: PropsParser<T>
  inputValid: (state: State) => state is T['input']
}

const loginStep: Step<EosLoginStepProps> = {
  title: "Login",
  component: EosLoginStep,
  propsParse: eosLoginParse,
  inputValid: isEosLoginIn
}
const claimStatusStep: Step<ClaimStatusStepProps> = {
  title: "Claim status",
  component: ClaimStatusStep,
  propsParse: claimStatusParse,
  inputValid: isClaimStatusIn
}

type StepType = Step<EosLoginStepProps> | Step<ClaimStatusStepProps>

const steps: Array<StepType> = [
  loginStep,
  claimStatusStep
] as const;

function RouteComponent() {
  const { session, sessionKit } = Route.useLoaderData();

  console.log("ses: ", session);

  const [step, setStep] = useState(0)
  const [state, setState] = useState<State>({ sessionKit, session });

  const onStepComplete = (fromIndex: number, newState: State) => {
    if (fromIndex === step) {
      const nextStepNum = step + 1;
      setStep(nextStepNum);
      setState(newState);
    }
  };

  // Go back if the input for the current step is invalid
  useEffect(() => {
    const currentStep = steps[step];
    if (currentStep && !currentStep.inputValid(state)) {
      setStep(step - 1);
    }
  }, [state, step, setStep]);

  useEffect(() => {
    if (session) {
      setState({ sessionKit, session });
    }
  }, [session, sessionKit, setState])

  const renderStep = <T extends StepProps>(step: Step<T>, onComplete: (st: State) => void) => {
    const props = step.propsParse({ input: state, onComplete });
    if (props !== undefined) {
      return (
        <step.component {...props}/>
      )
    }
  }

  return (
    <Steps.Root
      step={step}
      onStepChange={(e) => setStep(e.step)}
      count={steps.length}
    >
      <Steps.List>
        {steps.map((step, index) => (
          <Steps.Item key={index} index={index} title={step.title}>
            <Steps.Indicator />
            <Steps.Title>{step.title}</Steps.Title>
            <Steps.Separator />
          </Steps.Item>
        ))}
      </Steps.List>

      <Steps.Content index={0}>
        {renderStep(loginStep, (st: State) => onStepComplete(0, st))}
      </Steps.Content>

      <Steps.Content index={1}>
        {renderStep(claimStatusStep, (state: State) => onStepComplete(1, state))}
      </Steps.Content>

      <Steps.CompletedContent>All steps are complete!</Steps.CompletedContent>

    </Steps.Root>
  )
}

