#!/usr/bin/env node
export declare class Commands {
    private configManager;
    private claudeConfigManager;
    constructor();
    setup(): Promise<void>;
    config(): Promise<void>;
    test(): Promise<void>;
    doctor(): Promise<void>;
    telemetry(action?: string): Promise<void>;
    update(): Promise<void>;
    uninstall(): Promise<void>;
    help(): Promise<void>;
}
//# sourceMappingURL=commands.d.ts.map