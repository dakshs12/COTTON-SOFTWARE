import os
import django
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import FirmMaster

def run():
    source = "/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/Software Documents/example_bill.png"
    dest_dir = "/Users/daksh/Desktop/COTTON SOFTWARE/COTTON-SOFTWARE/backend/media/letterheads"
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    dest = os.path.join(dest_dir, "example_bill.png")
    
    if os.path.exists(source):
        shutil.copy2(source, dest)
        print("Copied example_bill.png to media/letterheads")
    else:
        print("Source image not found.")
        return

    firm = FirmMaster.objects.filter(firm_name="Daksh Cotton Brokers").first()
    if firm:
        firm.letterhead = "letterheads/example_bill.png"
        firm.save()
        print("Assigned letterhead to Daksh Cotton Brokers.")
    else:
        print("Firm not found.")

if __name__ == '__main__':
    run()
