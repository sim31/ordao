import { useRouterState } from "@tanstack/react-router";
import Exception from "./Exception";

export default function NotFoundError() {
  const state = useRouterState();
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <Exception title="Not Found" message={`Path: ${state.location.pathname} not found`} status="error" />
  );
}