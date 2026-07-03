from django.db import models

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        # Only return objects that have not been soft deleted
        return super().get_queryset().filter(is_deleted=False)

    def all_with_deleted(self):
        # Allow access to deleted items if explicitly needed
        return super().get_queryset()
