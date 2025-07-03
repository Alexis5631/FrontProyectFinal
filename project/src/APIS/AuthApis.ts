const BASE_URL = 'http://localhost:5202/api/Auth';

export async function loginApi(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Username: username,
      Password: password
    }),
  });

  if (!response.ok) throw new Error('Invalid credentials');
  return await response.json();
}


export async function registerApi(data: {
  name: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Registration failed');
  return await response.json();
}

export async function addRoleApi(data: {
  username: string;
  password: string;
  role: string;
}) {
  const response = await fetch(`${BASE_URL}/addrole`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Role assignment failed');
  return await response.json();
}
