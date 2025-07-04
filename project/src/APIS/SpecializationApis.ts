import type { Specialization } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getSpecialization = async (): Promise<Specialization[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Specialization`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Specialization falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getState:", error);
  }
  return null;
};


export const postSpecialization = async (datos: Specialization): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...specializationData } = datos;
  console.log("📤 postSpecialization enviando:", specializationData);

  const response = await fetch(`${URL_API}/api/Specialization`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(specializationData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/State ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putSpecialization = (datos: Specialization, id: number | string) =>
  fetch(`${URL_API}/api/Specialization/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteSpecialization = (id: number | string) =>
  fetch(`${URL_API}/api/Specialization/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });