import React, { useState, useRef } from "react";
import { Globe, ArrowRight, ArrowLeft, RotateCw, Shield, HelpCircle, AlertTriangle } from "lucide-react";

export default function ProxyTab() {
  const [urlInput, setUrlInput] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const quickSites = [
    { name: "Wikipedia", url: "https://en.wikipedia.org" },
    { name: "BBC News", url: "https://www.bbc.com" },
    { name: "Reddit", url: "https://www.reddit.com" },
    { name: "GitHub", url: "https://github.com" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let target = urlInput.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = "https://" + target;
    }
    
    setLoading(true);
    setErrorMsg("");
    setActiveUrl(target);
    setIframeKey(prev => prev + 1);
  };

  const loadQuickSite = (url: string) => {
    setUrlInput(url);
    setLoading(true);
    setErrorMsg("");
    setActiveUrl(url);
    setIframeKey(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-sophisticated-bg overflow-hidden" id="proxy-tab-container">
      {/* Search Bar / Browser Address Control */}
      <div className="p-4 bg-sophisticated-card border-b border-sophisticated-border space-y-3 shrink-0 shadow-md">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Globe className="w-4 h-4 text-neon-cyan" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter blocked website (e.g., wikipedia.org)"
              className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-sophisticated-border rounded-2xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon-cyan font-sans tracking-wide transition-all"
              id="browser-url-input"
            />
          </div>
          <button
            type="submit"
            className="bg-neon-cyan hover:bg-[#5cf2fd] text-black p-3 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all shadow-md"
            id="browser-submit-btn"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Launch Shortcuts */}
        {!activeUrl && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Quick Unblocked Channels</p>
            <div className="flex flex-wrap gap-2">
              {quickSites.map((site, idx) => (
                <button
                  key={idx}
                  onClick={() => loadQuickSite(site.url)}
                  className="px-3.5 py-2 bg-[#151515] hover:bg-sophisticated-hover text-gray-300 rounded-xl text-xs font-semibold font-sans tracking-wide border border-sophisticated-border active:scale-95 transition-all shadow-sm"
                >
                  {site.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Sandbox Browser Viewport */}
      <div className="flex-1 flex flex-col min-h-0 relative bg-[#050505]">
        {activeUrl ? (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Simulated Browser Bar */}
            <div className="bg-[#0d0d0d] py-2.5 px-4 flex justify-between items-center border-b border-sophisticated-border text-xs text-gray-400 font-sans">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse" />
                <span className="truncate max-w-[200px] text-[11px] font-mono font-medium text-gray-300">
                  Proxying: {new URL(activeUrl).hostname}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIframeKey(prev => prev + 1)}
                  className="hover:text-white flex items-center gap-1 active:scale-95 transition-all font-semibold"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-neon-cyan" : ""}`} />
                  Reload
                </button>
                <button
                  onClick={() => setActiveUrl("")}
                  className="text-rose-500 hover:text-rose-400 font-bold"
                >
                  Exit Viewer
                </button>
              </div>
            </div>

            {/* Browser frame */}
            <div className="flex-1 relative min-h-0">
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10 animate-fade-in">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-neon-cyan animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 font-bold mt-4 tracking-wide font-sans">Establishing proxy secure gateway...</p>
                  <p className="text-xs text-gray-500 mt-1">Decrypting assets and scripts over mGuard network</p>
                </div>
              )}

              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={`/api/proxy?url=${encodeURIComponent(activeUrl)}`}
                onLoad={handleIframeLoad}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </div>
        ) : (
          /* Landing/Splash state of proxy */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-y-auto">
            <div className="w-20 h-20 bg-neon-cyan/10 text-neon-cyan rounded-3xl flex items-center justify-center border border-neon-cyan/25 shadow-lg">
              <Globe className="w-10 h-10 animate-pulse text-neon-cyan" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-white text-lg font-bold">Unblocked Web Proxy</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Access blocked social media, news, and search engines directly inside mGuard. Requests are proxied securely through cloud server gateways, bypassing any ISP-level censorship in Myanmar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-sm w-full text-left">
              <div className="bg-sophisticated-card p-4 rounded-2xl border border-sophisticated-border space-y-1.5 shadow-md">
                <p className="text-xs font-bold text-neon-cyan flex items-center gap-1.5 font-sans">
                  <Shield className="w-4 h-4 text-neon-cyan" />
                  No local VPN client required
                </p>
                <p className="text-[11px] text-gray-400 font-sans">
                  mGuard Proxy bypasses ISP firewalls directly on our cloud servers. You don't need any additional tools or config installation.
                </p>
              </div>

              <div className="bg-sophisticated-card p-4 rounded-2xl border border-sophisticated-border space-y-1.5 shadow-md">
                <p className="text-xs font-bold text-neon-cyan flex items-center gap-1.5 font-sans">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Interactive & Secure
                </p>
                <p className="text-[11px] text-gray-400 font-sans">
                  All requests are fully encrypted using TLS before being sent back to your browser, masking your target destinations from local eavesdroppers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
