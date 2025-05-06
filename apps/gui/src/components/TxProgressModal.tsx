import {
  Dialog,
  Portal,
  Button,
  Center,
  DialogOpenChangeDetails,
  IconButton,
} from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/react'
import { ReactNode } from 'react';
import { IoMdClose } from 'react-icons/io';

export type TxProgressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  operationStr: string;
  children: ReactNode,
  done: boolean;
}

export default function TxProgressModal(props: TxProgressModalProps) {
  function onOpenChange({ open }: DialogOpenChangeDetails) {
    if (!open) {
      props.onClose();
    }
  }

  return (
    <Dialog.Root
      lazyMount
      open={props.isOpen}
      onOpenChange={onOpenChange}
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{props.operationStr}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Center>
                {props.children}          
                <br></br>
                {!props.done && <Spinner/>}
              </Center>
            </Dialog.Body>
            <Dialog.Footer>
              {props.done &&
                <Button color="black" onClick={props.onClose}>
                  Close
                </Button>
              }
            </Dialog.Footer>
            {props.done &&
              <Dialog.CloseTrigger asChild>
                <IconButton variant="ghost" color="black">
                  <IoMdClose />
                </IconButton>
              </Dialog.CloseTrigger>
            }
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}