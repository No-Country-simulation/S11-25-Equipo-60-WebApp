from urllib.parse import urlparse

def get_domain_from_url(url):
    """Extrae el dominio neto de una URL (sin protocolo, puerto ni path)."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except:
        return None