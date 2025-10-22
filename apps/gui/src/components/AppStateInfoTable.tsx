import { EthAddress } from "@ordao/ortypes";
import { ObjectTable } from "./proposal-view/ObjectTable";
import { useMemo } from "react";

export interface AppStateInfoTabeProps {
  periodNumber: number;
  voteLength: number;
  vetoLength: number;
  minVoteWeight: string;
  maxLiveYesVotes: number;
  parentRespect: EthAddress
}

export function AppStateInfoTable(props: AppStateInfoTabeProps) {
  const view = useMemo(() => {
    return {
      'events': props.periodNumber,
      'vote_period': props.voteLength,
      'veto_period': props.vetoLength,
      'max_live_yes_votes': props.maxLiveYesVotes,
      'prop_weight_threshold': props.minVoteWeight,
      'respect_contract': props.parentRespect,
    }
  }, [props])

  return (
    <ObjectTable obj={view} />
  );
}