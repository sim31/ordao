# Respect1155

A non-transferrable reputation token contract based on ERC-1155. It implements [fungibility out of non-fungible tokens](https://peakd.com/dao/@sim31/fungibility-out-of-non-fungible-tokens).

Respect is awarded as SBT (soulbound token) which can have attributes that signify details like when respect was earned and how. Each Respect SBT also has an associated "value" (or denomination if you will) representing Respect amount the particular SBT respresents. This value is stored on chain and determined at the time of issuance. Then there's fungible Respect token, where balance of each account is determined by summing the values of all Respect SBTs an account has earned.
