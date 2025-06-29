import type { Auditory } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getAuditory = async (): Promise<Auditory[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/Auditory`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: Auditory[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("La auditoria no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postAuditory = async (datos: Auditory): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...AuditoryData } = datos;
        console.log("Datos enviados a postAuditory:", AuditoryData);

        const response = await fetch(`${URL_API}/api/Auditory`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(AuditoryData)
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

export const putAuditory = async (datos: Auditory, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/Auditory/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteAuditory = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/Auditory/${id}`, {
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