import { Prose } from './ui/prose';
import { Text } from "./Text";
import Markdown from 'react-markdown';

export interface FractalDocProps {
  mdText: string | undefined
}

export function FractalDoc({ mdText }: FractalDocProps) {
  if (mdText === undefined) {
    return <Text>Not found</Text>
  } else {
    return (
      <Prose fontSize="md">
        <Markdown>
          {mdText}
        </Markdown>
      </Prose>
    );
  }
}