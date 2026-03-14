export function getMockSession() {
  // Temporary session mock until real auth is wired.
  // Role can be "HR" or "CANDIDATE".
  return { user: { name: "Recruiter", email: "recruiter@vectorhire.ai", role: "HR", company: "VectorHire" } };
}

