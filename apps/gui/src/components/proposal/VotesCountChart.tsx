import { BarSegment, useChart } from "@chakra-ui/charts";

export interface VoteCountChartProps {
  yesWeight: number;
  noWeight: number;
}

export function VoteCountChart({ yesWeight, noWeight }: VoteCountChartProps) {
  const chart = useChart({
    data: [
      { name: "YES", value: yesWeight, color: "green.solid" },
      { name: "NO", value: noWeight, color: "red.solid" },
    ],
  })
  const passThreshold = (Number(noWeight) + Number(yesWeight)) * 2 / 3;

  return (
    <BarSegment.Root chart={chart}>
      { yesWeight > 0 || noWeight > 0 ? (
        <BarSegment.Content mt="1em" mb="1em">
          <BarSegment.Value />
          <BarSegment.Bar tooltip>
            {passThreshold > 1 && <BarSegment.Reference value={passThreshold}/>}
          </BarSegment.Bar>
          <BarSegment.Legend showPercent showValue fontSize="lg"/>
        </BarSegment.Content>
      ) : (
        <BarSegment.Content mt="1em" mb="1em">
          <BarSegment.Legend showValue fontSize="lg"/>
        </BarSegment.Content>
      )}
    </BarSegment.Root>
  );

}