import { useMemo } from "react";
import { flatStringify } from "@ordao/ts-utils";
import Exception from "./Exception";

export default function Fallback({ error }: { error: unknown }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  const [name, message] = useMemo(() => {
    if (typeof error === 'object' && error !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return [(error as any).name, (error as any).message]
    }
    return [undefined, undefined];
  }, [error])

  const title = `Error: ${name ?? ""}`;
  const msg = message;
  const debugInfo = flatStringify(error);

  console.log("In Fallback");

  return (
    <Exception title={title} message={msg} debugInfo={debugInfo} status="error"/>
  );
}