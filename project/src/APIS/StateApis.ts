import type { State } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getState = async (): Promise<State[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/State`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/State falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getState:", error);
  }
  return null;
};


export const postState = async (datos: State): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...stateData } = datos;
  console.log("📤 postState enviando:", stateData);

  const response = await fetch(`${URL_API}/api/State`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(stateData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/State ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putState = (datos: State, id: number | string) =>
  fetch(`${URL_API}/api/State/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteState = (id: number | string) =>
  fetch(`${URL_API}/api/State/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });