import React, { useState, useEffect } from "react";
import { Shield, Settings, Globe, Bot, Wifi, Battery, Compass, AlertCircle, RefreshCw, Key, HelpCircle } from "lucide-react";
import ShieldTab from "./components/ShieldTab";
import SettingsTab from "./components/SettingsTab";
import ProxyTab from "./components/ProxyTab";
import AIAssistant from "./components/AIAssistant";
import { ConnectionStatus, IPInfo, ServerOption } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"shield" | "settings" | "proxy" | "ai">("shield");
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [activeSince, setActiveSince] = useState<Date | null>(null);
  
  // Real IP Info from back-end
  const fallbackIP: IPInfo = {
    ip: "103.25.12.54",
    country: "Myanmar",
    country_code: "MM",
    region: "Yangon",
    city: "Yangon",
    isp: "ATOM Myanmar",
    asn: "AS134892",
    is_vpn: false
  };

  const [realIP, setRealIP] = useState<IPInfo | null>(fallbackIP);
  const [displayIP, setDisplayIP] = useState<IPInfo | null>(fallbackIP);

  // Server nodes options
  const serverOptions: ServerOption[] = [
    { id: "1", name: "Option 1", flag: "🇸🇬", country: "Singapore", ip: "128.199.213.43", latency: 12, protocol: "WireGuard" },
    { id: "2", name: "Option 2", flag: "🇯🇵", country: "Japan", ip: "139.162.115.192", latency: 35, protocol: "WireGuard" },
    { id: "3", name: "Option 3", flag: "🇺🇸", country: "United States", ip: "104.248.60.21", latency: 112, protocol: "Trojan" },
    { id: "4", name: "Option 4", flag: "☁️", country: "Cloudflare Warp", ip: "162.159.193.10", latency: 8, protocol: "WireGuard" }
  ];
  const [selectedServer, setSelectedServer] = useState<ServerOption>(serverOptions[0]);

  // Clock state for mock status bar
  const [timeStr, setTimeStr] = useState("15:51");

  // Fetch client IP on mount
  useEffect(() => {
    fetchIP();
    
    // Update status bar time
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update dynamic uptime anchor
  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED) {
      setActiveSince(new Date());
    } else {
      setActiveSince(null);
    }
  }, [status]);

  // Adjust display IP based on connection status (simulate tunneling)
  useEffect(() => {
    if (!realIP) return;

    if (status === ConnectionStatus.CONNECTED) {
      // Safely tunneled through selected server gateway
      setDisplayIP({
        ip: selectedServer.ip,
        country: selectedServer.country,
        country_code: selectedServer.id === "1" ? "SG" : selectedServer.id === "2" ? "JP" : "US",
        region: selectedServer.country === "Singapore" ? "Central Region" : "Tokyo",
        city: selectedServer.country === "Singapore" ? "Singapore" : "Tokyo",
        isp: selectedServer.id === "4" ? "Cloudflare Inc." : "mGuard Secure Gateway LLC",
        asn: "AS14061",
        is_vpn: true
      });
    } else {
      // Disconnected: show real raw IP details
      setDisplayIP(realIP);
    }
  }, [status, realIP, selectedServer]);

  const fetchIP = async () => {
    try {
      const res = await fetch("/api/ip-info");
      if (res.ok) {
        const data = await res.json();
        setRealIP(data);
        setDisplayIP(data);
      } else {
        console.warn("Client IP fetch received non-OK response from backend: " + res.status);
      }
    } catch (e) {
      console.warn("Using local fallback due to client-side network fetch failure");
    }
  };

  return (
    <div className="min-h-screen bg-sophisticated-bg flex items-center justify-center font-sans text-gray-200 antialiased py-0 sm:py-8 px-0 sm:px-4">
      {/* 
        App Frame Shell:
        On desktop, acts as an elegant mock mobile phone container matching high-fidelity previews.
        On mobile, takes up full viewport beautifully.
      */}
      <div className="w-full max-w-md h-screen sm:h-[860px] bg-sophisticated-bg rounded-none sm:rounded-[36px] border-none sm:border-8 sm:border-sophisticated-border shadow-[0_0_50px_rgba(0,240,255,0.12)] overflow-hidden flex flex-col relative">
        
        {/* A. Mock Phone Status Bar */}
        <div className="bg-sophisticated-bg text-[11px] font-mono font-medium px-5 py-2.5 flex justify-between items-center shrink-0 border-b border-sophisticated-border select-none z-20">
          {/* Status Left: Carrier info */}
          <div className="flex items-center gap-1">
            <span className="font-sans font-bold tracking-tight text-gray-300">
              {displayIP?.isp?.split(" ")[0] || "ATOM"} 4.5G
            </span>
            <span className="text-[10px] text-gray-500 font-bold">U9</span>
          </div>

          {/* Status Center: Time & VPN state indicator */}
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider">{timeStr}</span>
            {status === ConnectionStatus.CONNECTED && (
              <span className="bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold px-1.5 py-0.2 rounded text-[8px] tracking-widest scale-90 flex items-center">
                VPN
              </span>
            )}
          </div>

          {/* Status Right: Network indicators */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-[10px] text-gray-500 font-mono">
              {status === ConnectionStatus.CONNECTED ? "1.7 MB/s" : "1.1 K/s"}
            </span>
            <Wifi className="w-3.5 h-3.5 text-gray-400" />
            <Battery className="w-4 h-4 text-gray-400 fill-gray-400/20" />
            <span className="text-[10px] text-gray-500">79%</span>
          </div>
        </div>

        {/* B. Active IP Telemetry Widget Banner (Real-time dynamic leak detector) */}
        <div className="bg-[#0c0c0c] px-4 py-2 border-b border-sophisticated-border flex justify-between items-center shrink-0 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <Globe className="w-4 h-4 text-neon-cyan" />
            <span className="font-mono text-[11px]">{displayIP?.ip || "Loading diagnostics..."}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${displayIP?.is_vpn ? "bg-neon-cyan animate-pulse" : "bg-rose-500"}`} />
            <span className={`font-semibold uppercase tracking-wider text-[9px] ${displayIP?.is_vpn ? "text-neon-cyan" : "text-rose-400 animate-pulse"}`}>
              {displayIP?.is_vpn ? `SECURED (${displayIP.country_code})` : "UNPROTECTED IP"}
            </span>
          </div>
        </div>

        {/* C. Dynamic Tab Workspace Panel (Main Scrollable Content Area) */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#070707]">
          {activeTab === "shield" && (
            <ShieldTab
              status={status}
              setStatus={setStatus}
              activeSince={activeSince}
              selectedServer={selectedServer}
              ipInfo={displayIP}
              refreshIPInfo={fetchIP}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              status={status}
              setStatus={setStatus}
              selectedServer={selectedServer}
              setSelectedServer={setSelectedServer}
              serverOptions={serverOptions}
            />
          )}

          {activeTab === "proxy" && (
            <ProxyTab />
          )}

          {activeTab === "ai" && (
            <AIAssistant carrier={displayIP?.isp || "ATOM Myanmar"} />
          )}
        </div>

        {/* D. Integrated Bottom Navigation Bar (Pixel perfect styling from screenshots) */}
        <div className="bg-sophisticated-bg border-t border-sophisticated-border px-3 py-2 flex justify-around items-center shrink-0 select-none z-20">
          
          {/* Tab 1: Shield */}
          <button
            onClick={() => setActiveTab("shield")}
            className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 focus:outline-none transition-all group"
            id="nav-tab-shield"
          >
            <div className={`relative px-4 py-1.5 rounded-full flex items-center justify-center transition-all ${
              activeTab === "shield" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-all ${
              activeTab === "shield" ? "text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              Shield
            </span>
          </button>

          {/* Tab 2: Settings */}
          <button
            onClick={() => setActiveTab("settings")}
            className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 focus:outline-none transition-all group"
            id="nav-tab-settings"
          >
            <div className={`relative px-4 py-1.5 rounded-full flex items-center justify-center transition-all ${
              activeTab === "settings" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              <Settings className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-all ${
              activeTab === "settings" ? "text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              Settings
            </span>
          </button>

          {/* Tab 3: Unblocked Proxy Browser */}
          <button
            onClick={() => setActiveTab("proxy")}
            className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 focus:outline-none transition-all group"
            id="nav-tab-proxy"
          >
            <div className={`relative px-4 py-1.5 rounded-full flex items-center justify-center transition-all ${
              activeTab === "proxy" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-all ${
              activeTab === "proxy" ? "text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              Proxy Web
            </span>
          </button>

          {/* Tab 4: AI Advisor */}
          <button
            onClick={() => setActiveTab("ai")}
            className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 focus:outline-none transition-all group"
            id="nav-tab-ai"
          >
            <div className={`relative px-4 py-1.5 rounded-full flex items-center justify-center transition-all ${
              activeTab === "ai" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-all ${
              activeTab === "ai" ? "text-neon-cyan" : "text-gray-500 group-hover:text-gray-400"
            }`}>
              Adviser AI
            </span>
          </button>
        </div>

        {/* E. Native Home Bar Anchor */}
        <div className="bg-sophisticated-bg py-1.5 flex justify-center items-center shrink-0">
          <div className="w-32 h-1 bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
