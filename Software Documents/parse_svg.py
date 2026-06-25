import xml.etree.ElementTree as ET

def print_tree(elem, level=0):
    if level > 3:
        return
    tag = elem.tag.split('}')[-1]
    print("  " * level + f"<{tag} {elem.attrib}>")
    for child in elem:
        print_tree(child, level + 1)

tree = ET.parse('/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/Favicon Logo.svg')
print_tree(tree.getroot())
