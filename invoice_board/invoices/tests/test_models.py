from test_plus.test import TestCase

from django.core.exceptions import ValidationError

from invoice_board.invoices.models import Invoice, InvoiceStatuses
from invoice_board.users.tests.factories import UserFactory


class TestInvoiceModel(TestCase):
    def setUp(self):
        self.user = UserFactory()

        self.invoice_data = dict(
            name='sample invoice',
            description='sample description',
            status=InvoiceStatuses.NOT_PAID,
            created_by=self.user,
        )

    def test_save_processed_by_is_empty(self):
        invoice = Invoice.objects.create(**self.invoice_data)
        self.assertTrue(invoice.processed_by is None)

        invoice.status = InvoiceStatuses.PAID
        invoice.processed_by = self.user
        invoice.save()

        # make sure the processed_by is cleaned up on saving
        invoice.status = InvoiceStatuses.NOT_PAID
        invoice.save()
        self.assertEqual(invoice.processed_by, None)

    def test_clean_raises_on_setting_of_status_done(self):
        # make sure the processed_by should be set along with the status
        invoice = Invoice.objects.create(**self.invoice_data)
        invoice.status = InvoiceStatuses.PAID
        self.assertRaises(ValidationError, invoice.clean)
        # now call clean having the processed_by set.
        invoice.status = InvoiceStatuses.PAIDy
        invoice.processed_by = self.user
        invoice.clean()
