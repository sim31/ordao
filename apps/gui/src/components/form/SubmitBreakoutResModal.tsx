import {
  Dialog,
  Portal,
  Text,
  DialogOpenChangeDetails,
} from '@chakra-ui/react'
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { IoMdClose } from "react-icons/io";

export type SubmitBreakoutResModal = {
  isOpen: boolean;
  consensusId: string,
  onClose: () => void;
  onSubmit: () => void;
}

export default function SubmitBreakoutResModal(props: SubmitBreakoutResModal) {
  function onOpenChange({ open }: DialogOpenChangeDetails) {
    if (!open) {
      props.onClose();
    }
  }

  return (
    <Dialog.Root lazyMount open={props.isOpen} onOpenChange={onOpenChange}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content color="black">
            <Dialog.Header fontSize="xl">
              <Dialog.Title>Submit Breakout Results</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize="md">
                Please make sure submission represents consensus of a group.
                <br/><br/>
                To help with that, check with other members if they see the same character sequence here: <b>{props.consensusId}</b>
                <br/><br/>
                If it's the same your submissions are identical (so you're in consensus).
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                width="100%"
                onClick={props.onSubmit}
                fontSize="md"
              >
                Push it on chain!
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <IconButton variant="ghost">
                <IoMdClose />
              </IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}