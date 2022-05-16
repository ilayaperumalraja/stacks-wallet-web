import { atom } from 'jotai';

interface StorageConfig {
    ownGaiaHubUrl?: string;
}

export const storageConfig = atom<StorageConfig>({
    ownGaiaHubUrl: undefined,
});