import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { storageConfig } from "./storage";

export function useStorageConfig() {
    return useAtomValue(storageConfig);
}

export function useUpdateStorageConfig() {
    return useUpdateAtom(storageConfig);
}