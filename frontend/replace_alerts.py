import os
import re

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

    if "alert(" not in content:
        continue

    # 1. Add Toast import
    if "import { Toast }" not in content:
        content = "import { Toast } from '@/app/components/Toast';\n" + content
    
    # 2. Add toastMessage state and showToast helper
    if "const [toastMessage" not in content:
        match = re.search(r'export (default )?function [A-Za-z]+\(.*\) \{', content)
        if match:
            pos = match.end()
            inject = """
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };
"""
            content = content[:pos] + inject + content[pos:]

    # 3. Replace alert(...) with showToast(..., 'type')
    def repl(m):
        msg = m.group(1)
        # Determine type
        typ = "success" if "uccess" in msg else "error"
        return f"showToast({msg}, '{typ}')"
    
    content = re.sub(r'alert\((.*?)\)', repl, content)

    # 4. Insert <Toast message={toastMessage} /> at the end
    if "<Toast message" not in content:
        # For modals, the last closing tag might be inside a Portal or something, but usually it's the last </div>
        # Find the LAST </div>
        parts = content.rsplit("</div>", 1)
        if len(parts) == 2:
            content = parts[0] + "  <Toast message={toastMessage} />\n    </div>" + parts[1]
        else:
            # Fallback if no </div> (e.g. fragments)
            parts = content.rsplit("</>", 1)
            if len(parts) == 2:
                content = parts[0] + "  <Toast message={toastMessage} />\n    </>" + parts[1]

    with open(fpath, "w") as f:
        f.write(content)

print("Done")
