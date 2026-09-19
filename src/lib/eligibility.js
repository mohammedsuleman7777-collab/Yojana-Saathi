export function checkEligibility(profile, scheme) 
{
  if (!profile || !scheme) 
    {
    return {
      eligible: false,
      matchedCriteria: [],
      failedCriteria: [],
      reasons: ["Profile or scheme information is missing.",],
    };
    }

  const criteria = scheme.eligibility;

  if (!criteria) 
    {
    return {
      eligible: true,
      matchedCriteria: [],
      failedCriteria: [],
      reasons: [],
    };
    }

  const matchedCriteria = [];
  const failedCriteria = [];
  const reasons = [];


  if (criteria.age) 
    {
    const age = calculateAge(profile.dateOfBirth);

    if (age === null) 
    {
      failedCriteria.push("Age");

      reasons.push("Date of birth is missing or invalid in your profile.");
    } else 
    {
      let agePassed = true;

      const minAge = Number(criteria.age.min);
      const maxAge = Number(criteria.age.max);

      if (criteria.age.min !== null && criteria.age.min !== undefined &&!Number.isNaN(minAge) &&age < minAge) 
        {
        agePassed = false;
        reasons.push(`Minimum age required: ${criteria.age.min}`);
        }

      if (criteria.age.max !== null &&criteria.age.max !== undefined &&!Number.isNaN(maxAge) &&age > maxAge) 
        {
        agePassed = false;

        reasons.push(`Maximum age allowed: ${criteria.age.max}`);
        }

      if (agePassed) 
        {
        matchedCriteria.push("Age");
        } else 
        {
        failedCriteria.push("Age");
        }
    }
  }


  if (criteria.annualIncome) 
  {
    const income = Number(profile.annualIncome);

    if (profile.annualIncome === null ||profile.annualIncome === undefined ||profile.annualIncome === "" ||Number.isNaN(income)) {
      failedCriteria.push("Annual income");

      reasons.push("Annual income is missing or invalid in your profile.");
    } else {
      let incomePassed = true;

      const minIncome = Number(criteria.annualIncome.min);
      const maxIncome = Number(criteria.annualIncome.max);

      if (criteria.annualIncome.min !== null &&criteria.annualIncome.min !== undefined &&!Number.isNaN(minIncome) &&income < minIncome) {
        incomePassed = false;
        reasons.push(`Minimum annual income required: ${criteria.annualIncome.min}`);
      }

      if (criteria.annualIncome.max !== null &&criteria.annualIncome.max !== undefined &&!Number.isNaN(maxIncome) &&income > maxIncome) {
        incomePassed = false;
        reasons.push(`Maximum annual income allowed: ${criteria.annualIncome.max}`);
      }

      if (incomePassed) {
        matchedCriteria.push("Annual income");
      } else {
        failedCriteria.push("Annual income");
      }
    }
  }

  checkArrayCriteria(profile.gender,criteria.gender,"Gender",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.state,criteria.state,"State",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.district,criteria.district,"District",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.category,criteria.category,"Category",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.occupation,criteria.occupation,"Occupation",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.employmentStatus,criteria.employmentStatus,"Employment status",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.maritalStatus,criteria.maritalStatus,"Marital status",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.educationLevel,criteria.educationLevel,"Education level",matchedCriteria,failedCriteria,reasons);

  checkArrayCriteria(profile.residenceType,criteria.residenceType,"Residence type",matchedCriteria,failedCriteria,reasons);

  // Disability status
  if (criteria.disablityStatus !== null &&criteria.disablityStatus !== undefined) {
    if (profile.disablityStatus === null ||profile.disablityStatus === undefined) {
      failedCriteria.push("Disability status");
      reasons.push("Disability status is missing from your profile.");
    } else if (normalizeBoolean(profile.disablityStatus) ===normalizeBoolean(criteria.disablityStatus)
    ) {
      matchedCriteria.push("Disability status");
    } else {
      failedCriteria.push("Disability status");
      reasons.push("Disability status does not match the scheme requirements.");
    }
  }

  return {
    eligible: failedCriteria.length === 0,
    matchedCriteria,
    failedCriteria,
    reasons,
  };
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() -birthDate.getMonth();

  if (monthDifference < 0 ||(monthDifference === 0 &&today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function checkArrayCriteria(profileValue,criteriaValues,fieldName,matchedCriteria,failedCriteria,reasons) {
  if (criteriaValues === null ||criteriaValues === undefined ||criteriaValues === "") {
    return;
  }

  const allowedValues = Array.isArray(criteriaValues)? criteriaValues: [criteriaValues];

  const validValues = allowedValues.filter((value) =>value !== null &&value !== undefined &&value !== "");

  if (validValues.length === 0) {
    return;
  }

  if (profileValue === null ||profileValue === undefined ||profileValue === "") {
    failedCriteria.push(fieldName);
    reasons.push(`${fieldName} information is missing from your profile.`);

    return;
  }

  const userValue = String(profileValue).trim().toLowerCase();

  const allowedValuesLower =validValues.map((value) =>String(value).trim().toLowerCase());

  if (allowedValuesLower.includes(userValue)) {
    matchedCriteria.push(fieldName);
  } else {
    failedCriteria.push(fieldName);
    reasons.push(`${fieldName} does not match the scheme requirements.`);
  }
}

function normalizeBoolean(value) {
  if (value === true ||value === "true" ||value === "True" ||value === 1 ||value === "1") {
    return true;
  }

  if (value === false ||value === "false" ||value === "False" ||value === 0 ||value === "0") {
    return false;
  }

  return value;
}

export function checkAllSchemes(profile,schemes) {
  if (!profile ||!Array.isArray(schemes)) {
    return [];
  }

  return schemes.map((scheme) => {
    const result =checkEligibility(profile,scheme);
    return {
      ...scheme,
      eligible: result.eligible,
      reasons: result.reasons,
      matchedCriteria:result.matchedCriteria,
      failedCriteria:result.failedCriteria,
    };
  });
}

