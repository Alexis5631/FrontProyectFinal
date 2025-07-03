import type { OrderDetails } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getOrderDetails = async (): Promise<OrderDetails[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/OrderDetails`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/OrderDetails falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getOrderDetails:", error);
  }
  return null;
};


export const postOrderDetails = async (datos: OrderDetails): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...orderDetailsData } = datos;
  console.log("📤 postOrderDetails enviando:", orderDetailsData);

  const response = await fetch(`${URL_API}/api/OrderDetails`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(orderDetailsData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/OrderDetails ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putOrderDetails = (datos: OrderDetails, id: number | string) =>
  fetch(`${URL_API}/api/OrderDetails/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteOrderDetails = (id: number | string) =>
  fetch(`${URL_API}/api/OrderDetails/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });