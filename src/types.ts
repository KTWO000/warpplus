/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ConnectionStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING"
}

export interface IPInfo {
  ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  isp: string;
  asn: string;
  is_vpn: boolean;
}

export interface PingResult {
  name: string;
  latency: number;
  status: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface ServerOption {
  id: string;
  name: string;
  flag: string;
  country: string;
  ip: string;
  latency: number;
  protocol: string;
}
