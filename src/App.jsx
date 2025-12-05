import { useState, useEffect } from "react";
import axios from "axios";
import Auth from "./Auth";
import { supabase } from "./supabase";
import History from "./History";

export default function App() {
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const MAX_CHARS = 500;

  // Restore session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) setUser(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleConvert = async () => {
    if (!text.trim()) return toast("Please enter text.", "error");
    if (text.length > MAX_CHARS)
      return toast(`Max ${MAX_CHARS} characters allowed.`, "error");

    if (!user?.id) return toast("User not logged in.", "error");

    setLoading(true);
    setAudioUrl("");

    try {
      // NOTE: Removed `user_id` from the payload in this example, 
      // as it's often better to get the user ID from the Supabase JWT 
      // on the backend for security (Row-Level Security/Rerquests policies).
      // Assuming your backend handles authentication via the token.
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/convert`,
        { text } // Simplified payload
      );

      setAudioUrl(res.data.audioUrl);
      toast("Audio generated successfully!", "success");
    } catch (err) {
      // Log the error for debugging
      console.error(err);
      toast("Error generating audio. Please try again.", "error");
    }

    setLoading(false);
  };

  // Mini toast function
  const toast = (msg, type) => {
    if (type === "error") setError(msg);
    if (type === "success") setSuccess(msg);

    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 2500);
  };

  if (!user) return <Auth onLogin={(u) => setUser(u)} />;
  if (showHistory) return <History user={user} onBack={() => setShowHistory(false)} />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white relative overflow-hidden">

      {/* Background glowing gradient (Simplified/Centered) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-gray-950 to-blue-950 opacity-90"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl z-0 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl z-0"></div>

      {/* Premium Floating Navbar (Updated styling) */}
      <nav className="w-full flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-lg bg-black/50 border-b border-white/5 sticky top-0 z-50 shadow-xl">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-9.95 9.17L2 12l.05.83A10 10 0 0 0 12 22a10 10 0 0 0 9.95-9.17L22 12l-.05-.83A10 10 0 0 0 12 2zm1 14h-2v-6h2zM12 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
          <span className="hidden sm:inline">VoiceFlow AI</span>
          <span className="sm:hidden">VFAI</span>
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c.7 0 1.2.6 1.2 1.3 0 .4-.2.8-.5 1.1L12 7.1l-1.7-1.7c-.3-.3-.5-.7-.5-1.1C9.8 3.6 10.3 3 11 3h2zm6 2l-2 2-2-2 2-2 2 2zm-7 3v6h-6v-6zm0-2h-6v-1h6v1zm7 5v-6h-6v6zm-7 7v-6h-6v6zm7 0v-6h-6v6zM7 8h6v1H7v-1z"/></svg>
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 text-sm hover:bg-red-700 transition shadow-lg shadow-red-600/20"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.4 1.4L17.8 11H6v2h11.8l-2.2 2.2L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Centered main content */}
      <div className="flex-grow flex flex-col items-center w-full px-4 md:px-6 py-12 z-10">

        <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-center drop-shadow-2xl leading-tight">
          Transform Text Into
          <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Human-like Speech</span>
        </h2>

        <div className="w-full max-w-xl lg:max-w-3xl bg-black/60 backdrop-blur-2xl p-6 md:p-10 rounded-3xl border border-white/5 shadow-2xl shadow-blue-900/50">

          <label htmlFor="text-input" className="text-sm md:text-lg font-medium text-gray-200 flex justify-between items-center">
             <span>✍️ Enter your text</span>
             <span className="text-xs text-gray-400">({text.length}/{MAX_CHARS} characters)</span>
          </label>

          {/* Premium textarea (Updated styling) */}
          <textarea
            id="text-input"
            className="w-full h-48 md:h-56 p-4 rounded-2xl mt-3 bg-white/5 border border-white/10 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition duration-300 shadow-inner resize-none text-base font-mono"
            placeholder="Type your prompt here... Max 500 characters."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          {/* Moved character count and styled it within the label, removed the old one */}
          {/* <p className="text-gray-300 mt-2 text-right">{text.length}/{MAX_CHARS}</p> */}

          {/* Premium convert button (Stronger focus color) */}
          <button
            onClick={handleConvert}
            disabled={loading || text.length === 0 || text.length > MAX_CHARS}
            className="w-full py-4 mt-6 rounded-xl text-lg font-bold
              bg-blue-600 text-white
              hover:bg-blue-500
              transition-all duration-300 shadow-xl shadow-blue-600/40
              flex items-center justify-center gap-2
              disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 21a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4zM10 21a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1zM16 21a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1zM20 21a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1z"/></svg>
                <span>Convert to Speech</span>
              </>
            )}
          </button>

          {/* Toasts - Using consistent design with icons */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-900/50 border border-red-700/50 text-red-300 text-sm animate-fade-in flex items-center gap-2">
              <span className="text-lg">❌</span>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 rounded-xl bg-green-900/50 border border-green-700/50 text-green-300 text-sm animate-fade-in flex items-center gap-2">
              <span className="text-lg">✅</span>
              <p>{success}</p>
            </div>
          )}

          {/* Audio section (Updated styling) */}
          {audioUrl && (
            <div className="mt-10 bg-white/5 p-6 rounded-xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 transition duration-500">
              <p className="font-semibold text-xl mb-4 text-blue-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0 0 18A9 9 0 0 0 12 3zm0 16a7 7 0 0 1 0-14 7 7 0 0 1 0 14zm-1-10v6l5-3-5-3z"/></svg>
                Playback Ready
              </p>

              <audio
                controls
                src={audioUrl}
                className="w-full rounded-lg mb-4 bg-gray-700"
              ></audio>

              <a
                href={audioUrl}
                download
                className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition font-medium"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h6v7l9-11h-6z"/></svg>
                Download Audio File
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Add a simple footer/attribution */}
      <footer className="w-full text-center py-4 text-xs text-gray-500 border-t border-white/5 mt-auto z-10">
        &copy; {new Date().getFullYear()} VoiceFlow AI. All rights reserved.
      </footer>
    </div>
  );
}