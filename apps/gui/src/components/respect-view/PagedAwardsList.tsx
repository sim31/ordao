import { VStack } from "@chakra-ui/react";
import { RespectAwardMt } from "@ordao/ortypes/respect1155.js";
import { Text } from "../Text";
import { AwardsTable } from "./AwardsTable";
import { PageControls, PagedControlsProps } from "../PageControls";

export interface PagedAwardsListProps extends PagedControlsProps {
  awards: RespectAwardMt["properties"][]
  isLoading: boolean
}

export function PagedAwardsList(props: PagedAwardsListProps) {
  const { awards, isLoading, ...ctrl } = props;

  const renderHeader = () => {
    if (isLoading) {
      return <Text>Loading...</Text>;
    } else {
      return <PageControls {...ctrl} />
    }
  }

  const renderFooter = () => {
    if (!isLoading && awards.length > 2) {
      return <PageControls {...ctrl} />
    }
  }

  return (
    <VStack mt="0.5em" mb="0.5em" w="100%">
      {renderHeader()}
      {
        awards.length === 0
        ? <Text mt="2em">No awards found</Text>
        : <AwardsTable awards={awards} />
      }
      {renderFooter()}
    </VStack>
  );
}
