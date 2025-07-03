import type { Replacement } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getReplacement = async (): Promise<Replacement[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Replacement`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Replacement falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getReplacement:", error);
  }
  return null;
};


export const postReplacement = async (datos: Replacement): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...replacementData } = datos;
  console.log("📤 postReplacement enviando:", replacementData);

  const response = await fetch(`${URL_API}/api/Replacement`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(replacementData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Replacement ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putReplacement = (datos: Replacement, id: number | string) =>
  fetch(`${URL_API}/api/Replacement/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteReplacement = (id: number | string) =>
  fetch(`${URL_API}/api/Replacement/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });