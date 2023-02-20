# PonTusGuardias

Aquí hay que ir añadiendo las novedades del proyecto.

## Siguientes Pasos

Prioridades:
- Implementar el Optimizador considerando las casuísticas
- Implementar el selector de número de guardias por persona y la parte correspondiente en la API
- Implementar las agrupaciones
    - A y B siempre juntos: A+B = 2
    - A y B nunca juntos: A+B <= 1
    - Siempre que A esté que esté B: A->B
    - Siempre que A no esté que esté B: A+B =1

Otros To-Do's:
Front:
- Revisar el modo móvil

Back:
- Doble check de coherencia en el formulario (para que no pidan planillas imposibles)
- Que puedan solicitar varios meses a la vez
- Seguridad y contraseñas

Marketing:
- Plantear nuevas frases
- Crear las imágenes

## Estrategia
Versión alpha: Gratuita. Les ofrecemos el resultado al instante. Les dejamos el cuadro de texto para que nos dejen sus comentarios y en cuanto tengamos las restricciones, se las hacemos llegar.

Versión Beta: Gratuita. Modelo casi definitivo, corregimos errores, hacemos mucha campaña y cogemos volumen.

Versión 1: Empezamos a cobrar a los particulares. Todavía modelo de negocio por definir. Recogemos información de los usuarios.

Buscamos financiación

Versión 2: Versión desarrollada por profesionales. Nuevos modelos de negocio (particulares y en grupos). Usuarios y contraseñas, permite volver a planillas anteriores y reutilizarlas. También coordinarse con equipos, solicitando que rellenen las vacaciones, guardias...

Internacionalización, Diversificación de sectores


## Estructura de la BD
- Una única tabla en mongodb que se le actualiza la columna de solución cuando esté

## Otras ideas
- Cobrar solamente cuando hagamos una combinación de meses

