"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();


  //read cookie to check if user is logged in
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.ok ? setIsLoggedIn(true) : setIsLoggedIn(false))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try{  
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setError(`Login failed: ${errorData.error}`);
        setIsLoading(false);
        return;
      } 
      
      const data = await res.json();
      setIsLoggedIn(true);
      setShowLogin(false);
      
      if(data.user?.role === "SystemAdmin") {
        router.push("/admin/dashboard");
        return;
      }
  
       router.push("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

 

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsLoggedIn(false);
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  

  
  return (
    <nav className="text-left">      
      <div className="flex items-center justify-between p-4 mr-15" >
        <Image src="/logos/bullepin_logo_final_v5.svg" width={300} height={100} alt="Bullepin Logo" className="h-16 w-auto" priority />

        <div className="text-2xl font-bold font-sans text-gray-800 dark:text-gray-200">
          Student Event App
        </div>

        <ul className="flex gap-6 text-1xl font-bold">
          <li className="home-link">
            <Link href="/" className="nav-link">Home</Link>
          </li>
          <li className="about-link">
            <Link href="/public/about" className="nav-link">About</Link>
          </li>
          <li className="login-link">
            {isLoggedIn ? (
              <button onClick={handleLogout} label="logout-button" className="nav-link">Logout</button>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} label="login-button" className="nav-link">Login</button>
              </>
            )}            
            
          </li>
          {!isLoggedIn && (
            <li className="register-link">
              <Link href="/register" className="nav-link">Register</Link>
            </li>
          )}
        </ul>
      </div>
   

<div className="border-t border-gray-300 dark:border-gray-700">
      {/* Login Modal */}
      {showLogin && (
        <div  className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur">
          <div className="bg-white  p-8 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              Login to Your Account
            </h2>
              <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e12b53] focus:border-[#e12b53]"
                      placeholder="EMAIL"
                      required />                    
                </div>
                  <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e12b53] focus:border-[#e12b53]" 
                        placeholder="********" 
                        required />
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input id="remember_me" name="remember_me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                            Remember me
                          </label>
                      </div>
                      <div className="text-sm">
                          <p>                            
                            <Link href="/reset-password" className="font-medium text-[#e12b53] hover:text-[#c91f4a]">
                            Forgot your password?
                            </Link>
                          </p>
                      </div>
                  </div>
                  <div>

                      <button type="submit" 
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e12b53] hover:bg-[#c91f4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12b53]"                        
                        disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                      </button>
                   </div>
                   <div className="text-sm text-center">
                     {error && <p className="text-red-500">{error}</p>}
                   </div>
                   <div className="text-sm text-center mt-4">
                     <p className="text-gray-600">Don't have an account? <Link href="/register" className="text-[#e12b53] font-medium hover:text-[#c91f4a]">Register here</Link></p>
                   </div>
                </form>
            </div>
        </div>
      )}
</div>
 </nav>
  );
};

