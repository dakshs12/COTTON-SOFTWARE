import os

target_string = '<rect x="-150" width="1800" fill="#ffffff" y="-149.999993" height="1799.99992" fill-opacity="1"/>'

files = [
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Favicon Logo.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Full Logo White.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/frontend/app/icon.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/frontend/public/logo-icon.svg',
    '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/frontend/public/logo-white.svg'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if target_string in content:
            new_content = content.replace(target_string, '')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed background from: {file_path}")
        else:
            print(f"Target string not found in: {file_path}")
    else:
        print(f"File not found: {file_path}")

