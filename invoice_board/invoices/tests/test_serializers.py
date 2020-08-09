from test_plus.test import TestCase

from invoice_board.invoices.models import Invoice, InvoiceStatuses
from invoice_board.invoices.serializers import InvoiceSerializer
from invoice_board.users.tests.factories import UserFactory


class TestInvoiceSerializer(TestCase):
    def setUp(self):
        self.user = UserFactory()

        self.invoice_data = dict(
            name='sample invoice',
            description='sample description',
            status=InvoiceStatuses.NOT_PAID,
            created_by=self.user,
        )

    def test_required_fields(self):
        invoice_data = {}
        serializer = InvoiceSerializer(data=invoice_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors.keys())
        self.assertIn('description', serializer.errors.keys())
        self.assertIn('created_by', serializer.errors.keys())

    def test_serializer(self):
        # make sure create instance scenario works well
        invoice_data = dict(
            name='sample invoice',
            description='sample description',
            created_by=self.user.pk,
        )

        serializer = InvoiceSerializer(data=invoice_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        instance = serializer.save()
        self.assertEqual(instance.created_by.pk, invoice_data['created_by'])

    def test_processed_by_set(self):
        # make sure the accomplished by is set based on the request.user if the status is 'PAID'

        invoice_data = dict(
            name='sample invoice',
            description='sample description',
            status=InvoiceStatuses.PAID,
        )

        class MockRequest(object):
            pass

        request = MockRequest()
        request.user = self.user

        context = dict(request=request)

        serializer = InvoiceSerializer(data=invoice_data, context=context)
        self.assertEqual(serializer.initial_data['processed_by'], self.user.pk)

        invoice_data['status'] = InvoiceStatuses.NOT_PAID
        serializer = InvoiceSerializer(data=invoice_data, context=context)
        self.assertTrue(not 'processed_by' in serializer.initial_data)
