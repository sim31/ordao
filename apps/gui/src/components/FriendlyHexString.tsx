import { Link } from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { toaster } from "./ui/toaster";
import { shortenHexString } from "../utils/shortenId";

export interface FriendlyHexStringProps {
  hexStr: string;
  bytes?: number; // by each side
}

export function FriendlyHexString({ hexStr, bytes }: FriendlyHexStringProps) {
  const handleCopy = () => {
    copy(hexStr)
    toaster.create({
      description: 'Copied to clipboard',
      type: 'info'
    })
  }
  
  return (
    <Link
      onClick={() => handleCopy()}
    >
      {bytes ? shortenHexString(hexStr, bytes) : hexStr}
    </Link>
  )

}
  