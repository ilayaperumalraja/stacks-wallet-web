import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { defaultNetworks, Networks } from '@common/constants';
import { findMatchingNetworkKey } from '@common/utils';
import { StacksMainnet, StacksNetwork, StacksTestnet } from '@stacks/network';
import { ChainID } from '@stacks/transactions';
import { transactionRequestNetwork } from '@store/transactions/requests';
import { makeLocalDataKey } from '@common/store-utils';

// Our root networks list, users can add to this list and it will persist to localstorage
export const networksState = atomWithStorage<Networks>(
  makeLocalDataKey('networks'),
  defaultNetworks
);

// the current key selected
// if there is a pending transaction request, it will default to the network passed (if included)
// else it will default to the persisted key or default (mainnet)
const localCurrentNetworkKeyState = atomWithStorage(makeLocalDataKey('networkKey'), 'mainnet');
export const currentNetworkKeyState = atom<string, string>(
  get => {
    const networks = get(networksState);
    const txNetwork = get(transactionRequestNetwork);

    // if txNetwork, default to this always, users cannot currently change networks when signing a transaction
    // @see https://github.com/blockstack/stacks-wallet-web/issues/1281
    if (txNetwork) {
      const newKey = findMatchingNetworkKey(txNetwork as any, networks);
      if (newKey) return newKey;
    }
    // otherwise default to the locally saved network key state
    return get(localCurrentNetworkKeyState);
  },
  (_get, set, update) => {
    if (update) set(localCurrentNetworkKeyState, update);
  }
);

// the `Network` object for the current key selected
export const currentNetworkState = atom(get => get(networksState)[get(currentNetworkKeyState)]);

// a `StacksNetwork` instance using the current network
export const currentStacksNetworkState = atom<StacksNetwork>(get => {
  const network = get(currentNetworkState);
  const stacksNetwork =
    network.chainId === ChainID.Testnet
      ? new StacksTestnet({ url: network.url })
      : new StacksMainnet({ url: network.url });
  stacksNetwork.bnsLookupUrl = network.url;
  return stacksNetwork;
});

networksState.debugLabel = 'networksState';
localCurrentNetworkKeyState.debugLabel = 'localCurrentNetworkKeyState';
currentNetworkKeyState.debugLabel = 'currentNetworkKeyState';
currentNetworkState.debugLabel = 'currentNetworkState';
currentStacksNetworkState.debugLabel = 'currentStacksNetworkState';