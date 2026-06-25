import os

target_string = 'viewBox="0 0 1500 1499.999933"'
new_string = 'viewBox="450 450 600 600"'

files = [
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Favicon Logo.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/frontend/app/icon.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/frontend/public/logo-icon.svg'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if target_string in content:
            new_content = content.replace(target_string, new_string)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed viewBox for: {file_path}")
        else:
            print(f"Target string not found in: {file_path}")

