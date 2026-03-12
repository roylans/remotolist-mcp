#!/usr/bin/env node

/**
 * Telemetry System for RemotoList MCP
 * 
 * Anonymous usage tracking to help improve the product.
 * Opt-in only, no personal data collected.
 */

import os from 'os';
import { ConfigManager } from './config-manager.js';

export interface TelemetryEvent {
  event: string;
  installationId: string;
  version: string;
  os: string;
  osVersion: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export class Telemetry {
  private configManager: ConfigManager;
  private enabled: boolean = false;
  private queue: TelemetryEvent[] = [];
  private isSending: boolean = false;

  constructor() {
    this.configManager = new ConfigManager();
    this.enabled = this.configManager.getTelemetryOptIn();
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable telemetry
   */
  enable(): void {
    this.enabled = true;
    this.configManager.setTelemetryOptIn(true);
  }

  /**
   * Disable telemetry
   */
  disable(): void {
    this.enabled = false;
    this.configManager.setTelemetryOptIn(false);
  }

  /**
   * Track an event
   */
  async trackEvent(event: string, data?: Record<string, unknown>): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      // Get installation ID from config
      let installationId = 'unknown';
      let version = '1.0.1';
      
      try {
        const config = await this.configManager.load();
        installationId = config.installationId;
        version = config.version;
      } catch {
        // If config doesn't exist yet, use defaults
      }

      const telemetryEvent: TelemetryEvent = {
        event,
        installationId,
        version,
        os: process.platform,
        osVersion: os.release(),
        timestamp: new Date().toISOString(),
        data
      };

      // Add to queue
      this.queue.push(telemetryEvent);

      // Try to send if not already sending
      if (!this.isSending) {
        await this.sendQueue();
      }
    } catch (error) {
      // Silently fail - telemetry should never break the app
      console.debug(`Telemetry error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Send queued events
   */
  private async sendQueue(): Promise<void> {
    if (this.isSending || this.queue.length === 0) {
      return;
    }

    this.isSending = true;

    try {
      // Take up to 10 events from the queue
      const eventsToSend = this.queue.splice(0, 10);
      
      // In a real implementation, this would send to a telemetry server
      // For now, we'll just log for development purposes
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Telemetry] Would send ${eventsToSend.length} events:`);
        eventsToSend.forEach(event => {
          console.debug(`  - ${event.event} (${event.timestamp})`);
        });
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      // Silently fail - telemetry should never break the app
      console.debug(`Telemetry send error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isSending = false;
      
      // If there are more events, send them
      if (this.queue.length > 0) {
        setTimeout(() => {
          void this.sendQueue();
        }, 1000);
      }
    }
  }

  /**
   * Get telemetry status
   */
  getStatus(): { enabled: boolean; queueLength: number } {
    return {
      enabled: this.enabled,
      queueLength: this.queue.length
    };
  }

  /**
   * Clear telemetry queue
   */
  clearQueue(): void {
    this.queue = [];
  }
}

// Global telemetry instance
const telemetry = new Telemetry();

/**
 * Track an event (convenience function)
 */
export async function trackEvent(event: string, data?: Record<string, unknown>): Promise<void> {
  return telemetry.trackEvent(event, data);
}

/**
 * Check if telemetry is enabled
 */
export function isTelemetryEnabled(): boolean {
  return telemetry.isEnabled();
}

/**
 * Enable telemetry
 */
export function enableTelemetry(): void {
  telemetry.enable();
}

/**
 * Disable telemetry
 */
export function disableTelemetry(): void {
  telemetry.disable();
}

/**
 * Get telemetry status
 */
export function getTelemetryStatus(): { enabled: boolean; queueLength: number } {
  return telemetry.getStatus();
}

/**
 * Common events to track
 */
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