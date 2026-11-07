# ADR-004: Precisión Financiera, Value Objects y Suite de Caracterización

## Estado
Aceptado

## Contexto
La precisión matemática es la prioridad crítica de InteresIt. Se evaluó si convenía introducir una librería de aritmética decimal arbitraria (ej. `decimal.js`) o modelar Value Objects encapsulando primitivos numéricos con control explícito de precisión y redondeo.

## Decisión
1. Modelar las cantidades monetarias (`Money`), tasas (`InterestRate`), fechas (`CalendarDate`) y días de corte (`CutoffDay`) como **Value Objects inmutables** en el Domain Layer.
2. Utilizar precisión nativa de doble precisión IEEE 754 con operaciones de redondeo bancario formalizadas a 2 posiciones decimales en los puntos de corte, evitando la acumulación de errores de coma flotante.
3. Adoptar formalmente la regla de cálculo v2.2 (base 365, fechas en UTC, corte en día mensual topado al último día calendario del mes) y protegerla con una suite de caracterización obligatoria en Vitest con los valores de referencia:
   - Capital 185, Tasa 0.1% / 3.0%, 17 abr → 16 may 2026, corte 16: Saldos $185.01$ y $185.44$.
   - Saldo final al 16 nov 2026: $185.11$ y $188.26$. Ventaja líder: $+3.15$.

## Consecuencias
### Positivas
- Cero dependencias pesadas en el Domain Layer.
- Paridad exacta y verificabilidad instantánea con la suite de pruebas unitarias.
- Inmutabilidad y validación garantizada al instanciar Value Objects.

### Negativas / Mitigaciones
- Requiere instanciar Value Objects en los límites del dominio. Se simplifica mediante funciones parser tipadas (`parseAmount`, `parseInterestRate`).
