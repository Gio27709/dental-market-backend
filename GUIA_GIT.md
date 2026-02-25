# Guía Básica de Git 🚀

Aquí tienes los comandos que usarás el 90% del tiempo y el flujo correcto para guardar tu trabajo.

## 1. El "Padre Nuestro" de Git (Subir Cambios)

Cada vez que quieras guardar tu trabajo y subirlo a la nube (GitHub/GitLab), sigue esta secuencia sagrada:

1.  **Ver qué cambiaste** (Opcional pero recomendado)

    ```bash
    git status
    ```

    _Te muestra en rojo lo que has modificado._

2.  **Preparar los archivos** (El "Escenario")

    ```bash
    git add .
    ```

    _El punto `.` significa "todo". Agrega todos los archivos modificados a la lista de espera para ser guardados._

3.  **Guardar la foto** (Commit)

    ```bash
    git commit -m "Aquí describe qué hiciste"
    ```

    _Crea un punto en la historia. **Siempre** pon un mensaje descriptivo._

4.  **Subir a la nube** (Push)
    ```bash
    git push origin nombre-de-tu-rama
    ```
    _En tu caso sería: `git push origin giovany`_

---

## 2. Otros Comandos Vitales

### Ramas (Branches)

- **Crear una rama nueva y mudarse a ella:**
  ```bash
  git checkout -b nombre-nueva-rama
  ```
- **Cambiar de rama (mudarse):**
  ```bash
  git checkout nombre-rama-existente
  ```
- **Ver todas las ramas:**
  ```bash
  git branch
  ```
- **Borrar una rama:**
  ```bash
  git branch -D nombre-rama
  ```

### Actualizar tu Código

- **Traer cambios de la nube a tu compu:**
  ```bash
  git pull origin nombre-rama
  ```
  _Ejemplo: Si quieres actualizar tu master: `git checkout master` y luego `git pull origin master`._

### Deshacer y Arreglar

- **Ver el historial de cambios:**
  ```bash
  git log --oneline
  ```
- **Descartar cambios en un archivo (¡Cuidado!):**
  ```bash
  git checkout -- nombre-archivo
  ```

## Resumen Visual del Flujo Diario

1. `git pull` (Al empezar el día, para tener lo último)
2. _...Trabajas y codificas..._
3. `git add .`
4. `git commit -m "avance tarea X"`
5. `git push origin tu-rama`
