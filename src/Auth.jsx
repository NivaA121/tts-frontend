import { useState } from "react";

import { supabase } from "./supabase";



export default function Auth({ onLogin }) {

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [error, setError] = useState("");



const handleAuth = async (type) => {

setError("");



let result;

if (type === "login") {

result = await supabase.auth.signInWithPassword({ email, password });

} else {

result = await supabase.auth.signUp({ email, password });

}



if (result.error) setError(result.error.message);

else onLogin(result.data.user);

};



return (

<div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">

<div className="bg-gray-800 p-8 rounded-xl w-96 shadow-xl">

<h2 className="text-2xl font-bold mb-6 text-center">Login / Sign Up</h2>



<input

type="email"

placeholder="Email"

className="w-full p-3 rounded mb-3 text-black"

onChange={(e) => setEmail(e.target.value)}

/>



<input

type="password"

placeholder="Password"

className="w-full p-3 rounded mb-3 text-black"

onChange={(e) => setPassword(e.target.value)}

/>



{error && <p className="text-red-400 mb-3">{error}</p>}



<button

className="w-full bg-blue-600 py-3 rounded mb-3"

onClick={() => handleAuth("login")}

>

Login

</button>



<button

className="w-full bg-green-600 py-3 rounded"

onClick={() => handleAuth("signup")}

>

Sign Up

</button>

</div>

</div>

);

}