type EnvVar = { key: string; value: string };

async function getEnvVarsFromClipboard(): Promise<EnvVar[]> {
    try {
        const text = await navigator.clipboard.readText();

        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        const envVars: EnvVar[] = [];

        for (const line of lines) {
            const eqIndex = line.indexOf('=');
            if (eqIndex === -1) continue;

            const rawKey = line.slice(0, eqIndex).trim();
            const rawValue = line.slice(eqIndex + 1).trim();

            const key = rawKey.replace(/^['"]|['"]$/g, '');
            const value = rawValue.replace(/^['"]|['"]$/g, '');

            if (key) {
                envVars.push({ key, value });
            }
        }

        return envVars;
    } catch (err) {
        console.error('Failed to read clipboard:', err);
        return [];
    }
}

export default getEnvVarsFromClipboard;
