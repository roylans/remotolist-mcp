export interface Config {
    sseUrl: string;
    apiKey: string;
    timeout?: number;
    debug?: boolean;
}
export declare function loadConfig(): Config;
export declare function validateConfig(config: Config): {
    valid: boolean;
    errors: string[];
};
export declare function printSetupInstructions(): void;
//# sourceMappingURL=config.d.ts.map