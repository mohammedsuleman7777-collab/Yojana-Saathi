"use client";

import { createContext,useContext,useEffect,useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile,logoutUser } from "@/lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children })
{
    const [user,setUser] = useState(null);
    const [profile,setProfile] = useState(null);
    const [loading,setLoading] = useState(true);

    async function refreshProfile(uid)
    {
        try
        {
            const userProfile = await getUserProfile(uid);
            setProfile(userProfile);
            return userProfile;
        } catch(error)
        {
            console.error("Error refreshing the user profile:",error);
            throw error;
        }
    }

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,async(currentUser)=>{
            try
            {
                if (currentUser)
                {
                    setUser(currentUser);
                    const userProfile = await getUserProfile(currentUser.uid);
                    setProfile(userProfile);
                }
                else
                {
                    setUser(null);
                    setProfile(null);
                }
            } catch(error)
            {
                console.error("Error loading authentication state: ",error);
                setUser(null);
                setProfile(null);
            } finally
            {
                setLoading(false);
            }
        });
        return ()=> unsubscribe();
    },[]);
    return (
        <AuthContext.Provider
            value={{user,profile,loading,refreshProfile,logout:logoutUser}}>{children}</AuthContext.Provider>
    );
}

export function useAuth()
{
    const context = useContext(AuthContext);
    if(!context)
    {
        throw new Error("useAuth must be inside an AuthProvider");
    }
    return context;
}