import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleAuth = async (type) => {
    setError("");
    setLoading(true);

    let result;
    if (type === "login") {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      // Supabase recommends having the user confirm their email after sign-up
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      setError(result.error.message);
    } else if (type === "signup" && !result.data.user) {
      // Specific message if email confirmation is required (common default setting)
      setError("Success! Check your email to confirm your account and log in.");
    } else {
      // If user data is present (login successful or sign-up without confirmation)
      onLogin(result.data.user);
    }
    
    setLoading(false);
  };

  const isFormValid = email.trim() && password.trim();
  const buttonClass = (color) => `
    w-full py-3 rounded-xl text-lg font-semibold mt-4 transition-all duration-300 shadow-lg 
    flex items-center justify-center gap-2
    disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed
    ${color === 'blue' 
      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' 
      : 'bg-green-600 hover:bg-green-500 shadow-green-600/30'
    }
  `;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-gray-950 to-blue-950 opacity-90"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl z-0"></div>

      <div className="bg-black/60 p-8 rounded-3xl w-full max-w-sm md:max-w-md shadow-2xl shadow-blue-900/50 border border-white/5 z-10 backdrop-blur-md">
        
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">
          Welcome Back
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Login or create an account to start converting text to speech.
        </p>

        {/* Form Inputs */}
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-4 rounded-xl mb-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-300"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 rounded-xl mb-6 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-300"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        {/* Error Toast */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-900/50 border border-red-700/50 text-red-300 text-sm animate-fade-in flex items-center gap-2 mb-6">
            <span className="text-lg">❌</span>
            <p>{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <button
          className={buttonClass('blue')}
          onClick={() => handleAuth("login")}
          disabled={loading || !isFormValid}
        >
          {loading ? (
             <Spinner />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zM11 15h2v2h-2z"/></svg>
              Login
            </>
          )}
        </button>

        <p className="text-center text-gray-500 my-4">OR</p>

        <button
          className={buttonClass('green')}
          onClick={() => handleAuth("signup")}
          disabled={loading || !isFormValid}
        >
          {loading ? (
             <Spinner />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
              Sign Up
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Simple Spinner component for loading state
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);