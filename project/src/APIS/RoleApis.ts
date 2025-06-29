import type { Role } from "../types";

const URL_API = "http://localhost:5070";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getRole = async (): Promise<Role[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/Role`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: Role[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El rol no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postRole = async (datos: Role): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...rolData } = datos;
        console.log("Datos enviados a postRole:", rolData);

        const response = await fetch(`${URL_API}/api/Role`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(rolData)
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

export const putRole = async (datos: Role, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/Role/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteRole = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/Role/${id}`, {
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