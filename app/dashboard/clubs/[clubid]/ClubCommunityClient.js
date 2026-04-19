"use client";

import { useState, useEffect } from "react";
import { fetchPublicUserInfoBatch } from "@/app/actions/userActions";

export default function ClubCommunityClient({
    club,
    formatDate,
}) {
    const [memberNameCache, setMemberNameCache] = useState({});

    useEffect(() => {
        if (club.memberList && club.memberList.length > 0) {
            // Find member IDs that need to be fetched
            const uncachedMemberIds = club.memberList.filter(memberId => !memberNameCache[memberId]);
            
            if (uncachedMemberIds.length > 0) {
                // Fetch all uncached members in a single API call
                fetchPublicUserInfoBatch(uncachedMemberIds).then(result => {
                    if (result.success) {
                        // Build cache object from batch results
                        const newCache = {};
                        result.data.forEach(user => {
                            const name = `${user.firstName} ${user.lastName}`.trim() || user.email || "Unknown";
                            newCache[user._id] = name;
                        });
                        
                        // Update cache with all new names at once
                        setMemberNameCache(prevCache => ({
                            ...prevCache,
                            ...newCache
                        }));
                    }
                }).catch(error => {
                    console.error("Error fetching member names:", error);
                });
            }
        }
    }, [club.memberList]);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-950">Club Members</h2>
                <p className="text-sm text-slate-600">{club.memberList?.length || 0} members</p>
            </div>

            {club.memberList && club.memberList.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {club.memberList.map((memberId, index) => (
                        
                        <div
                            
                            key={index}
                            className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                        >
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Member</p>
                                    <p className="mt-2 text-lg font-semibold text-slate-950">
                                        {memberNameCache[memberId] || "Loading..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 text-center">
                    <p className="text-slate-700">No members yet. Be the first to join!</p>
                </div>
            )}
        </div>
    );
}
