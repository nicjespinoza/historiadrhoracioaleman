# Proceso de Despliegue a Producción Seguro

Este documento detalla cómo llevar tu aplicación a producción sin poner en riesgo la estabilidad del código existente.

## 1. Estrategia de Ramas (Branching Strategy)

Para evitar afectar el código en producción directamente, se recomienda seguir el flujo **Gitflow** o una variación simplificada:

*   **`main` (o `master`)**: Esta rama contiene ÚNICAMENTE el código que está actualmente en producción. Debe ser sagrada y estable.
*   **`develop`**: Aquí es donde se integra todo el trabajo nuevo. Los desarrolladores trabajan en ramas de funcionalidades (`feature/nueva-funcionalidad`) y las unen a `develop`.
*   **`staging`** (Opcional pero recomendado): Una rama intermedia para probar antes de pasar a producción.

### Flujo de trabajo recomendado:

1.  **Desarrollo**: Creas una nueva rama para tu trabajo:
    ```bash
    git checkout -b feature/nueva-funcionalidad
    ```
2.  **Guardar cambios**: Haces tus commits y pruebas localmente.
3.  **Integración**: Cuando terminas, subes tu rama y creas un "Pull Request" (PR) hacia `develop`.
4.  **Pruebas**: Si todo funciona en `develop`, se crea un PR hacia `main` (o `staging` primero).

## 2. CI/CD (Integración y Despliegue Continuo)

Automatizar el proceso reduce errores humanos. Herramientas como **GitHub Actions**, **Vercel**, o **Netlify** son ideales.

### Ejemplo con Vercel/Netlify:
*   Configura tu proyecto para que **solo** se despliegue a producción cuando haya cambios en la rama `main`.
*   Las otras ramas pueden generar "Preview Deployments" (vistas previas) que te permiten ver los cambios en un enlace temporal antes de que sean reales.

## 3. Pasos para Desplegar (Manual o Automático)

Si decides hacerlo manualmente para tener control total:

1.  **Asegúrate de estar en la rama correcta y actualizado:**
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Construye el proyecto (Build):**
    Esto verifica que no haya errores de compilación.
    ```bash
    npm run build
    ```
    *Si este paso falla, NO despliegues.*

3.  **Fusionar cambios probados:**
    Trae los cambios de tu rama de desarrollo.
    ```bash
    git merge develop
    ```

4.  **Etiquetar la versión (Tagging):**
    Es buena práctica poner una etiqueta a cada versión que sube a producción.
    ```bash
    git tag -a v1.0.0 -m "Versión 1.0.0 - Lanzamiento inicial"
    git push origin v1.0.0
    ```

## 4. Rollback (Plan de Respaldo)

Si algo sale mal en producción:
*   En **Vercel/Netlify**: Puedes revertir a la versión anterior con un solo clic en su panel de control.
*   En **Servidor propio**: Puedes hacer checkout a la etiqueta anterior:
    ```bash
    git checkout v0.9.9
    ```

## Resumen para tu caso actual

Ya que has subido todo a `main`, tu código actual es la "verdad". Para el futuro:

1.  No trabajes directo en `main`.
2.  Crea `git checkout -b develop` y trabaja ahí.
3.  Solo cuando estés 100% seguro, fusiona `develop` en `main`.
