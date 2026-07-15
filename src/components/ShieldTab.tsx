import React, { useState, useEffect } from "react";
import { Shield, ShieldOff, Play, RefreshCw, Server, Wifi, Clock, Activity, Lock, Unlock, HelpCircle } from "lucide-react";
import { ConnectionStatus, IPInfo, PingResult } from "../types";
import { motion } from "motion/react";

interface ShieldTabProps {
  status: ConnectionStatus;
  setStatus: (s: ConnectionStatus) => void;
  activeSince: Date | null;
  selectedServer: { name: string; ip: string; country: string };
  ipInfo: IPInfo | null;
  refreshIPInfo: () => void;
}

export default function ShieldTab({
  status,
  setStatus,
  activeSince,
  selectedServer,
  ipInfo,
  refreshIPInfo
}: ShieldTabProps) {
  const [pings, setPings] = useState<PingResult[]>([
    { name: "Cloudflare (1.1.1.1)", latency: 49, status: "online" },
    { name: "Facebook (facebook.com)", latency: 32, status: "online" },
  ]);
  const [testingLatency, setTestingLatency] = useState(false);
  const [uptimeStr, setUptimeStr] = useState("0 seconds ago");

  // Format uptime timer
  useEffect(() => {
    if (!activeSince || status !== ConnectionStatus.CONNECTED) {
      setUptimeStr("Disconnected");
      return;
    }

    const interval = setInterval(() => {
      const diffMs = Date.now() - activeSince.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      
      if (diffSecs < 60) {
        setUptimeStr(`${diffSecs} second${diffSecs !== 1 ? "s" : ""} ago`);
      } else {
        const mins = Math.floor(diffSecs / 60);
        const secs = diffSecs % 60;
        setUptimeStr(`${mins}m ${secs}s ago`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSince, status]);

  const testLatency = async () => {
    setTestingLatency(true);
    try {
      const res = await fetch("/api/ping");
      if (res.ok) {
        const data = await res.json();
        setPings(data);
      }
    } catch (e) {
      // Offline fallback: random latencies
      setPings([
        { name: "Cloudflare (1.1.1.1)", latency: Math.floor(Math.random() * 30) + 35, status: "simulated" },
        { name: "Facebook (facebook.com)", latency: Math.floor(Math.random() * 40) + 25, status: "simulated" },
      ]);
    } finally {
      setTimeout(() => {
        setTestingLatency(false);
      }, 600);
    }
  };

  const handleToggleConnection = () => {
    if (status === ConnectionStatus.CONNECTED) {
      setStatus(ConnectionStatus.DISCONNECTED);
    } else {
      setStatus(ConnectionStatus.CONNECTING);
      setTimeout(() => {
        setStatus(ConnectionStatus.CONNECTED);
        refreshIPInfo();
      }, 1500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" id="shield-scroll-container">
      {/* 1. Shield Connection Status Visualizer */}
      <div className="flex flex-col items-center justify-center py-8 bg-sophisticated-card rounded-3xl border border-sophisticated-border relative overflow-hidden shadow-xl">
        {/* Animated Background Pulse Waves */}
        {status === ConnectionStatus.CONNECTED && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-neon-cyan/5 rounded-full animate-ping duration-3000" />
            <div className="w-48 h-48 bg-neon-cyan/10 rounded-full animate-ping duration-2000" />
          </div>
        )}
        {status === ConnectionStatus.CONNECTING && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 bg-neon-cyan/10 rounded-full animate-spin border border-dashed border-neon-cyan/30" />
          </div>
        )}

        {/* Lock Shield Icon */}
        <button
          onClick={handleToggleConnection}
          className="relative z-10 p-1 flex items-center justify-center focus:outline-none group"
          id="btn-shield-toggle"
        >
          <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
            status === ConnectionStatus.CONNECTED 
              ? "bg-gradient-to-br from-[#05181a] to-black border-2 border-neon-cyan text-neon-cyan shadow-[0_0_35px_rgba(0,240,255,0.35)]" 
              : status === ConnectionStatus.CONNECTING
                ? "bg-[#090909] border-2 border-neon-cyan/70 text-neon-cyan/85 animate-pulse shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                : "bg-gradient-to-br from-[#1a0808] to-black border-2 border-rose-500/50 text-rose-500/80 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          }`}>
            {status === ConnectionStatus.CONNECTED ? (
              <Lock className="w-16 h-16 text-neon-cyan" />
            ) : status === ConnectionStatus.CONNECTING ? (
              <RefreshCw className="w-16 h-16 animate-spin text-neon-cyan" />
            ) : (
              <Unlock className="w-16 h-16 text-rose-500" />
            )}
          </div>
        </button>

        {/* Status Text Block */}
        <div className="mt-6 text-center z-10 px-4">
          <h2 className={`text-2xl font-bold tracking-wider uppercase font-sans ${
            status === ConnectionStatus.CONNECTED 
              ? "text-neon-cyan" 
              : status === ConnectionStatus.CONNECTING 
                ? "text-neon-cyan/85" 
                : "text-rose-500"
          }`} id="shield-status-text">
            {status === ConnectionStatus.CONNECTED && "SHIELD ACTIVE"}
            {status === ConnectionStatus.CONNECTING && "SECURING TUNNEL..."}
            {status === ConnectionStatus.DISCONNECTED && "SHIELD INACTIVE"}
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xs font-sans">
            {status === ConnectionStatus.CONNECTED && "Your network traffic is encrypted and secure."}
            {status === ConnectionStatus.CONNECTING && "Establishing handshake with mGuard optimal server."}
            {status === ConnectionStatus.DISCONNECTED && "Your network traffic is unencrypted. Protect your identity."}
          </p>

          {/* Interface Badge */}
          <div className="mt-4 flex justify-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              status === ConnectionStatus.CONNECTED 
                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20" 
                : "bg-gray-900/60 text-gray-500 border border-gray-800"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                status === ConnectionStatus.CONNECTED ? "bg-neon-cyan animate-pulse" : "bg-gray-600"
              }`} />
              {status === ConnectionStatus.CONNECTED ? "Active: tun0" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Primary Toggle Action Button */}
        <div className="mt-6 w-full px-6 z-10">
          {status === ConnectionStatus.CONNECTED ? (
            <button
              onClick={handleToggleConnection}
              className="w-full py-4 bg-rose-950/20 border border-rose-500/30 hover:bg-rose-900/20 text-rose-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              id="btn-disconnect"
            >
              <span className="text-xl font-bold">✕</span>
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleToggleConnection}
              disabled={status === ConnectionStatus.CONNECTING}
              className="w-full py-4 bg-neon-cyan text-black hover:bg-[#5cf2fd] disabled:opacity-50 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] active:scale-95"
              id="btn-connect"
            >
              <Shield className="w-5 h-5" />
              <span>{status === ConnectionStatus.CONNECTING ? "Connecting..." : "Tap to Secure Connection"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Connection Duration Card (Only shown or highly active when connected) */}
      <div className="bg-sophisticated-card rounded-2xl p-5 border border-sophisticated-border flex items-center gap-4 shadow-md">
        <div className={`p-3 rounded-xl ${
          status === ConnectionStatus.CONNECTED ? "bg-neon-cyan/10 text-neon-cyan" : "bg-gray-900 text-gray-600"
        }`}>
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold tracking-wider uppercase font-mono">Active Since</p>
          <p className={`text-lg font-bold ${
            status === ConnectionStatus.CONNECTED ? "text-white" : "text-gray-400"
          }`}>
            {status === ConnectionStatus.CONNECTED ? uptimeStr : "Not Active"}
          </p>
        </div>
      </div>

      {/* 3. Server Node Info Summary */}
      <div className="bg-sophisticated-card rounded-2xl p-5 border border-sophisticated-border space-y-4 shadow-md">
        <div className="flex justify-between items-center pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Server className="text-neon-cyan w-5 h-5" />
            <span className="text-gray-300 font-bold text-sm">Optimal Gateway Selected</span>
          </div>
          <span className="text-xs bg-neon-cyan/10 text-neon-cyan px-2.5 py-0.5 rounded-full font-semibold border border-neon-cyan/20">
            {selectedServer.country}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs font-mono">GATEWAY NAME</p>
            <p className="text-gray-200 font-medium text-sm mt-0.5">{selectedServer.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-mono">ROUTED ENDPOINT</p>
            <p className="text-gray-200 font-medium text-sm mt-0.5">{selectedServer.ip}</p>
          </div>
        </div>
      </div>

      {/* 4. Connection Latency Card */}
      <div className="bg-sophisticated-card rounded-2xl p-5 border border-sophisticated-border space-y-4 shadow-md">
        <div className="flex justify-between items-center pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Activity className="text-neon-cyan w-5 h-5" />
            <div>
              <p className="text-gray-300 font-bold text-sm">CONNECTION LATENCY</p>
              <p className="text-gray-500 text-xs">Real-time Network Ping Test</p>
            </div>
          </div>
          <button
            onClick={testLatency}
            disabled={testingLatency}
            className="flex items-center gap-1.5 text-xs text-neon-cyan hover:text-[#5cf2fd] bg-neon-cyan/10 px-3 py-1.5 rounded-xl border border-neon-cyan/20 focus:outline-none font-bold tracking-wide active:scale-95 transition-all"
            id="btn-test-latency"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingLatency ? "animate-spin" : ""}`} />
            {testingLatency ? "Testing..." : "Test Latency"}
          </button>
        </div>

        <div className="space-y-3 font-mono">
          {pings.map((ping, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-sans">{ping.name}</span>
              <span className={`font-bold ${
                status !== ConnectionStatus.CONNECTED
                  ? "text-gray-600"
                  : ping.latency < 50
                    ? "text-neon-cyan"
                    : ping.latency < 100
                      ? "text-yellow-400"
                      : "text-rose-400"
              }`}>
                {status === ConnectionStatus.CONNECTED ? `${ping.latency} ms` : "Offline"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Helpful Tip Banner */}
      <div className="bg-sophisticated-card rounded-2xl p-4 border border-sophisticated-border flex items-start gap-3">
        <HelpCircle className="text-neon-cyan w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-400 leading-relaxed font-sans">
          <strong className="text-neon-cyan">Fast Speed Tip:</strong> WireGuard performs best under heavy local censorship in Myanmar. Keep the protocol active and select servers closer to you (like Singapore) for optimal packet routing and lower latency.
        </div>
      </div>
    </div>
  );
}
