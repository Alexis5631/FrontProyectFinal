import type { Vehicle } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getVehicle = async (): Promise<Vehicle[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/Vehicle`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: Vehicle[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El vehiculo no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postVehicle = async (datos: Vehicle): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...vehicleData } = datos;
        console.log("Datos enviados a postVehicle:", vehicleData);

        const response = await fetch(`${URL_API}/api/Vehicle`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(vehicleData)
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

export const putVehicle = async (datos: Vehicle, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/Vehicle/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteVehicle = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/Vehicle/${id}`, {
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