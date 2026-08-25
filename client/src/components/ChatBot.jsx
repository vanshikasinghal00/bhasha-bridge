import { useState, useRef, useEffect } from "react";

// =============================================
// APNI INFO YAHAN CHANGE KARO
// =============================================
const BOT_NAME = "BhashaBridge Assistant";

const REPLIES = {
  greet:    "Namaste! BhashaBridge Assistant mein aapka swagat hai. Main aapko translation, language selection, aur multimodal (Voice/Image) features ke baare mein bata sakta hun. Aap kya jaanna chahte hain?",
  languages: "BhashaBridge 12+ Indian languages ko support karta hai jaise: \n• Hindi (हिन्दी)\n• Bengali (বাংলা)\n• Tamil (தமிழ்)\n• Telugu (తెలుగు)\n• Marathi (मराठी)\n• Gujarati (ગુજરાતી)\n• Punjabi (ਪੰਜਾਬੀ)\nAur bhi bahut saari! Aap TranslateBox ke drop-down se language choose kar sakte hain.",
  translate: "Translate karna bahut aasan hai:\n1. Text mode mein apna content type karein.\n2. Target language select karein.\n3. 'Translate Now' par click karein.\nAap transliteration ka use karke Hinglish mein bhi type kar sakte hain!",
  multimodal: "Hamare app mein 3 main modes hain:\n📷 OCR: Photo se text extract karke translate karein.\n🎤 Voice: Bol kar translate karein.\n⌨️ Text: Type karke translate karein.\nAap top bar se modes change kar sakte hain.",
  features: "Hamare special features:\n⭐ Favorites: Important translations save karein.\n📜 History: Purani translations dekhein.\n🔄 Transliteration: Phonetic typing (e.g., 'namaste' -> 'नमस्ते').\n🔊 Text-to-Speech: Translation ko suniye.",
  thanks:   "Aapka shukriya! Agar translation mein koi dikat ho toh zaroor batayein.",
  bye:      "Alvida! Happy translating! 👋",
  default:  "Maaf kijiye, main samajh nahi paaya. Aap Languages, How to Translate, ya Modes ke baare mein pooch sakte hain!",
};

const KEYWORDS = {
  greet:    ["hello", "hi", "hey", "hii", "helo", "namaste", "good morning", "good evening"],
  languages: ["language", "languages", "bhasha", "hindi", "tamil", "supported", "list", "choose", "select"],
  translate: ["translate", "translation", "how to", "process", "kaise karein", "karna hai", "transliteration", "typing"],
  multimodal: ["mode", "ocr", "voice", "image", "photo", "camera", "mic", "bolkar", "speak"],
  features: ["feature", "features", "history", "favorite", "save", "audio", "speech", "listen", "extra"],
  thanks:   ["thank", "thanks", "thank you", "thx", "shukriya", "dhanyawad", "appreciate"],
  bye:      ["bye", "goodbye", "alvida", "see you", "later"],
};

const QUICK_BUTTONS = ["Supported Languages", "How to Translate", "Features", "Voice & Image Mode"];
// =============================================

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function matchIntent(text) {
  const t = text.toLowerCase();
  for (const [key, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return "default";
}

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello! Main hoon ${BOT_NAME}. Aapki kya madad kar sakta hun?`, who: "bot", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const addMessage = (text, who) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, who, time: getTime() }]);
  };

  const botReply = (userText) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const intent = matchIntent(userText);
      addMessage(REPLIES[intent], "bot");
    }, 800 + Math.random() * 400);
  };

  const sendMsg = () => {
    const text = input.trim();
    if (!text) return;
    addMessage(text, "user");
    setInput("");
    botReply(text);
  };

  const sendQuick = (label) => {
    addMessage(label, "user");
    botReply(label);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "sans-serif" }}>
      {/* Chat Window */}
      {open && (
        <div style={{
          width: 340,
          height: 520,
          display: "flex",
          flexDirection: "column",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
          background: "#fff",
          marginBottom: 16,
          border: "1px solid rgba(0,0,0,0.05)",
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #F97316, #FB923C)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>🤖</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{BOT_NAME}</div>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, background: "#4ADE80", borderRadius: "50%", display: "inline-block" }}></span>
                Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", opacity: 0.8 }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12, background: "#f8fafc" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.who === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius: 20,
                  borderBottomLeftRadius: msg.who === "bot" ? 4 : 20,
                  borderBottomRightRadius: msg.who === "user" ? 4 : 20,
                  background: msg.who === "user" ? "#F97316" : "#fff",
                  color: msg.who === "user" ? "#fff" : "#334155",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  border: msg.who === "bot" ? "1px solid #f1f5f9" : "none",
                  whiteSpace: "pre-line",
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 5, padding: "0 8px" }}>{msg.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div style={{ display: "flex", gap: 6, padding: "12px 16px", background: "#fff", borderRadius: 20, borderBottomLeftRadius: 4, width: "fit-content", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#F97316", display: "inline-block",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.4 + (i * 0.2)
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 18px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
            {QUICK_BUTTONS.map((label) => (
              <button
                key={label}
                onClick={() => sendQuick(label)}
                style={{
                  fontSize: 12, padding: "6px 14px", borderRadius: 20,
                  border: "1px solid #F97316", color: "#F97316",
                  background: "#fff", cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.background = "#FFF7ED" }}
                onMouseOut={(e) => { e.target.style.background = "#fff" }}
              >{label}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 10, padding: "12px 18px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              placeholder="Type your message..."
              style={{
                flex: 1, padding: "10px 18px", borderRadius: 20,
                border: "1px solid #e2e8f0", fontSize: 14,
                outline: "none", background: "#f8fafc", color: "#1e293b",
                transition: "border 0.2s"
              }}
               onFocus={(e) => e.target.style.border = "1px solid #F97316"}
               onBlur={(e) => e.target.style.border = "1px solid #e2e8f0"}
            />
            <button
              onClick={sendMsg}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "#F97316", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#F97316", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
            fontSize: 28,
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
        >
          {open ? (
            <span style={{ color: "#fff" }}>✕</span>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </button>
      </div>

      {/* CSS for typing animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
