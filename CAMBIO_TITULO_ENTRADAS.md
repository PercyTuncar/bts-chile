# Corrección del Título de la Página /entradas

## Problema

El título se mostraba duplicado:
- **En la web**: `Entradas BTS Chile | BTS Chile`
- **En Google**: `Entradas BTS Chile | Disponible`

## Causa

El layout.tsx tiene un template de título configurado como:
```typescript
title: {
  default: "BTS Chile",
  template: "%s | BTS Chile",
}
```

Cuando la página /entradas usaba `title: "Entradas BTS Chile"`, el template lo convertía en:
`"Entradas BTS Chile | BTS Chile"` (duplicado)

## Solución

Usé `title.absolute` para evitar que se aplique el template:

```typescript
export const metadata: Metadata = {
  title: {
    absolute: "Entradas BTS Chile | Disponible",
  },
  // ...
}
```

Esto genera exactamente: **"Entradas BTS Chile | Disponible"**

## Resultado

Ahora el título será consistente:
- ✅ **En la web**: `Entradas BTS Chile | Disponible`
- ✅ **En Google**: `Entradas BTS Chile | Disponible`
- ✅ **OpenGraph**: `Entradas BTS Chile | Disponible`
- ✅ **Twitter Card**: `Entradas BTS Chile | Disponible`

## Verificación

Después del deploy en Vercel, verifica:

```bash
curl -s https://www.btschile.com/entradas | grep -i "<title>"
# Debe mostrar: <title>Entradas BTS Chile | Disponible</title>
```

O simplemente abre https://www.btschile.com/entradas en tu navegador y revisa la pestaña.
