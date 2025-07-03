import type { ServiceType } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getServiceType = async (): Promise<ServiceType[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/ServiceType`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/ServiceType falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getServiceType:", error);
  }
  return null;
};


export const postServiceType = async (datos: ServiceType): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...serviceTypeData } = datos;
  console.log("📤 postServiceType enviando:", serviceTypeData);

  const response = await fetch(`${URL_API}/api/ServiceType`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(serviceTypeData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/ServiceType ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putServiceType = (datos: ServiceType, id: number | string) =>
  fetch(`${URL_API}/api/ServiceType/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteServiceType = (id: number | string) =>
  fetch(`${URL_API}/api/ServiceType/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });