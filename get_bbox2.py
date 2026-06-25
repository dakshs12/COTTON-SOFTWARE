import re

for filepath in ['/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Favicon Logo.svg', 
                 '/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Full Logo White.svg']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    xs = []
    ys = []
    
    # Very crude: find all absolute coordinates.
    # Canva paths are usually M X Y L X Y C X Y X Y X Y ...
    # Wait, transform="matrix(1, 0, 0, 1, 424, 869)" adds 424 to X and 869 to Y.
    # Let's just find min/max of paths, but wait, the transforms aren't applied.
    pass
