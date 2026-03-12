#!/usr/bin/env node
export interface TelemetryEvent {
    event: string;
    installationId: string;
    version: string;
    os: string;
    osVersion: string;
    timestamp: string;
    data?: Record<string, any>;
}
export declare class Telemetry {
    private configManager;
    private enabled;
    private queue;
    private isSending;
    constructor();
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    trackEvent(event: string, data?: Record<string, any>): Promise<void>;
    private sendQueue;
    getStatus(): {
        enabled: boolean;
        queueLength: number;
    };
    clearQueue(): void;
}
export declare function trackEvent(event: string, data?: Record<string, any>): Promise<void>;
export declare function isTelemetryEnabled(): boolean;
export declare function enableTelemetry(): void;
export declare function disableTelemetry(): void;
export declare function getTelemetryStatus(): {
    enabled: boolean;
    queueLength: number;
};
export declare const TelemetryEvents: {
    INSTALL: string;
    SETUP_START: string;
    SETUP_COMPLETE: string;
    SETUP_ERROR: string;
    BRIDGE_START: string;
    BRIDGE_ERROR: string;
    SEARCH: string;
    CONFIG_UPDATE: string;
    CONFIG_DELETE: string;
    TELEMETRY_ENABLE: string;
    TELEMETRY_DISABLE: string;
    UNINSTALL: string;
};
//# sourceMappingURL=telemetry.d.ts.map