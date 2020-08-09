from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

from invoice_board.users.models import User


class InvoiceStatuses(object):
    NOT_PAID = 0
    PAID = 1

    @classmethod
    def as_choices(cls):
        return (
            (cls.NOT_PAID, "Pending"),
            (cls.PAID, "Paid")
        )


class InvoiceQuerySet(models.QuerySet):
    def NOT_PAID(self):
        return self.filter(status=InvoiceStatuses.NOT_PAID)


class Invoice(models.Model):
    name = models.CharField(_("Name"), max_length=80, blank=False)
    description = models.TextField(_("Description"), blank=False)
    status = models.SmallIntegerField(choices=InvoiceStatuses.as_choices(), default=InvoiceStatuses.NOT_PAID)
    modified_on = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(User, related_name='invoices', null=False, on_delete=models.CASCADE)
    processed_by = models.ForeignKey(User, related_name='paid_invoices', null=True, on_delete=models.CASCADE)

    objects = InvoiceQuerySet.as_manager()

    class Meta:
        ordering = ['-modified_on']

    def __str__(self):
        return '%s' % (self.name)

    def save(self, *args, **kwargs):
        if self.status == InvoiceStatuses.NOT_PAID:
            self.processed_by = None

        super(Invoice, self).save(*args, **kwargs)

    def clean(self):
        # make sure processed_by field is set on setting of status to \'PAID\'
        if self.status == InvoiceStatuses.PAID and self.processed_by == None:
            raise ValidationError('processed_by field should be set on setting of status to \'PAID\'')
