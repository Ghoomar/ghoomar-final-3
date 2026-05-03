import os
import glob
import re

# Define paths
base_dir = r"c:\Ghoomar final 3\elements used in the website"
pages_dir = os.path.join(base_dir, "pages")

# List all HTML files
html_files = glob.glob(os.path.join(pages_dir, "*.html"))
html_files.append(os.path.join(base_dir, "index.html"))

# Mapping of replacements
# Use regex to avoid matching words containing these patterns if any
replacements = {
    # Replace references to village
    r'href="pages/village\.html"': r'href="https://village.ghoomarthali.in/"',
    r'href="\.\./village\.html"': r'href="https://village.ghoomarthali.in/"',
    r'href="village\.html"': r'href="https://village.ghoomarthali.in/"',
    
    # Replace references to vedanta
    r'href="pages/vedanta\.html"': r'href="https://vedanta.ghoomarthali.in/"',
    r'href="\.\./vedanta\.html"': r'href="https://vedanta.ghoomarthali.in/"',
    r'href="vedanta\.html"': r'href="https://vedanta.ghoomarthali.in/"',
    
    # Replace references to vedanta-menu
    r'href="pages/vedanta-menu\.html"': r'href="https://vedanta.ghoomarthali.in/menu"',
    r'href="\.\./vedanta-menu\.html"': r'href="https://vedanta.ghoomarthali.in/menu"',
    r'href="vedanta-menu\.html"': r'href="https://vedanta.ghoomarthali.in/menu"',
    r'href="vedanta-menu\.html\?': r'href="https://vedanta.ghoomarthali.in/menu?',
    
    # Clean URLs for main domain pages
    r'href="pages/thali\.html"': r'href="/thali"',
    r'href="\.\./thali\.html"': r'href="/thali"',
    r'href="thali\.html"': r'href="/thali"',
    
    r'href="pages/yatra\.html"': r'href="/yatra"',
    r'href="\.\./yatra\.html"': r'href="/yatra"',
    r'href="yatra\.html"': r'href="/yatra"',
    
    r'href="pages/yatra-menu\.html"': r'href="/yatra-menu"',
    r'href="\.\./yatra-menu\.html"': r'href="/yatra-menu"',
    r'href="yatra-menu\.html"': r'href="/yatra-menu"',
    
    r'href="pages/chandni-chowk\.html"': r'href="/chandni-chowk"',
    r'href="\.\./chandni-chowk\.html"': r'href="/chandni-chowk"',
    r'href="chandni-chowk\.html"': r'href="/chandni-chowk"',
    
    r'href="pages/connaught-place\.html"': r'href="/connaught-place"',
    r'href="\.\./connaught-place\.html"': r'href="/connaught-place"',
    r'href="connaught-place\.html"': r'href="/connaught-place"',
    
    r'href="pages/guwahati\.html"': r'href="/guwahati"',
    r'href="\.\./guwahati\.html"': r'href="/guwahati"',
    r'href="guwahati\.html"': r'href="/guwahati"',
    
    r'href="pages/patna\.html"': r'href="/patna"',
    r'href="\.\./patna\.html"': r'href="/patna"',
    r'href="patna\.html"': r'href="/patna"',
    
    r'href="pages/gallery-thali\.html"': r'href="/gallery-thali"',
    r'href="\.\./gallery-thali\.html"': r'href="/gallery-thali"',
    r'href="gallery-thali\.html"': r'href="/gallery-thali"',
    
    # Fix back-to-home links in subpages
    r'href="\.\./index\.html"': r'href="https://ghoomarthali.in/"',
    r'href="index\.html"': r'href="https://ghoomarthali.in/"',
}

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
        
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated links in: {os.path.basename(file_path)}")

for file_path in html_files:
    if os.path.exists(file_path):
        update_file(file_path)

print("All URL replacements completed successfully!")
