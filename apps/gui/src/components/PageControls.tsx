import { Flex } from "@chakra-ui/react"
import { IconButton } from "./IconButton"
import { IoIosArrowBack, IoIosArrowForward, IoIosRefresh } from "react-icons/io"

export interface PagedControlsProps {
  forwardEnabled: boolean,
  backEnabled: boolean
  onForward: () => void
  onBack: () => void
  onRefresh: () => void
}

export function PageControls(props: PagedControlsProps) {
  const { forwardEnabled, backEnabled, onForward, onBack, onRefresh } = props;
  return (
    <Flex alignItems="center" justifyContent="flex-end" w="100%" gap={1}>
      <IconButton onClick={onRefresh}>
        <IoIosRefresh />
      </IconButton>
      <IconButton disabled={!backEnabled} onClick={onBack}>
        <IoIosArrowBack />
      </IconButton>
      <IconButton disabled={!forwardEnabled} onClick={onForward}>
        <IoIosArrowForward />
      </IconButton>
    </Flex>
  );
}
