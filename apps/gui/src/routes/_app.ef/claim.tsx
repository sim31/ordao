import { createFileRoute } from '@tanstack/react-router'
import { sessionKit } from '../../global/wharfSessionKit'
import { useEffect, useState } from 'react';
import { Steps } from '@chakra-ui/react';
import { State, StepProps, EosLoginStepProps, ClaimStatusStepProps, Step, eosLoginParse, isEosLoginIn, claimStatusParse, isClaimStatusIn, InitState, EthLoginStepProps, isEthLoginIn, ethLoginParse, requestSubmitParse, isRequestSubmitIn, RequestSubmitStepProps } from '../../components/ef-claim/steps';
import { EosLoginStep } from '../../components/ef-claim/EosLoginStep';
import { ClaimStatusStep } from '../../components/ef-claim/ClaimStatusStep';
import ContractKit from '@wharfkit/contract';
import { APIClient } from '@wharfkit/session';
import { config } from '../../global/config';
import { assertOrclientBeforeLoad } from '../../global/routerContext';
import { EthLoginStep } from '../../components/ef-claim/EthLoginStep';
import RequestSubmitStep from '../../components/ef-claim/RequestSubmitStep';

export const Route = createFileRoute('/_app/ef/claim')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context }) => {
    const session = await sessionKit.restore();
    console.log("restored session: ", session);

    const contractKit = new ContractKit({
      client: new APIClient({ url: "https://eos.greymass.com" }),
    })
    console.log("Loading contract: ", config.efContract);
    const efContract = await contractKit.load(config.efContract);
    console.log("Loaded: ", efContract);
    console.log("Loading contract: ", config.tsContract);
    const tsContract = await contractKit.load(config.tsContract);
    console.log("Loaded: ", tsContract);

    const r: InitState = {
      sessionKit,
      session,
      contractKit,
      efContract,
      tsContract,
      orclient: context.orclient
    };
    return r;
  }
})

const loginStep: Step<EosLoginStepProps> = {
  title: "Login",
  component: EosLoginStep,
  propsParse: eosLoginParse,
  inputValid: isEosLoginIn
}
const claimStatusStep: Step<ClaimStatusStepProps> = {
  title: "Status",
  component: ClaimStatusStep,
  propsParse: claimStatusParse,
  inputValid: isClaimStatusIn
}

const ethLoginStep: Step<EthLoginStepProps> = {
  title: "EVM account",
  component: EthLoginStep,
  propsParse: ethLoginParse,
  inputValid: isEthLoginIn
}

const requestSubmitStep: Step<RequestSubmitStepProps> = {
  title: "Request submit",
  component: RequestSubmitStep,
  propsParse: requestSubmitParse,
  inputValid: isRequestSubmitIn
}

type StepType = Step<EosLoginStepProps> | Step<ClaimStatusStepProps> | Step<EthLoginStepProps> | Step<RequestSubmitStepProps>;

const steps: Array<StepType> = [
  loginStep,
  claimStatusStep,
  ethLoginStep,
  requestSubmitStep
] as const;

function RouteComponent() {
  const initState: InitState = Route.useLoaderData();

  console.log("initState: ", initState);

  const [step, setStep] = useState(0)
  const [state, setState] = useState<State>(initState);

  const onStepComplete = (fromIndex: number, newState: State) => {
    if (fromIndex === step) {
      console.log("Completing step: ", step, "with state: ", newState);
      const nextStepNum = step + 1;
      setStep(nextStepNum);
      setState(newState);
    }
  };

  const onStepBack = (fromIndex: number, newState: State) => {
    if (fromIndex === step) {
      if (step === 0) {
        throw new Error("Cannot go back from step 1");
      }

      const prevStepNum = step - 1;
      setStep(prevStepNum);
      setState(newState);
    }

  }

  // Go back if the input for the current step is invalid
  useEffect(() => {
    const currentStep = steps[step];
    if (currentStep && !currentStep.inputValid(state)) {
      if (step > 0) {
        setStep(step - 1);
      } else {
        console.log("invalid input for step 1: ", state)
      }
    }
  }, [state, step, setStep]);

  useEffect(() => {
    console.log("Resetting state because initState changed");
    setState(s => { return { ...s, initState } });
  }, [initState])

  const renderStep = <T extends StepProps>(step: Step<T>, index: number) => {
    const onComplete = (state: State) => onStepComplete(index, state);
    const onBack = (state: State) => onStepBack(index, state);
    const props = step.propsParse({ input: state, onComplete, onBack });
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
      orientation={{ base: "vertical", md: "horizontal" }}
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
        {renderStep(loginStep, 0)}
      </Steps.Content>

      <Steps.Content index={1}>
        {renderStep(claimStatusStep, 1)}
      </Steps.Content>

      <Steps.Content index={2}>
        {renderStep(ethLoginStep, 2)}
      </Steps.Content>

      <Steps.Content index={3}>
        {renderStep(requestSubmitStep, 3)}
      </Steps.Content>

      <Steps.CompletedContent>All steps are complete!</Steps.CompletedContent>

    </Steps.Root>
  )
}

