import Fallback from "../Fallback";
import StepFrame from "./StepFrame";

export function ErrorComponent({ error }: { error: unknown }) {
  return (
    <StepFrame>
      <Fallback error={error} />
    </StepFrame>
  );
}