import { createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendPasswordResetEmail } from "firebase/auth";

import { doc,getDoc,setDoc,serverTimestamp } from "firebase/firestore"

import { auth,db } from "@/lib/firebase"

export async function registerUser(name, email, password) {
  try {


    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;



    await updateProfile(user, {
      displayName: name,
    });



    const userRef = doc(db, "users", user.uid);

 
    await setDoc(userRef, {
      uid: user.uid,
      name,
      email: user.email,
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });


    return user;
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    throw error;
  }
}
export async function loginUser(email,password)
{
    try
    {
        const userCredential = await signInWithEmailAndPassword(auth,email,password);
        return userCredential.user;
    } catch(error)
    {
        console.error("Login error: ",error);
        throw error;
    }
}

export async function getUserProfile(uid)
{
    try
    {
        const userRef = doc(db,"users",uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists())
        {
            return null;
        }
        return{
            id: userSnapshot.id,
            ...userSnapshot.data(),
        };
    } catch(error)
    {
        console.error("Error while getting the user profile: ",error);
        throw error;
    }
}

export async function logoutUser()
{
    try 
    {
        await signOut(auth);
    } catch(error)
    {
        console.error("Logout error: ",error);
        throw error;
    }
}

export async function resetPassword(email)
{
  try
  {
    await sendPasswordResetEmail(auth,email);
  } catch(error)
  {
    console.error("Password reset error:",error);
    throw error;
  }
}

export async function updateUserProfile(uid,profileData)
{
  try
  {
    const userRef = doc(db,"users",uid);

    await setDoc(userRef,{
      profile:profileData,
      updatedAt:serverTimestamp(),
    },{merge:true});
  } catch(error)
  {
    console.error("Error updating user profile:",error);
    throw error;
  }
}

export async function getUserEligibilityProfile(uid)
{
  try
  {
    const userRef = doc(db,"users",uid);
    const userSnapshot = await getDoc(userRef);

    if(!userSnapshot.exists())
    {
      return null;
    }
    const data = userSnapshot.data();
    return data.profile||null;
  } catch(error)
  {
    console.error("Error while getting eligibilty profile:",error);
    throw error;
  }
}

export async function updateSavedSchemes(uid, savedSchemes) {
  try {
    const userRef = doc(db, "users", uid);

    await setDoc(
      userRef,
      {
        savedSchemes,
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating saved schemes:", error);
    throw error;
  }
}