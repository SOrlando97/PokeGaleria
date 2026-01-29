# Pokemon Gallery

Aplicación web desarrollada en Angular 17+ que muestra una galería de 30 pokemones aleatorios.
Proyecto desarrollado para prueba técnica.

## Características

- **Galería Aleatoria**: Carga 30 pokemones distintos cada vez que se recarga la aplicación.
- **Detalle Modal**: Al hacer clic (o "Ver Detalle"), se abre un modal con información extendida (tpos, habilidades, peso, altura).
- **Rutas Sincronizadas**: La URL se actualiza al abrir el detalle (`/pokemon/:name`). Si se ingresa directamente por URL, se abre el modal correspondiente.
- **UI Moderna**: Utiliza Angular Material y Bootstrap para un diseño responsivo y limpio.

## Tecnologías

- Angular 17 (Standalone Components)
- Angular Material (Dialog, Cards, Chips, Buttons)
- Bootstrap 5 (Grid System, Utilities)
- PokeAPI (Fuente de datos)

## Instalación y Ejecución

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Ejecutar servidor de desarrollo**:
    ```bash
    npm start
    ```
    La aplicación estará disponible en `http://localhost:4200/`.

## Estructura del Proyecto

- `src/app/core/services/pokemon.service.ts`: Servicio para la comunicación con PokeAPI.
- `src/app/features/pokemon-list/`: Componente principal que muestra la grilla.
- `src/app/features/pokemon-detail/`: Componente del modal de detalle.
