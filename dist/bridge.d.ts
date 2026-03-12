interface BridgeConfig {
    sseUrl: string;
    apiKey: string;
    timeout?: number;
}
export declare function connectBridge(config: BridgeConfig): Promise<void>;
export {};
//# sourceMappingURL=bridge.d.ts.map