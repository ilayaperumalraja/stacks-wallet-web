import { fetchPrivate } from "@stacks/common";

export async function validateGaiaHubUrl(ownGaiaHubUrl: string): Promise<boolean> {
    try {
        const response = await fetchPrivate(`${ownGaiaHubUrl}/hub_info`);
        const hubInfo = await response.json();
        if (!hubInfo.read_url_prefix) return Promise.resolve(false);
    } catch (error) {
        return Promise.resolve(false);
    }
    return Promise.resolve(true);
}