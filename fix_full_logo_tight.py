import os

target_string = 'viewBox="300 450 900 550"'
new_string = 'viewBox="400 520 690 410"'

files = [
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Full Logo White.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/frontend/public/logo-white.svg'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # In case the previous replace changed it
        import re
        content = re.sub(r'viewBox="[^"]+"', new_string, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed viewBox for: {file_path}")

