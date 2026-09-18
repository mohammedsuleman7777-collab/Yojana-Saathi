const profileFields=["dateOfBirth","gender","state","district","annualIncome","occupation","employmentStatus","category","maritalStatus","educationLevel","residenceType"];

export function isProfileComplete(profile)
{
    if (!profile)
    {
        return false;
    }
    return profileFields.every((field)=>{
        const value = profile[field];

        return value !== undefined && value !== null && value !== "";
    });
}