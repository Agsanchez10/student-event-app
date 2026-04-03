"use client";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <nav className="text-left">      
      <div className="flex items-center justify-between p-4 mr-15" >
        <Image src="/logos/bullepin_logo_final_v5.svg" width={300} height={100} alt="Bullepin Logo" className="h-16 w-auto" priority />

        <div className="text-2xl font-bold font-sans text-gray-800 dark:text-gray-200">
          Student Event App
        </div>

        <ul className="flex gap-6 text-1xl font-bold">
          <li className="home-link">
            <a href="/" className="nav-link">Home</a>
          </li>
          <li className="about-link">
            <a href="/about" className="nav-link">About</a>
          </li>
          <li className="contact-link">
            <a href="/contact" className="nav-link">Contact</a>
          </li>
          |
          <li className="login-link">
            <button onClick={() => setShowLogin(true)} className="nav-link">Login</button>
            {showLogin && <div> </div>}
          </li>
        </ul>
      </div>
   

<div className="border-t border-gray-300 dark:border-gray-700">
      {/* Login Modal */}
      {showLogin && (
        <div onClick={() => setShowLogin(false)} className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur">
          <div className="bg-white  p-8 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              Login to Your Account
            </h2>
              <form className="space-y-6">
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="EMAIL" required />
                  </div>
                  <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input type="password" id="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="********" required />
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input id="remember_me" name="remember_me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                            Remember me
                          </label>
                      </div>
                      <div className="text-sm">
                          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                            Forgot your password?
                          </a>
                      </div>
                  </div>
                  <div>
                      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e12b53] hover:bg-[#c91f4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12b53]">Sign In</button>
                   </div>
                </form>
            </div>
        </div>
      )}
</div>
 </nav>
  );
};

