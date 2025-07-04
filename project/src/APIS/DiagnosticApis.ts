import type { Diagnostic } from "../types";

const URL_API = "http://localhost:5202";

function getHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export const getDiagnostic = async (): Promise<Diagnostic[] | null> => {
  try {
    const response = await fetch(`${URL_API}/api/Diagnostic`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    console.error(`GET /api/Diagnostic falló con status ${response.status}`);
  } catch (error) {
    console.error("Error de red o servidor en getDiagnostic:", error);
  }
  return null;
};


export const postDiagnostic = async (datos: Diagnostic): Promise<any> => {
  // 2) quitamos el id antes de enviar
  const { id, ...diagnosticData } = datos;
  console.log("📤 postDiagnostic enviando:", diagnosticData);

  const response = await fetch(`${URL_API}/api/Diagnostic`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(diagnosticData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`POST /api/Diagnostic ERROR ${response.status}:`, errorText);
    throw new Error(errorText || `Error ${response.status}`);
  }

  // 3) el servidor responde con Created (201) y el objeto creado (incluyendo el nuevo id)
  return response.json();
};

export const putDiagnostic = (datos: Diagnostic, id: number | string) =>
  fetch(`${URL_API}/api/Diagnostic/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });


export const deleteDiagnostic = (id: number | string) =>
  fetch(`${URL_API}/api/Diagnostic/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });