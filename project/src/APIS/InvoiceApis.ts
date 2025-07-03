import type { Invoice } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getInvoice = async (): Promise<Invoice[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Invoice`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Invoice falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getInvoice:", error);
  }
  return null;
};


export const postInvoice = async (datos: Invoice): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...clientData } = datos;
  console.log("📤 postInvoice enviando:", clientData);

  const response = await fetch(`${URL_API}/api/Invoice`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(clientData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Invoice ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putInvoice = (datos: Invoice, id: number | string) =>
  fetch(`${URL_API}/api/Invoice/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteInvoice = (id: number | string) =>
  fetch(`${URL_API}/api/Invoice/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

export const generateInvoice = async (
  serviceOrderId: number
): Promise<any | undefined> => {
  try {
    console.log("Generando factura para service order:", serviceOrderId);

    const response = await fetch(`${URL_API}/api/Invoice/generate/${serviceOrderId}`, {
      method: "POST",
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en la solicitud POST: ${response.status} - ${errorText}`);
      return undefined;
    }

    const result = await response.json();
    console.log("Factura generada exitosamente:", result);
    return result;

  } catch (error) {
    console.error('Error en la solicitud POST:', error);
    return undefined;
  }
};