# Debug: Badge "+1" para usuarios no logueados

## Pasos para diagnosticar:

1. **Abre tu navegador en localhost (asegúrate de NO estar logueado)**

2. **Abre la consola del desarrollador:**
   - Chrome/Edge: F12 o Ctrl+Shift+I
   - Firefox: F12 o Ctrl+Shift+K

3. **Limpia el localStorage:**
   ```javascript
   localStorage.removeItem('btschile:guest-messages-badge-dismissed')
   ```
   
   O limpia todo:
   ```javascript
   localStorage.clear()
   ```

4. **Recarga la página:**
   - Ctrl+R o F5

5. **Busca en la consola mensajes que empiecen con `[MessagesIcon]`**

   Deberías ver algo como:
   ```
   [MessagesIcon] Initial render - status: loading showGuestBadge: false
   [MessagesIcon] status: unauthenticated
   [MessagesIcon] dismissed: null
   [MessagesIcon] shouldShow: true
   ```

6. **Inspecciona el elemento del badge:**
   - Click derecho en el icono de mensajes
   - Selecciona "Inspeccionar elemento"
   - Busca el span con `bg-danger` y `animate-pulse`

## Verificaciones:

### ¿Qué status ves?
- ❌ Si ves `status: loading` y nunca cambia → problema con AuthProvider
- ❌ Si ves `status: authenticated` → estás logueado (cierra sesión)
- ✅ Si ves `status: unauthenticated` → correcto

### ¿El dismissed está en null?
- ❌ Si ves `dismissed: "true"` → ya lo descartaste antes, ejecuta `localStorage.clear()`
- ✅ Si ves `dismissed: null` → correcto

### ¿El badge aparece en el HTML?
- Busca en el inspector un elemento como:
  ```html
  <span class="... bg-danger ... animate-pulse ...">+1</span>
  ```

## Forzar el badge manualmente (prueba rápida):

Si quieres ver el badge inmediatamente sin importar el estado:

1. En la consola del navegador, ejecuta:
   ```javascript
   localStorage.removeItem('btschile:guest-messages-badge-dismissed')
   ```

2. Recarga la página

## Posibles problemas:

1. **Ya visitaste la página antes y descartaste el badge**
   - Solución: Limpia localStorage

2. **Estás logueado**
   - Solución: Cierra sesión o abre una ventana de incógnito

3. **El AuthProvider no está estableciendo status correctamente**
   - Verifica los logs en consola

4. **Firebase está tardando en inicializar**
   - El status puede quedar en "loading" por mucho tiempo

---

## Resultado esperado:

Cuando NO estás logueado y NO has descartado el badge, deberías ver:

- ✅ Badge rojo con "+1" 
- ✅ Badge pulsante (animate-pulse)
- ✅ Shadow rojo alrededor del badge
- ✅ Tooltip "+1 nuevo mensaje" por 3 segundos
- ✅ Al hacer clic, el badge desaparece y se guarda en localStorage
