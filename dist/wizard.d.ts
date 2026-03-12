#!/usr/bin/env node
export declare class SetupWizard {
    private rl;
    private configManager;
    private claudeConfigManager;
    constructor();
    run(): Promise<boolean>;
    private checkClaudeDesktop;
    private getApiKey;
    private getSseUrl;
    private validateConfiguration;
    private saveConfiguration;
    private configureClaudeDesktop;
    private askTelemetryOptIn;
    private showSuccessMessage;
    private askQuestion;
    close(): void;
}
//# sourceMappingURL=wizard.d.ts.map