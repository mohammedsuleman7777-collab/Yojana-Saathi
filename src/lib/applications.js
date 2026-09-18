import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";


// Create a new application
export async function createApplication(
  applicationData
) {
  try {
    const applicationsRef =
      collection(
        db,
        "applications"
      );

    const application = {
      ...applicationData,

      status: "Pending",

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    };

    const applicationRef =
      await addDoc(
        applicationsRef,
        application
      );

    return applicationRef.id;

  } catch (error) {

    console.error(
      "Error creating application:",
      error
    );

    throw error;
  }
}


// Check whether a user has already applied
export async function hasUserApplied(
  uid,
  schemeId
) {
  try {

    const applicationsRef =
      collection(
        db,
        "applications"
      );

    const q = query(
      applicationsRef,

      where(
        "userId",
        "==",
        uid
      ),

      where(
        "schemeId",
        "==",
        schemeId
      )
    );

    const snapshot =
      await getDocs(q);

    return !snapshot.empty;

  } catch (error) {

    console.error(
      "Error checking existing application:",
      error
    );

    throw error;
  }
}


// Get all applications belonging to a user
export async function getUserApplications(
  uid
) {
  try {

    const applicationsRef =
      collection(
        db,
        "applications"
      );

    const q = query(
      applicationsRef,

      where(
        "userId",
        "==",
        uid
      )
    );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      (applicationDoc) => ({
        id: applicationDoc.id,
        ...applicationDoc.data(),
      })
    );

  } catch (error) {

    console.error(
      "Error getting user applications:",
      error
    );

    throw error;
  }
}


// Get one application by ID
export async function getApplicationById(
  id
) {
  try {

    if (!id) {
      return null;
    }

    const applicationRef =
      doc(
        db,
        "applications",
        id
      );

    const snapshot =
      await getDoc(
        applicationRef
      );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };

  } catch (error) {

    console.error(
      "Error getting application:",
      error
    );

    throw error;
  }
}


// =====================================================
// ADMIN FUNCTIONS
// =====================================================


// Get all applications
export async function getAllApplications() {
  try {

    const applicationsRef =
      collection(
        db,
        "applications"
      );

    const snapshot =
      await getDocs(
        applicationsRef
      );

    return snapshot.docs.map(
      (applicationDoc) => ({
        id: applicationDoc.id,
        ...applicationDoc.data(),
      })
    );

  } catch (error) {

    console.error(
      "Error getting all applications:",
      error
    );

    throw error;
  }
}


// Update application status
export async function updateApplicationStatus(
  applicationId,
  status,
  rejectionReason = ""
) {
  try {

    if (!applicationId) {
      throw new Error(
        "Application ID is required."
      );
    }


    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
    ];


    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      throw new Error(
        "Invalid application status."
      );
    }


    if (
      status === "Rejected" &&
      !rejectionReason.trim()
    ) {
      throw new Error(
        "A rejection reason is required."
      );
    }


    const applicationRef =
      doc(
        db,
        "applications",
        applicationId
      );


    await updateDoc(
      applicationRef,
      {
        status,

        rejectionReason:
          status === "Rejected"
            ? rejectionReason.trim()
            : "",

        updatedAt:
          serverTimestamp(),
      }
    );

  } catch (error) {

    console.error(
      "Error updating application status:",
      error
    );

    throw error;
  }
}