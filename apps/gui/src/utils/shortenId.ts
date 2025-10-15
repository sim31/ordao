import { Bytes32 } from "@ordao/ortypes";

export function shortenHexString(str: string, bytes: number = 3): string {
  // Assuming it starts with '0x'
  const begin = str.slice(0, bytes*2+2);
  const end = str.slice(-bytes*2);
  return `${begin}...${end}`;
}

export function shortenId(id: Bytes32, bytes: number = 3): string {
  return shortenHexString(id, bytes);
}

