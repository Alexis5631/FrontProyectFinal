import type { Inventory } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getInventory = async (): Promise<Inventory[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/Inventory`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: Inventory[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El Inventario no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postInventory = async (datos: Inventory): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...clientData } = datos;
        console.log("Datos enviados a postInventory:", clientData);

        const response = await fetch(`${URL_API}/api/Inventory`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(clientData)
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

export const putInventory = async (datos: Inventory, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/Inventory/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteInventory = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/Inventory/${id}`, {
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