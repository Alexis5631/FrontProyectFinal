# Fronet_ASP.NET

Este proyecto es una aplicación web desarrollada con React (TypeScript) para la gestión integral de un taller automotriz. El frontend consume una API ASP.NET para realizar operaciones CRUD sobre diferentes entidades como vehículos, clientes, órdenes de servicio, repuestos, facturación, auditoría y más.

## Propósito
El objetivo principal es facilitar la administración de un taller mecánico, permitiendo llevar un control eficiente de:
- Clientes y sus vehículos
- Órdenes de servicio y su seguimiento
- Inventario de repuestos y partes
- Facturación y generación de reportes
- Auditoría de acciones y seguridad

## Características principales
- Interfaz moderna y responsiva
- Gestión de usuarios y roles
- Filtros, búsquedas y paginación en tablas
- Formularios para crear, editar y visualizar información
- Integración directa con endpoints de una API ASP.NET
- Manejo de autenticación y autorización

## Estructura
- **/project/src/pages/**: Contiene las páginas principales del sistema (clientes, vehículos, órdenes, partes, facturas, auditoría, etc.)
- **/project/src/APIS/**: Funciones para consumir los endpoints de la API ASP.NET
- **/project/src/components/**: Componentes reutilizables de la interfaz
- **/project/src/types/**: Definición de tipos y modelos de datos

## Instalación y ejecución
1. Instala las dependencias con `npm install` o `yarn install`.
2. Ejecuta el frontend con `npm run dev` o `yarn dev`.
3. Asegúrate de tener corriendo la API ASP.NET en el backend.

---

Este proyecto es ideal para talleres automotrices que buscan digitalizar y optimizar su gestión diaria de manera sencilla y eficiente. 