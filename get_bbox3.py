import re

def parse_svg_bbox(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all path commands
    paths = re.findall(r'd="([^"]+)"', content)
    # Find all translates in transforms
    translates = re.findall(r'translate\(([^,]+),\s*([^)]+)\)', content)
    # Find all matrix transforms
    matrices = re.findall(r'matrix\(([^)]+)\)', content)
    
    print(f"File: {filepath}")
    print(f"Translates: {translates}")
    print(f"Matrices: {matrices}")
    
parse_svg_bbox('/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Full Logo White.svg')

