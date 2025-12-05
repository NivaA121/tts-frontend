import { useState, useEffect } from "react";
import axios from "axios";
import Auth from "./Auth";
import { supabase } from "./supabase";
import History from "./History";

export default function App() {
  // --- ALWAYS PUT ALL HOOKS AT TOP ---
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [audioError, setAudioError] = useState(false);

  const MAX_CHARS = 500;

  // ------------------------------------------------------
  // 🔥 NEW: Restore user session when app loads (CRITICAL)
  // ------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        console.log("Restored session:", data.session.user);
        setUser(data.session.user);
      }
    });

    // Auto-listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        console.log("Auth session:", session?.user);
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // --- HANDLERS ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleConvert = async () => {
    if (!text.trim()) return setError("Please enter text.");
    if (text.length > MAX_CHARS)
      return setError(`Maximum ${MAX_CHARS} characters allowed.`);

    if (!user || !user.id) {
      return setError("User not logged in. Please login again.");
    }

    // Debug logs
    console.log("User from frontend:", user);
    console.log("User ID sent to backend:", user.id);

    setError("");
    setSuccess("");
    setLoading(true);
    setAudioUrl("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/convert`,
        {
          text,
          user_id: user.id,
        }
      );

      setAudioUrl(res.data.audioUrl);
      setSuccess("Audio generated successfully!");
    } catch (err) {
      console.error("Frontend Error:", err.response?.data || err);
      setError("Error generating audio.");
    }

    setLoading(false);
  };

  // --- CONDITIONAL UI AFTER HOOKS ---
  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />;
  }

  if (showHistory) {
    return <History user={user} onBack={() => setShowHistory(false)} />;
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4 relative">
      {/* Logout */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
      >
        Logout
      </button>

      {/* History */}
      <button
        onClick={() => setShowHistory(true)}
        className="absolute top-6 left-6 bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
      >
        History
      </button>

      <h1 className="text-4xl font-bold mb-8">
        Text to Speech <span className="text-blue-400">Converter</span>
      </h1>

      <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-lg">
        <textarea
          className="w-full h-48 p-4 text-black rounded-lg"
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        <p className="text-gray-400 mt-2">
          {text.length}/{MAX_CHARS}
        </p>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full bg-blue-600 py-4 rounded-xl mt-5 hover:bg-blue-700 disabled:bg-blue-800"
        >
          {loading ? "Converting..." : "Convert to Speech"}
        </button>

        {error && <p className="text-red-400 mt-3">{error}</p>}
        {success && <p className="text-green-400 mt-3">{success}</p>}

        {audioUrl && (
          <div className="mt-6">
            <audio
              controls
              src={audioUrl}
              className="w-full rounded-lg"
              onError={() => setAudioError(true)}
            ></audio>

            <a
              href={audioUrl}
              download
              className="text-blue-400 underline mt-3 inline-block"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
