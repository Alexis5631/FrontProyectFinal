import type { UserSpecialization } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getUserSpecialization = async (): Promise<UserSpecialization[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/UserSpecialization`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/UserSpecialization falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getState:", error);
  }
  return null;
};


export const postUserSpecialization = async (datos: UserSpecialization): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...userSpecializationData } = datos;
  console.log("📤 postUserSpecialization enviando:", userSpecializationData);

  const response = await fetch(`${URL_API}/api/UserSpecialization`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userSpecializationData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/UserSpecialization ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putUserSpecialization = (datos: UserSpecialization, id: number | string) =>
  fetch(`${URL_API}/api/UserSpecialization/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteUserSpecialization = (id: number | string) =>
  fetch(`${URL_API}/api/UserSpecialization/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });