import type { ServiceType } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getServiceType = async (): Promise<ServiceType[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/ServiceType`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: ServiceType[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El ServiceType no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postServiceType = async (datos: ServiceType): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...serviceOrderData } = datos;
        console.log("Datos enviados a postServiceType:", serviceOrderData);

        const response = await fetch(`${URL_API}/api/ServiceType`, {
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

export const generateServiceType = async (serviceTypeId: number, datos: ServiceType): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...serviceTypeData } = datos;
        console.log("Datos enviados a postServiceType:", serviceTypeData);

        const response = await fetch(`${URL_API}/api/ServiceType/${serviceTypeId}/details`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(serviceTypeData)
        });
        const result = await response.json(); // Siempre intenta leer el JSON
        return result;
    } catch (error) {
        console.error('Error en la solicitud POST:', error);
    }
}

export const putServiceType = async (datos: ServiceType, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/ServiceType/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteServiceType = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/ServiceType/${id}`, {
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