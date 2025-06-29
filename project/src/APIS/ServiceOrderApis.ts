import type { ServiceOrder } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getServiceOrder = async (): Promise<ServiceOrder[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/ServiceOrder`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: ServiceOrder[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El ServiceOrder no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postServiceOrder = async (datos: ServiceOrder): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...serviceOrderData } = datos;
        console.log("Datos enviados a postServiceOrder:", serviceOrderData);

        const response = await fetch(`${URL_API}/api/ServiceOrder`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(serviceOrderData)
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

export const generateServiceOrder = async (serviceOrderId: number, datos: ServiceOrder): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...serviceOrderData } = datos;
        console.log("Datos enviados a postServiceOrder:", serviceOrderData);

        const response = await fetch(`${URL_API}/api/ServiceOrder/${serviceOrderId}/details`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(serviceOrderData)
        });
        const result = await response.json(); // Siempre intenta leer el JSON
        return result;
    } catch (error) {
        console.error('Error en la solicitud POST:', error);
    }
}

export const putServiceOrder = async (datos: ServiceOrder, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/ServiceOrder/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteServiceOrder = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/ServiceOrder/${id}`, {
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