import type { User } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getUser = async (): Promise<User[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/User`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/User falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getUser:", error);
  }
  return null;
};


export const postUser = async (datos: User): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...userData } = datos;
  console.log("📤 postAuditory enviando:", userData);

  const response = await fetch(`${URL_API}/api/User`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/User ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putUser = (datos: User, id: number | string) =>
  fetch(`${URL_API}/api/User/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteUser = (id: number | string) =>
  fetch(`${URL_API}/api/User/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });