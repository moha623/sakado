export interface User {
  uid?: string;
  email: string;
  username: string;
  lastname: string;
  number: string;
  createdAt: Date;
  role: 'user' | 'admin'; // Add role property
}