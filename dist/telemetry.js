#!/usr/bin/env node
import os from 'os';
import { ConfigManager } from './config-manager.js';
export class Telemetry {
    configManager;
    enabled = false;
    queue = [];
    isSending = false;
    constructor() {
        this.configManager = new ConfigManager();
        this.enabled = this.configManager.getTelemetryOptIn();
    }
    isEnabled() {
        return this.enabled;
    }
    enable() {
        this.enabled = true;
        this.configManager.setTelemetryOptIn(true);
    }
    disable() {
        this.enabled = false;
        this.configManager.setTelemetryOptIn(false);
    }
    async trackEvent(event, data) {
        if (!this.enabled) {
            return;
        }
        try {
            let installationId = 'unknown';
            let version = '1.0.0';
            try {
                const config = await this.configManager.load();
                installationId = config.installationId;
                version = config.version;
            }
            catch {
            }
            const telemetryEvent = {
                event,
                installationId,
                version,
                os: process.platform,
                osVersion: os.release(),
                timestamp: new Date().toISOString(),
                data
            };
            this.queue.push(telemetryEvent);
            if (!this.isSending) {
                await this.sendQueue();
            }
        }
        catch (error) {
            console.debug(`Telemetry error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async sendQueue() {
        if (this.isSending || this.queue.length === 0) {
            return;
        }
        this.isSending = true;
        try {
            const eventsToSend = this.queue.splice(0, 10);
            if (process.env.NODE_ENV === 'development') {
                console.debug(`[Telemetry] Would send ${eventsToSend.length} events:`);
                eventsToSend.forEach(event => {
                    console.debug(`  - ${event.event} (${event.timestamp})`);
                });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        catch (error) {
            console.debug(`Telemetry send error: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            this.isSending = false;
            if (this.queue.length > 0) {
                setTimeout(() => this.sendQueue(), 1000);
            }
        }
    }
    getStatus() {
        return {
            enabled: this.enabled,
            queueLength: this.queue.length
        };
    }
    clearQueue() {
        this.queue = [];
    }
}
const telemetry = new Telemetry();
export async function trackEvent(event, data) {
    return telemetry.trackEvent(event, data);
}
export function isTelemetryEnabled() {
    return telemetry.isEnabled();
}
export function enableTelemetry() {
    telemetry.enable();
}
export function disableTelemetry() {
    telemetry.disable();
}
export function getTelemetryStatus() {
    return telemetry.getStatus();
}
export const TelemetryEvents = {
    INSTALL: 'install',
    SETUP_START: 'setup_start',
    SETUP_COMPLETE: 'setup_complete',
    SETUP_ERROR: 'setup_error',
    BRIDGE_START: 'bridge_start',
    BRIDGE_ERROR: 'bridge_error',
    SEARCH: 'search',
    CONFIG_UPDATE: 'config_update',
    CONFIG_DELETE: 'config_delete',
    TELEMETRY_ENABLE: 'telemetry_enable',
    TELEMETRY_DISABLE: 'telemetry_disable',
    UNINSTALL: 'uninstall'
};
//# sourceMappingURL=telemetry.js.map