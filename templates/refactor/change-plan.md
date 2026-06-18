# change-plan.md - Plan de refactor

> Lista decisiones y secuencia segura. Si se descubre que un cambio altera comportamiento, bloquear o convertir a decision de producto.

## Invariantes

- Los contratos publicos listados en `architecture-map.md` no cambian.
- Los tests baseline deben pasar antes y despues del refactor, o documentarse como deuda previa.
- Cada slice debe poder revertirse de forma razonable.

## Orden sugerido

1. Capturar baseline de tests/gates.
2. Crear seams/adaptadores sin cambiar comportamiento.
3. Mover implementacion interna por slices pequenos.
4. Eliminar duplicacion/deuda solo cuando los gates esten verdes.

## Riesgos

| Riesgo | Senal | Mitigacion |
|--------|-------|------------|
| | | |
