import type { ServiceOrder } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getServiceOrder = async (): Promise<ServiceOrder[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/ServiceOrder`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/ServiceOrder falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getServiceOrder:", error);
  }
  return null;
};


export const postServiceOrder = async (datos: ServiceOrder): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...serviceOrderData } = datos;
  console.log("📤 postServiceOrder enviando:", serviceOrderData);

  const response = await fetch(`${URL_API}/api/ServiceOrder`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(serviceOrderData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/ServiceOrder ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putServiceOrder = (datos: ServiceOrder, id: number | string) =>
  fetch(`${URL_API}/api/ServiceOrder/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteServiceOrder = (id: number | string) =>
  fetch(`${URL_API}/api/ServiceOrder/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });