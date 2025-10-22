import {
  Dialog,
  Portal,
  Center,
  DialogOpenChangeDetails,
  VStack,
  Link,
  Icon,
} from '@chakra-ui/react'
import { Text } from './Text.js';
import { Button } from './Button.js';
import { IconButton } from './IconButton';
import { OnchainActionRes } from '@ordao/orclient';
import { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { decodeError } from '../utils/decodeTxError';
import { FiExternalLink } from 'react-icons/fi';
import { linkToTx } from '../utils/blockExplorerLink';
import { flatStringify } from '@ordao/ts-utils';
import { Loading } from './Loading';

export type OnchainActionModalProps = {
  onClose: (success: boolean) => void;
  title: string;
  action: Promise<OnchainActionRes> | undefined;
}

export default function OnchainActionModal(props: OnchainActionModalProps) {

  const [txProgressStr, setTxProgressStr] = useState("");
  const [txProgressStatus, setTxProgressStatus] = 
    useState<'submitting' | 'submitted' | 'error' | undefined>()
  const [txHash, setTxHash] = useState("");

  const done = txProgressStatus === 'submitted' || txProgressStatus === 'error';
  const success = txProgressStatus === 'submitted';
  const isOpen = props.action !== undefined;


  function onOpenChange({ open }: DialogOpenChangeDetails) {
    if (!open) {
      props.onClose(success);
    }
  }

  const explorerLink = useMemo(() => {
    if (typeof txHash === 'string' && txHash.length > 0) {
      return linkToTx(txHash);
    } else {
      return undefined;
    }
  }, [txHash]);

  useEffect(() => {
    const waitForPromise = async () => {
      if (props.action === undefined) {
        return;
      }
      setTxProgressStatus('submitting');
      setTxProgressStr("");
      try {
        const res = await props.action;
        setTxProgressStatus('submitted');
        setTxHash(res.txReceipt.hash);
        setTxProgressStr("Success!");
      } catch (err) {
        setTxProgressStr('');
        const decoded = decodeError(err);
        if (decoded) {
          // TODO: more friendly error message, explaining if it is a revert or what
          setTxProgressStr(`Transaction failed. Error type: ${decoded.type}, reason: ${decoded.reason}`)
          setTxProgressStatus('error');
        } else {
          setTxProgressStr(`Transaction failed. Error: ${flatStringify(err)}`)
          setTxProgressStatus('error');
        }
      }
    }
    waitForPromise();
  }, [props.action])

  return (
    <Dialog.Root
      lazyMount
      open={isOpen}
      onOpenChange={onOpenChange}
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content color="black">
            <Dialog.Header>
              <Dialog.Title>{props.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Center>
                <VStack>

                  {txProgressStatus === 'submitting' && <Loading/>}

                  <Text>{txProgressStr}</Text>

                  {txProgressStatus === 'submitted'
                    && (
                      <Link fontSize="md" color="teal.500" href={explorerLink} target="_blank">
                        Transaction in Block Explorer
                        <Icon background="transparent" size="sm" marginLeft="1px">
                          <FiExternalLink />
                        </Icon>
                      </Link>
                    )
                  }
                </VStack>
              </Center>
            </Dialog.Body>
            <Dialog.Footer>
              {done &&
                <Button onClick={() => props.onClose(success)}>
                  Close
                </Button>
              }
            </Dialog.Footer>
            {done &&
              <Dialog.CloseTrigger asChild>
                <IconButton variant="ghost">
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