import type { OrderDetails } from "../types";

const URL_API = "http://localhost:5202";
const myHeaders = new Headers({
    "Content-Type": "application/json"
});

export const getOrderDetails = async (): Promise<OrderDetails[] | null> => {
    try {
        const response = await fetch(`${URL_API}/api/OrderDetails`, {
            method: 'GET',
            headers: myHeaders
        });

        switch (response.status) {
            case 200:
                const data: OrderDetails[] = await response.json();
                return data;
            case 401:
                console.error("No autorizado o token inválido");
                break;
            case 404:
                console.error("El OrderDetails no existe");
                break;
            default:
                console.error("Error inesperado. Contacte al administrador.");
        }
    } catch (error) {
        console.error("Error de red o servidor:", error);
    }

    return null; // en caso de error
};

export const postOrderDetails = async (datos: OrderDetails): Promise<any | undefined> => {
    try {
        // Remove id if present
        const { id, ...orderDetailsData } = datos;
        console.log("Datos enviados a postOrderDetails:", orderDetailsData);

        const response = await fetch(`${URL_API}/api/OrderDetails`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(orderDetailsData)
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

export const putOrderDetails = async (datos: OrderDetails, id: number | string): Promise<Response | undefined> => {
    try {
        return await fetch(`${URL_API}/api/OrderDetails/${id}`, {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error('Error en la solicitud PUT:', error);
    }
}

export const deleteOrderDetails = async (id: number | string): Promise<Response | undefined> => {
    try {
        const response = await fetch(`${URL_API}/api/OrderDetails/${id}`, {
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