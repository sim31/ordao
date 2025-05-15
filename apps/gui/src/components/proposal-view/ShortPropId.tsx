import { Text, Clipboard } from "@chakra-ui/react";
import { IconButton } from "../IconButton.js";
import { shortenId } from "../../utils/shortenId";

export interface ShortPropIdProps {
  id: string;
  title?: string;
}

export function ShortPropId({ id, title }: ShortPropIdProps) {
  const shortenedId = shortenId(id);
  const t = title || 'ID';

  return (
    <>
      <Text fontSize="lg" color="gray.500">
        {t}: {shortenedId}
      </Text>
      <Clipboard.Root value={id} onStatusChange={() => console.log("copied")}>
        <Clipboard.Trigger asChild>
          <IconButton variant="surface" size="xs">
            <Clipboard.Indicator />
          </IconButton>
        </Clipboard.Trigger>
      </Clipboard.Root>
    </>
  )
}