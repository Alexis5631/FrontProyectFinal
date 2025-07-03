import type { UserRole } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getUserRole = async (): Promise<UserRole[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/UserRole`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/UserRole falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getUserRole:", error);
  }
  return null;
};


export const postUserRole = async (datos: UserRole): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...userRoleData } = datos;
  console.log("📤 postUserRole enviando:", userRoleData);

  const response = await fetch(`${URL_API}/api/UserRole`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userRoleData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/UserRole ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putUserRole = (datos: UserRole, id: number | string) =>
  fetch(`${URL_API}/api/UserRole/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteUserRole = (id: number | string) =>
  fetch(`${URL_API}/api/UserRole/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });