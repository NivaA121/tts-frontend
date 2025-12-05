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
    if (!text.trim()) return setError("Please enter text.");
    if (text.length > MAX_CHARS)
      return setError(`Maximum ${MAX_CHARS} characters allowed.`);

    if (!user?.id) return setError("User not logged in.");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/convert`,
        { text, user_id: user.id }
      );

      setAudioUrl(res.data.audioUrl);
      setSuccess("Audio generated successfully!");
    } catch (err) {
      setError("Error generating audio.");
    }

    setLoading(false);
  };

  if (!user) return <Auth onLogin={(u) => setUser(u)} />;
  if (showHistory) return <History user={user} onBack={() => setShowHistory(false)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-12 px-4">

      {/* Header Buttons */}
      <div className="absolute top-6 left-6 flex gap-3">
        <button
          onClick={() => setShowHistory(true)}
          className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/20 transition"
        >
          📜 History
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-red-600 px-4 py-2 rounded-xl hover:bg-red-700 transition"
      >
        Logout
      </button>

      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-10 text-center">
        Text-to-Speech  
        <span className="text-blue-400"> AI Converter</span>
      </h1>

      {/* Main Card */}
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-white/20">

        <label className="text-lg font-semibold mb-2 block">Enter Text</label>

        <textarea
          className="w-full h-48 p-4 rounded-xl bg-white/20 backdrop-blur-md text-white focus:outline-none border border-white/10"
          placeholder="Type anything..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        <p className="text-gray-300 mt-2 text-right">{text.length}/{MAX_CHARS}</p>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full bg-blue-600 py-4 rounded-xl mt-6 text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800 transition"
        >
          {loading ? "Converting..." : "Convert to Speech"}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-green-400 mt-4">{success}</p>}

        {/* Audio Player */}
        {audioUrl && (
          <div className="mt-8 bg-black/30 p-6 rounded-2xl border border-white/10">
            <p className="mb-2 text-lg font-semibold">Your Audio</p>

            <audio controls src={audioUrl} className="w-full rounded-lg mb-3"></audio>

            <a
              href={audioUrl}
              download
              className="text-blue-400 underline hover:text-blue-300"
            >
              ⬇ Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
