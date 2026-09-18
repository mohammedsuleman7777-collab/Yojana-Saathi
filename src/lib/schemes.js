import { addDoc,collection,deleteDoc,doc,getDoc,getDocs,serverTimestamp,updateDoc,where,query } from "firebase/firestore";
import { db } from "./firebase";

const schemesCollection = collection(db,"schemes");

export async function getSchemes()
{
    try
    {
        const snapshot = await getDocs(schemesCollection);
        return snapshot.docs.map((schemeDoc)=>({
            id:schemeDoc.id,
            ...schemeDoc.data()
        }));
    }catch (error)
    {
        console.error("Error while getting the schemes:",error); 
        throw error;
    }
}

export async function getScheme(schemeId)
{
    try
    {
        const schemeRef = doc(db,"schemes",schemeId);
        const schemeSnapshot = await getDoc(schemeRef);
        
        if(!schemeSnapshot.exists())
        {
            return null;
        }

        return{
            id:schemeSnapshot.id,
            ...schemeSnapshot.data()
        };
    }catch (error)
    {
        console.error("Error while getting the scheme:",error);
        throw error;
    }
}

export async function addScheme(schemeData,admin_uid)
{
    try
    {
        const schemeRef = await addDoc(schemesCollection,{
            ...schemeData,
            status:schemeData.status || "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: admin_uid
        });

        return schemeRef.id;
    } catch(error)
    {
        console.error("Erro while adding the scheme:",error);
        throw error;
    }
}

export async function updateScheme(schemeId,schemeData)
{
    try
    {
        const schemeRef = doc(db,"schemes",schemeId);
        await updateDoc(schemeRef,{
            ...schemeData,
            updatedAt:serverTimestamp()
        });
    } catch(error)
    {
        console.error("Error updating the scheme:",error);
        throw error;
    }
}

export async function deleteScheme(schemeId)
{
    try
    {
        const schemeRef = doc(db,"schemes",schemeId);
        await deleteDoc(schemeRef);
    } catch(error)
    {
        console.error("Erro while deleting the scheme:",error);
        throw error;
    }
}

export async function toggleSchemeStatus(schemeId,currentStatus)
{
    try
    {
        const schemeRef = doc(db,"schemes",schemeId);
        const newStatus = currentStatus === "active"?"inactive":"active";

        await updateDoc(schemeRef,{
            status:newStatus,
            updatedAt: serverTimestamp()
        });
        return newStatus;
    } catch(error)
    {
        console.error("Error while changing the scheme status:",error);
        throw error;
    }
}

export async function updateSchemeEligibility(
  schemeId,
  eligibility
) {
  try {
    const schemeRef = doc(db, "schemes", schemeId);

    await updateDoc(schemeRef, {
      eligibility,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(
      "Error updating scheme eligibility:",
      error
    );
    throw error;
  }
}

export async function getActiveSchemes()
{
    try
    {
        const schemesRef = collection(db,"schemes");

        const q = query(schemesRef,where("status","==","active"));

        const snapShot = await getDocs(q);

        return snapShot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));
    } catch(error)
    {
        console.error("Error fetching active schemes:",error);
        throw error;
    }
}

export async function getSchemeById(id) {
  try {
    const schemeRef = doc(db, "schemes", id);
    const schemeSnapshot = await getDoc(schemeRef);

    if (!schemeSnapshot.exists()) {
      return null;
    }

    return {
      id: schemeSnapshot.id,
      ...schemeSnapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching scheme:", error);
    throw error;
  }
}

export async function getSchemesByIds(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    const schemesRef =
      collection(db, "schemes");

    /*
     * Firestore "in" queries support a limited
     * number of values. To keep this function
     * simple and reliable, we fetch the
     * individual documents instead.
     */
    const schemePromises = ids.map(
      async (id) => {
        if (!id) {
          return null;
        }

        const schemeRef = doc(
          db,
          "schemes",
          id
        );

        const snapshot =
          await getDoc(schemeRef);

        if (!snapshot.exists()) {
          return null;
        }

        return {
          id: snapshot.id,
          ...snapshot.data(),
        };
      }
    );

    const schemes =
      await Promise.all(
        schemePromises
      );

    /*
     * Remove schemes that no longer exist
     * from the results.
     */
    return schemes.filter(
      (scheme) => scheme !== null
    );

  } catch (error) {
    console.error(
      "Error getting saved schemes:",
      error
    );

    throw error;
  }
}