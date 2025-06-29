import type { Invoice } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getInvoice = async (): Promise<Invoice[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/Invoice`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: Invoice[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El Invoice no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postInvoice = async (datos: Invoice): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...invoiceData } = datos;
        console.log("Datos enviados a postInvoice:", invoiceData);

        const response = await fetch(`${URL_API}/api/Invoice`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(invoiceData)
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en la solicitud POST: ${response.status} - ${errorText}`);
            return undefined;
        }
        return await response.json();
    } catch (error) {
        console.error('Error en la solicitud POST:', error);
    }
}

export const generateInvoice = async (
  serviceOrderId: number
): Promise<any | undefined> => {
  try {
    console.log("Generando factura para service order:", serviceOrderId);

    const response = await fetch(`${URL_API}/api/Invoice/generate/${serviceOrderId}`, {
      method: "POST",
      headers: myHeaders
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


export const putInvoice = async (datos: Invoice, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/Invoice/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteInvoice = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/Invoice/${id}`, {
            method: "DELETE",
            headers: myHeaders,
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en la solicitud DELETE: ${response.status} - ${errorText}`);
        }
        return response;
    } catch (error) {
        console.error('Error en la solicitud DELETE:', error);
    }
}