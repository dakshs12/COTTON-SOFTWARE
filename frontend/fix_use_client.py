import os

files = [
    "app/(dashboard)/reports/due-list/PaymentModal.tsx",
    "app/(dashboard)/reports/bills-statement/page.tsx",
    "app/(dashboard)/brokerage/bill-generation/page.tsx",
    "app/(dashboard)/master/party/page.tsx",
    "app/(auth)/register/page.tsx",
    "app/(dashboard)/transaction/passing/page.tsx",
    "app/(dashboard)/transaction/delivery/page.tsx",
    "app/(dashboard)/transaction/bargain/page.tsx"
]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, "r") as f:
        content = f.read()

    # If the file has both "use client" and the import, make sure "use client" is first
    if '"use client"' in content or "'use client'" in content:
        # Remove all instances of "use client"; and 'use client';
        content = content.replace('"use client";\n', '')
        content = content.replace("'use client';\n", '')
        content = content.replace('"use client"\n', '')
        content = content.replace("'use client'\n", '')
        
        # Put it at the very top
        content = '"use client";\n' + content.lstrip()
        
        with open(fpath, "w") as f:
            f.write(content)

print("Done fixing use client")
