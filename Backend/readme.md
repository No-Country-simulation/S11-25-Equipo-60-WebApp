# Guía de instalación del proyecto Django

## ¿De que se trata este proyecto/API?

Este proyecto se trata de una API REST que es utilizada como Backend para la plataforma Testimonios... 

## Programas necesarios

- [Visual Studio Code](https://code.visualstudio.com/)
- [Python](https://www.python.org/downloads/)

### Comandos para instalar el backend


- Ejecuta el siguiente comando para instalar el proyecto:

```
py -m venv venv 
```

```
.\venv\Scripts\activate
```

```
pip install -r requirements.txt
```

## Si quieres crear un super usuario ejecute el siguiente comando y sigue los pasos...

```
python manage.py createsuperuser
```

## Levantar el backend de la plataforma

El backend de la plataforma está construido en Django, para ejecutar el servidor de desarrollo backend debes ejecutar el siguiente comando:

```
python manage.py runserver
```

Te diriges a la url localhost:8000 en el navegador


<h3 align="center">¡Y Listo! Has terminado de correr el backend 🥳</h3>
