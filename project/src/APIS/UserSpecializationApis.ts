import type { UserSpecialization } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getUserSpecialization = async (): Promise<UserSpecialization[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/UserSpecialization`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: UserSpecialization[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El UserSpecialization no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postUserSpecialization = async (datos: UserSpecialization): Promise<any | undefined> => {
    try {
        console.log("Datos enviados a postUserSpecialization:", datos);

        const response = await fetch(`${URL_API}/api/InventoryDetail`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(datos)
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

export const putUserSpecialization = async (datos: UserSpecialization, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/UserSpecialization/{idUser}/{idSpecialization}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteUserSpecialization = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/UserSpecialization/{idUser}/{idSpecialization}`, {
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