import type { UserRole } from "../types";

const URL_API = "http://localhost:5070";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getUserRole = async (): Promise<UserRole[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/UserRole`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: UserRole[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El UserRol no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postUserRole = async (datos: UserRole): Promise<any | undefined> => {
    try {
        console.log("Datos enviados a postUserRole:", datos);

        const response = await fetch(`${URL_API}/api/UserRol`, {
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

export const putUserRole = async (datos: UserRole, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/UserRole/{idUser}/{idRole}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteUserRole = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/UserRole/{idUser}/{idRole}`, {
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