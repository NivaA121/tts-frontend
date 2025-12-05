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

const res = await axios.post(

`${import.meta.env.VITE_BACKEND_URL}/api/convert`,

{ text, user_id: user.id }

);



setAudioUrl(res.data.audioUrl);

toast("Audio generated successfully!", "success");

} catch (err) {

toast("Error generating audio.", "error");

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

<div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white relative overflow-hidden">



{/* Background glowing orbs */}

<div className="absolute top-20 left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>

<div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>



{/* Premium Floating Navbar */}

<nav className="w-full flex items-center justify-between px-10 py-5 backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">

<h1 className="text-2xl font-semibold tracking-wide flex items-center gap-2">

🔊 <span>VoiceFlow AI</span>

</h1>



<div className="flex gap-4">

<button

onClick={() => setShowHistory(true)}

className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10"

>

History

</button>



<button

onClick={handleLogout}

className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"

>

Logout

</button>

</div>

</nav>



{/* Centered main content */}

<div className="flex flex-col items-center w-full px-6 mt-16">



<h2 className="text-4xl font-extrabold mb-8 text-center drop-shadow-lg">

Transform Text Into

<span className="text-blue-400"> Human-like Speech</span>

</h2>



<div className="w-full max-w-3xl bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl">



<label className="text-lg font-medium">Enter your text</label>



{/* Premium textarea */}

<textarea

className="w-full h-56 p-4 rounded-xl mt-3 bg-white/5 border border-white/20 focus:border-blue-400 transition shadow-inner"

placeholder="Type your prompt here..."

value={text}

onChange={(e) => setText(e.target.value)}

></textarea>



<p className="text-gray-300 mt-2 text-right">{text.length}/{MAX_CHARS}</p>



{/* Premium convert button */}

<button

onClick={handleConvert}

disabled={loading}

className="w-full py-4 mt-6 rounded-xl text-lg font-semibold

bg-gradient-to-r from-blue-600 to-purple-600

hover:from-blue-500 hover:to-purple-500

transition-all shadow-lg hover:shadow-blue-500/30

disabled:opacity-50"

>

{loading ? "Processing..." : "Convert to Speech"}

</button>



{/* Toasts */}

{error && (

<p className="mt-4 text-red-400 text-sm animate-fade-in">

❗ {error}

</p>

)}

{success && (

<p className="mt-4 text-green-400 text-sm animate-fade-in">

✅ {success}

</p>

)}



{/* Audio section */}

{audioUrl && (

<div className="mt-10 bg-black/20 p-6 rounded-2xl border border-white/10 shadow-xl">

<p className="font-semibold text-lg mb-3">Your Audio</p>



<audio

controls

src={audioUrl}

className="w-full rounded-lg mb-4"

></audio>



<a

href={audioUrl}

download

className="text-blue-400 hover:text-blue-300 underline"

>

Download Audio

</a>

</div>

)}

</div>

</div>

</div>

);

}

