# PropFirm Calculator

Calculadora independiente inspirada en el flujo de la referencia visual: ejemplos de cuentas, deslizadores, plan por día y pestañas para evaluación y tres retiros.

Abre index.html o usa GitHub Pages desde main y /(root). Sin instalación ni dependencias. Los resultados se calculan en tu navegador. node tests.cjs ejecuta las pruebas del motor.

## Modelo diario v3

Esta versión usa un paseo aleatorio por días, no una estimación del porcentaje de aciertos de operaciones. Cada día termina en la ganancia o pérdida del plan. Por defecto se usa una hipótesis sin ventaja; los detalles están visibles en la aplicación. Los resultados de versiones anteriores por operaciones no son comparables directamente.

El límite diario detiene el día sin cancelar la cuenta salvo que se toque el límite total. El trailing se bloquea en el saldo inicial. Intraday se aproxima con los cierres diarios, da el mismo resultado que EOD y no representa máximos dentro del día: se advierte en pantalla. Cada retiro resta saldo y se calcula un máximo de tres retiros. Las probabilidades acumuladas se distinguen de las condicionales.

Los presets son ficticios, no condiciones verificadas de firmas. Verifica las reglas de tu firma. Este modelo no incluye todas las condiciones ni predice beneficios. Datos y comparaciones se guardan localmente cuando está disponible.
