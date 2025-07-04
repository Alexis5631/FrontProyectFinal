import type { Inventory } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getInventory = async (): Promise<Inventory[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Inventory`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Inventory falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getInventory:", error);
  }
  return null;
};


export const postInventory = async (datos: Inventory): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...inventoryData } = datos;
  console.log("📤 postInventory enviando:", inventoryData);

  const response = await fetch(`${URL_API}/api/Inventory`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(inventoryData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Inventory ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putInventory = (datos: Inventory, id: number | string) =>
  fetch(`${URL_API}/api/Inventory/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteInventory = (id: number | string) =>
  fetch(`${URL_API}/api/Inventor/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });