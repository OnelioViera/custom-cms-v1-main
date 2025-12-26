export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  _id?: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}
