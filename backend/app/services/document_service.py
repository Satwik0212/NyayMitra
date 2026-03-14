import os
from jinja2 import Environment, FileSystemLoader

# Define the templates directory relative to the current file
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

# Initialize Jinja2 environment
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

def get_template(doc_type: str):
    try:
        template_name = f"{doc_type}.html"
        return env.get_template(template_name)
    except Exception as e:
        print(f"Template not found: {e}")
        return None

def render_template(doc_type: str, variables: dict) -> str:
    template = get_template(doc_type)
    if template:
        try:
            return template.render(**variables)
        except Exception as e:
            print(f"Error rendering template: {e}")
            return f"<p>Error rendering document: {e}</p>"
    return "<p>Template not found.</p>"
