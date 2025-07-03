import type { Vehicle } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getVehicle = async (): Promise<Vehicle[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Vehicle`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Vehicle falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getVehicle:", error);
  }
  return null;
};


export const postVehicle = async (datos: Vehicle): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...vehicleData } = datos;
  console.log("📤 postVehicle enviando:", vehicleData);

  const response = await fetch(`${URL_API}/api/Vehicle`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(vehicleData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Vehicle ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putVehicle = (datos: Vehicle, id: number | string) =>
  fetch(`${URL_API}/api/Vehicle/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteVehicle = (id: number | string) =>
  fetch(`${URL_API}/api/Vehicle/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });