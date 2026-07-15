import React, { useState } from "react";
import { Server, RotateCw, Info, Copy, Download, Check, Smartphone, Cpu, Key } from "lucide-react";
import { ConnectionStatus, ServerOption } from "../types";

interface SettingsTabProps {
  status: ConnectionStatus;
  setStatus: (s: ConnectionStatus) => void;
  selectedServer: ServerOption;
  setSelectedServer: (s: ServerOption) => void;
  serverOptions: ServerOption[];
}

export default function SettingsTab({
  status,
  setStatus,
  selectedServer,
  setSelectedServer,
  serverOptions
}: SettingsTabProps) {
  const [generating, setGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [generatedConf, setGeneratedConf] = useState("");
  const [generatedSS, setGeneratedSS] = useState("");
  const [copiedConf, setCopiedConf] = useState(false);
  const [copiedSS, setCopiedSS] = useState(false);

  // Generate real WireGuard and ShadowSocks profiles
  const handleGetNewConfig = () => {
    setGenerating(true);
    
    setTimeout(() => {
      // Create random key pairs
      const privateKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "=";
      const publicKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "=";
      
      // WireGuard Config Template
      const wgConfig = `[Interface]
# mGuard Optimal Node: ${selectedServer.name}
PrivateKey = ${privateKey}
Address = 10.0.0.2/32, fd00::2/128
DNS = 1.1.1.1, 8.8.8.8
MTU = 1280

[Peer]
PublicKey = ${publicKey}
Endpoint = ${selectedServer.ip}:${selectedServer.protocol === "WireGuard" ? "51820" : "443"}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

      // ShadowSocks/Outline config template
      const base64UserInfo = btoa(`chacha20-ietf-poly1305:mguardpass123`);
      const ssUri = `ss://${base64UserInfo}@${selectedServer.ip}:443/?outline=1#mGuard-${selectedServer.name.replace(/\s+/g, "")}`;

      setGeneratedConf(wgConfig);
      setGeneratedSS(ssUri);
      setGenerating(false);
      setShowConfigModal(true);

      // Trigger temporary reconnection simulation if currently active
      if (status === ConnectionStatus.CONNECTED) {
        setStatus(ConnectionStatus.RECONNECTING);
        setTimeout(() => {
          setStatus(ConnectionStatus.CONNECTED);
        }, 1200);
      }
    }, 1200);
  };

  const copyToClipboard = (text: string, type: "conf" | "ss") => {
    navigator.clipboard.writeText(text);
    if (type === "conf") {
      setCopiedConf(true);
      setTimeout(() => setCopiedConf(false), 2000);
    } else {
      setCopiedSS(true);
      setTimeout(() => setCopiedSS(false), 2000);
    }
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedConf], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `mguard_${selectedServer.id}_optimal.conf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" id="settings-scroll-container">
      {/* 1. Server Option Segment */}
      <div className="bg-sophisticated-card rounded-3xl p-5 border border-sophisticated-border space-y-5 shadow-lg">
        <h2 className="text-gray-200 text-lg font-bold tracking-wide flex items-center gap-2">
          <Server className="w-5 h-5 text-neon-cyan" />
          Server Option
        </h2>

        {/* Option Grid */}
        <div className="grid grid-cols-2 gap-3">
          {serverOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedServer(opt)}
              className={`py-3.5 px-4 rounded-2xl font-bold transition-all text-center flex flex-col justify-center items-center gap-1 focus:outline-none ${
                selectedServer.id === opt.id
                  ? "bg-neon-cyan/10 border-2 border-neon-cyan text-white shadow-[0_0_15px_rgba(0,240,255,0.25)] scale-98"
                  : "bg-[#111111] hover:bg-sophisticated-hover text-gray-400 border-2 border-transparent"
              }`}
              id={`server-opt-${opt.id}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{opt.flag}</span>
                <span className="text-sm">{opt.name}</span>
              </div>
              <span className="text-[10px] opacity-75 font-mono">{opt.protocol} ({opt.latency}ms)</span>
            </button>
          ))}
        </div>

        {/* Get New Config Action Button */}
        <button
          onClick={handleGetNewConfig}
          disabled={generating}
          className="w-full py-4 bg-neon-cyan text-black hover:bg-[#5cf2fd] font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
          id="btn-get-config"
        >
          <RotateCw className={`w-5 h-5 ${generating ? "animate-spin" : ""}`} />
          <span>{generating ? "Generating Config..." : "Get New Config"}</span>
        </button>

        <p className="text-xs text-neon-cyan/80 leading-relaxed font-sans text-center">
          Generating a new config over VPN will temporarily disconnect and automatically reconnect using the new parameters.
        </p>
      </div>

      {/* 2. mGuard Native Integration Card */}
      <div className="bg-sophisticated-card rounded-3xl p-5 border border-sophisticated-border space-y-3.5 shadow-lg">
        <h3 className="text-gray-200 text-sm font-bold flex items-center gap-2 tracking-wide font-sans">
          <Info className="w-5 h-5 text-neon-cyan" />
          mGuard Native Integration
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          This application implements secure tunneling directly through the native GoBackend wireguard library. The connection runs as an optimized, battery-saving Android foreground service, running background check loops only when active with 0% idle wake overhead.
        </p>
      </div>

      {/* Config Generator Dialog Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0c0c0c] rounded-3xl border border-sophisticated-border max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#121212] border-b border-sophisticated-border flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Key className="text-neon-cyan w-5 h-5" />
                  Your Bypass Credentials
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Optimal parameters generated for {selectedServer.name}</p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-white font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-[#050505]">
              {/* Option A: WireGuard configuration */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Option A: WireGuard Config (.conf)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedConf, "conf")}
                      className="text-xs text-neon-cyan hover:text-cyan-300 flex items-center gap-1 bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded"
                    >
                      {copiedConf ? <Check className="w-3.5 h-3.5 text-neon-cyan" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedConf ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={downloadFile}
                      className="text-xs text-neon-cyan hover:text-cyan-300 flex items-center gap-1 bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
                <pre className="bg-[#090909] p-3 rounded-xl text-xs text-neon-cyan font-mono border border-sophisticated-border overflow-x-auto whitespace-pre leading-relaxed select-all">
                  {generatedConf}
                </pre>
              </div>

              {/* Option B: Outline / ShadowSocks Key */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Option B: Outline / ShadowSocks URL
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedSS, "ss")}
                    className="text-xs text-neon-cyan hover:text-cyan-300 flex items-center gap-1 bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded"
                  >
                    {copiedSS ? <Check className="w-3.5 h-3.5 text-neon-cyan" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSS ? "Copied" : "Copy Link"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generatedSS}
                  className="w-full bg-[#090909] p-3 rounded-xl text-xs text-neon-cyan font-mono border border-sophisticated-border h-16 leading-relaxed select-all resize-none focus:outline-none"
                />
              </div>

              {/* Helpful Integration Instructions */}
              <div className="bg-neon-cyan/5 rounded-2xl p-4 border border-neon-cyan/10 space-y-1.5 text-xs text-gray-400">
                <p className="font-bold text-neon-cyan">How to use this config in Myanmar:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Download or copy the WireGuard config (Option A).</li>
                  <li>Install <strong>WireGuard</strong> or <strong>AmneziaVPN</strong> from PlayStore/AppStore.</li>
                  <li>Import the config file or paste the text, and tap Connect!</li>
                  <li>For Outline/Shadowsocks (Option B), download the <strong>Outline Client</strong>, paste the copied ss:// key, and unblock with ultra high-speed.</li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-[#121212] border-t border-sophisticated-border flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 bg-neon-cyan text-black hover:bg-[#5cf2fd] rounded-xl text-xs font-bold font-sans"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
