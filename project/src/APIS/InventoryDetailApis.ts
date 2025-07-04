import type { InventoryDetail } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getInventoryDetail = async (): Promise<InventoryDetail[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/InventoryDetail`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/InventoryDetail falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getInventoryDetail:", error);
  }
  return null;
};


export const postInventoryDetail = async (datos: InventoryDetail): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...inventoryDetailData } = datos;
  console.log("📤 postInventoryDetail enviando:", inventoryDetailData);

  const response = await fetch(`${URL_API}/api/InventoryDetail`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(inventoryDetailData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/InventoryDetail ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putInventoryDetail = (datos: InventoryDetail, id: number | string) =>
  fetch(`${URL_API}/api/InventoryDetail/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteInventoryDetail = (id: number | string) =>
  fetch(`${URL_API}/api/InventoryDetail/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });