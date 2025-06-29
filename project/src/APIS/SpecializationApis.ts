import type { Specialization } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getSpecialization = async (): Promise<Specialization[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/Specialization`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: Specialization[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("La especialización no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postSpecialization = async (datos: Specialization): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...SpecializationData } = datos;
        console.log("Datos enviados a postSpecialization:", SpecializationData);

        const response = await fetch(`${URL_API}/api/Specialization`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(SpecializationData)
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

export const putSpecialization = async (datos: Specialization, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/Specialization/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteSpecialization = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/Specialization/${id}`, {
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