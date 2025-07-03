import type { DetailsDiagnostic } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getDetailsDiagnosticc = async (): Promise<DetailsDiagnostic[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/DetailsDiagnostic`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/DetailsDiagnostic falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getDetailsDiagnostic:", error);
  }
  return null;
};


export const postDetailsDiagnostic = async (datos: DetailsDiagnostic): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...detailsDiagnosticData } = datos;
  console.log("📤 postState enviando:", detailsDiagnosticData);

  const response = await fetch(`${URL_API}/api/DetailsDiagnostic`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(detailsDiagnosticData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/DetailsDiagnostic ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putDetailsDiagnostic = (datos: DetailsDiagnostic, id: number | string) =>
  fetch(`${URL_API}/api/DetailsDiagnostic/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteDetailsDiagnostic = (id: number | string) =>
  fetch(`${URL_API}/api/DetailsDiagnostic/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });