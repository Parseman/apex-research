export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  createdBy: string;
}

export interface Session {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  onboardingDone: boolean;
  displayName: string | null;
  riskLevel: number;   // 0 = non défini, 1–5
  horizon: string;     // 'court' | 'moyen' | 'long' | 'tres_long' | ''
  capital: string;
  status: string;
}

export interface ProfileData {
  displayName: string;
  status: string;
  capital: string;
  riskLevel: number;
  horizon: string;
}
