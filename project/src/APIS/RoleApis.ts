import type { Role } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getRole = async (): Promise<Role[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Role`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Role falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getRole:", error);
  }
  return null;
};


export const postRole = async (datos: Role): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...roleData } = datos;
  console.log("📤 postRole enviando:", roleData);

  const response = await fetch(`${URL_API}/api/Role`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(roleData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Role ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putRole = (datos: Role, id: number | string) =>
  fetch(`${URL_API}/api/Role/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteRole = (id: number | string) =>
  fetch(`${URL_API}/api/Role/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });