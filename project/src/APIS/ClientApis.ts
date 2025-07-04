import type { Client } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getClient = async (): Promise<Client[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Client`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Client falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getClient:", error);
  }
  return null;
};


export const postClient = async (datos: Client): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...clientData } = datos;
  console.log("📤 postClient enviando:", clientData);

  const response = await fetch(`${URL_API}/api/Client`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(clientData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Client ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putClient = (datos: Client, id: number | string) =>
  fetch(`${URL_API}/api/Client/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteClient = (id: number | string) =>
  fetch(`${URL_API}/api/Client/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });