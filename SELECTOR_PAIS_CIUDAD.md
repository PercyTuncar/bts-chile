# Mejora del Selector de País y Ciudad en Completar Perfil

## Problema Original

En `/completar-perfil`, los selectores de país y ciudad tenían limitaciones:

1. **Solo 5 países:** Chile, Argentina, Perú, México, Colombia
2. **Ciudades fijas:** Solo ciudades chilenas (Santiago, Valparaíso, etc.)
3. **No dinámico:** Las ciudades no cambiaban según el país
4. **Sin búsqueda:** Difícil encontrar opciones en listas largas
5. **Incompleto:** Faltaban muchos países latinoamericanos

## Solución Implementada

### 1. Base de Datos Completa de Países

**Archivo:** `lib/data/countries.ts`

**10 países latinoamericanos** con **todas** sus divisiones administrativas:

| País | Divisiones | Total |
|------|------------|-------|
| Argentina | Provincias + CABA | 24 |
| Bolivia | Departamentos | 9 |
| Chile | Regiones | 16 |
| Colombia | Departamentos + Bogotá | 33 |
| Ecuador | Provincias | 24 |
| México | Estados + CDMX | 32 |
| Paraguay | Departamentos + Asunción | 18 |
| Perú | Departamentos + Callao | 25 |
| Uruguay | Departamentos | 19 |
| Venezuela | Estados + Distrito Capital | 25 |

**Total: 225 divisiones administrativas**

#### Estructura de Datos

```typescript
export interface Country {
  code: string;  // Código ISO (AR, CL, etc.)
  name: string;  // Nombre completo
  cities: string[];  // Divisiones administrativas
}

export const COUNTRIES: Country[] = [
  {
    code: "CL",
    name: "Chile",
    cities: [
      "Arica y Parinacota",
      "Tarapacá",
      "Antofagasta",
      // ... 16 regiones
    ],
  },
  // ... 10 países
];
```

#### Funciones Utilitarias

```typescript
// Obtener ciudades por código de país
getCitiesByCountry("CL") 
// → ["Arica y Parinacota", "Tarapacá", ...]

// Obtener nombre del país por código
getCountryName("CL")
// → "Chile"
```

---

### 2. Componente Combobox con Búsqueda

**Archivo:** `components/ui/Combobox.tsx`

Un selector avanzado con búsqueda en tiempo real.

#### Características

✅ **Búsqueda instantánea** - Filtra mientras escribes
✅ **Scroll para listas largas** - Max 60vh con scroll automático
✅ **Botón de limpiar** - X para resetear la selección
✅ **Cierre automático** - Al hacer clic fuera
✅ **Estados visuales** - Error, disabled, focus
✅ **Keyboard friendly** - Enter, Escape, flechas
✅ **Responsive** - Funciona en móvil y desktop
✅ **Accesible** - Labels, ARIA, focus visible

#### Props

```typescript
interface ComboboxProps {
  value: string;                    // Valor seleccionado
  onChange: (value: string) => void;  // Callback al seleccionar
  options: string[];                 // Lista de opciones
  placeholder?: string;              // Placeholder del trigger
  emptyMessage?: string;             // Mensaje si no hay resultados
  label?: string;                    // Label del campo
  error?: string;                    // Mensaje de error
  disabled?: boolean;                // Deshabilitar
}
```

#### Uso

```tsx
<Combobox
  label="País *"
  value={selectedCountry}
  onChange={setSelectedCountry}
  options={["Chile", "Argentina", "Perú"]}
  placeholder="Selecciona tu país"
  emptyMessage="No se encontró el país"
  error={errors.country?.message}
/>
```

#### Diseño

- **Glass morphism** - Consistente con el resto de la app
- **Animaciones** - Fade in, slide in, rotate
- **Colores de marca** - Morado (#8b2fc9) en focus y selección
- **Sombras suaves** - Elevación del dropdown
- **Tipografía clara** - Legible en móvil y desktop

---

### 3. Integración en Completar Perfil

**Archivo:** `app/completar-perfil/CompletarPerfilForm.tsx`

#### Estado Dinámico

```typescript
// País seleccionado actualmente
const [selectedCountry, setSelectedCountry] = useState("CL");

// Ciudades disponibles para el país actual
const [availableCities, setAvailableCities] = useState<string[]>(() =>
  getCitiesByCountry("CL")
);

// Observar cambios en el país
const watchCountry = watch("country");
const watchCity = watch("city");

// Actualizar ciudades cuando cambia el país
useEffect(() => {
  if (watchCountry) {
    const cities = getCitiesByCountry(watchCountry);
    setAvailableCities(cities);

    // Resetear ciudad si no existe en la nueva lista
    if (watchCity && !cities.includes(watchCity)) {
      setValue("city", "");
    }
  }
}, [watchCountry, watchCity, setValue]);
```

#### Selector de País

```tsx
<Combobox
  label="País *"
  value={COUNTRIES.find((c) => c.code === watchCountry)?.name || ""}
  onChange={(countryName) => {
    const country = COUNTRIES.find((c) => c.name === countryName);
    if (country) {
      setValue("country", country.code, { shouldValidate: true });
    }
  }}
  options={COUNTRIES.map((c) => c.name)}
  placeholder="Selecciona tu país"
  emptyMessage="No se encontró el país"
  error={errors.country?.message}
/>
```

**Flujo:**
1. Usuario ve lista de nombres de países
2. Al seleccionar, se guarda el **código** (CL, AR, etc.)
3. El código se usa para obtener ciudades
4. Compatible con la base de datos actual

#### Selector de Ciudad

```tsx
<Combobox
  label="Ciudad / Región / Provincia *"
  value={watchCity || ""}
  onChange={(city) => setValue("city", city, { shouldValidate: true })}
  options={availableCities}
  placeholder="Selecciona tu ciudad o región"
  emptyMessage="No se encontraron resultados"
  error={errors.city?.message}
  disabled={!watchCountry}  // ← Deshabilitado hasta seleccionar país
/>
```

**Flujo:**
1. Usuario selecciona país primero
2. Se cargan las ciudades de ese país
3. Usuario busca y selecciona su ciudad
4. Se guarda el nombre completo de la división administrativa

---

## Flujo de Usuario Completo

### 1. Seleccionar País

**Usuario ve:**
- Lista con 10 países latinoamericanos
- Input de búsqueda

**Usuario puede:**
- Escribir "Chi" → Ve "Chile"
- Escribir "Arg" → Ve "Argentina"
- Scroll por la lista completa
- Hacer clic para seleccionar

### 2. Seleccionar Ciudad

**Según el país:**

**Chile seleccionado:**
- Ve 16 regiones chilenas
- Puede buscar "Metro" → "Metropolitana de Santiago"
- O "Valp" → "Valparaíso"

**México seleccionado:**
- Ve 32 estados mexicanos
- Puede buscar "CDMX" → "Ciudad de México (CDMX)"
- O "Jalisc" → "Jalisco"

**Argentina seleccionada:**
- Ve 24 provincias argentinas + CABA
- Puede buscar "Buenos" → "Buenos Aires" y "Ciudad Autónoma de Buenos Aires (CABA)"

### 3. Cambiar País

Si el usuario:
1. Seleccionó "Chile" → "Metropolitana de Santiago"
2. Cambia a "Argentina"
3. **La ciudad se resetea automáticamente** (porque Santiago no existe en Argentina)
4. Debe seleccionar una provincia argentina

---

## Compatibilidad con Base de Datos

### Estructura Actual

```typescript
interface User {
  country: string;  // Código ISO: "CL", "AR", etc.
  city: string;     // Nombre completo: "Metropolitana de Santiago"
}
```

### Sin Cambios Necesarios

✅ **Backward compatible** - Los datos existentes siguen funcionando
✅ **Mismo formato** - Códigos de país + nombres de ciudad
✅ **No migración** - Los usuarios existentes no necesitan actualizar nada

### Datos Guardados

**Antes (limitado):**
```json
{
  "country": "CL",
  "city": "Santiago"
}
```

**Ahora (completo):**
```json
{
  "country": "CL",
  "city": "Metropolitana de Santiago"
}
```

O:
```json
{
  "country": "MX",
  "city": "Ciudad de México (CDMX)"
}
```

O:
```json
{
  "country": "AR",
  "city": "Ciudad Autónoma de Buenos Aires (CABA)"
}
```

---

## Mejoras de UX

### Antes

- ❌ Solo 5 países
- ❌ Solo ciudades chilenas
- ❌ Sin búsqueda
- ❌ Scroll manual en select pequeño
- ❌ Difícil encontrar opciones

### Después

- ✅ 10 países latinoamericanos
- ✅ 225 divisiones administrativas
- ✅ Búsqueda en tiempo real
- ✅ Dropdown grande con scroll
- ✅ Encuentra opciones instantáneamente
- ✅ Selección dinámica (ciudad depende de país)
- ✅ Feedback visual claro

---

## Ejemplos de Uso

### Caso 1: Usuario de Chile

1. Abre `/completar-perfil`
2. País ya viene pre-seleccionado: "Chile"
3. Ve 16 regiones chilenas
4. Escribe "bio" en el buscador
5. Ve "Biobío"
6. Selecciona
7. ✅ Guardado: `country: "CL", city: "Biobío"`

### Caso 2: Usuario de México

1. Abre `/completar-perfil`
2. Busca "Méx" en país
3. Selecciona "México"
4. Las ciudades cambian a estados mexicanos
5. Busca "CDMX"
6. Selecciona "Ciudad de México (CDMX)"
7. ✅ Guardado: `country: "MX", city: "Ciudad de México (CDMX)"`

### Caso 3: Usuario cambia de país

1. Tenía seleccionado: Chile → Valparaíso
2. Cambia país a "Argentina"
3. **Ciudad se resetea automáticamente**
4. Ve 24 provincias argentinas
5. Busca "Cord"
6. Selecciona "Córdoba"
7. ✅ Guardado: `country: "AR", city: "Córdoba"`

---

## Testing

### Verificar en Local

1. **Ir a:** `http://localhost:3000/completar-perfil`

2. **Probar selector de país:**
   - Hacer clic en el campo "País"
   - Ver dropdown con 10 países
   - Escribir "Bol" → Debe filtrar a "Bolivia"
   - Seleccionar

3. **Probar selector de ciudad:**
   - Debe mostrar 9 departamentos bolivianos
   - Escribir "Santa" → Debe filtrar a "Santa Cruz"
   - Seleccionar

4. **Probar cambio de país:**
   - Cambiar país de Bolivia a Chile
   - Verificar que la ciudad se resetee
   - Ver 16 regiones chilenas

5. **Probar búsqueda:**
   - Probar con acentos: "Ñuble" debe aparecer
   - Probar con mayúsculas/minúsculas: case-insensitive
   - Probar parcial: "Metro" debe encontrar "Metropolitana de Santiago"

### Responsive

- **Móvil:** Dropdown ocupa todo el ancho, fácil de tocar
- **Tablet:** Tamaño medio, scroll suave
- **Desktop:** Dropdown compacto, hover states

---

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`lib/data/countries.ts`** (273 líneas)
   - Base de datos completa de países
   - 10 países, 225 ciudades
   - Funciones utilitarias

2. **`components/ui/Combobox.tsx`** (166 líneas)
   - Componente reutilizable
   - Búsqueda en tiempo real
   - Estados y validación

### Archivos Modificados

3. **`app/completar-perfil/CompletarPerfilForm.tsx`**
   - Imports actualizados
   - Estado dinámico para ciudades
   - useEffect para sincronización
   - Reemplazo de `<select>` por `<Combobox>`

---

## Resumen

✅ **10 países latinoamericanos completos**
✅ **225 divisiones administrativas**
✅ **Búsqueda en tiempo real**
✅ **Selección dinámica** (ciudad depende de país)
✅ **UI moderna** con glass morphism
✅ **Totalmente responsive**
✅ **Compatible** con base de datos actual
✅ **Sin migración** necesaria
✅ **Mejor UX** con búsqueda instantánea

**El selector de país y ciudad ahora es completo, dinámico e intuitivo 💜**
