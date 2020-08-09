import json

from test_plus.test import TestCase

from rest_framework.test import APIRequestFactory
from rest_framework import status

from invoice_board.api.invoices.endpoints import InvoiceUpdateDeleteView, InvoiceListView
from invoice_board.users.tests.factories import UserFactory
from invoice_board.invoices import utils
from invoice_board.invoices.models import Invoice, InvoiceStatuses

factory = APIRequestFactory()


class TestInvoiceUpdateDeleteView(TestCase):
    def setUp(self):
        self.user = UserFactory()
        utils.create_sample_invoices(self.user)

        self.view = InvoiceUpdateDeleteView.as_view()

    def test_login_required(self):
        obj = Invoice.objects.filter(created_by=self.user).first()

        response = self.patch('api-v1:invoice-update-delete', pk=obj.pk, data={})
        self.response_302()
        response = self.delete('api-v1:invoice-update-delete', pk=obj.pk)
        self.response_302()
        self.assertLoginRequired('api-v1:invoice-list')

    def test_update_processed_by_is_empty(self):
        # make sure the processed_by field remains empty on setting of status 'not paid'
        obj = Invoice.objects.filter(created_by=self.user).first()
        obj.status = InvoiceStatuses.PAID
        obj.processed_by = self.user
        obj.save()

        json_data = json.dumps({
            'status': InvoiceStatuses.NOT_PAID,
        })

        # compose the patch request, get response
        url = self.reverse('api-v1:invoice-update-delete', pk=obj.pk)
        request = factory.patch(url, data=json_data, content_type='application/json')
        request.user = self.user
        response = self.view(request, pk=obj.pk)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_obj = Invoice.objects.get(pk=obj.pk)
        self.assertTrue(result_obj.status is InvoiceStatuses.NOT_PAID)
        self.assertTrue(result_obj.processed_by is None)

    def test_update_processed_by_is_set(self):
        # make sure the processed_by field is set on setting of status to 'Paid'

        obj = Invoice.objects.filter(created_by=self.user).first()
        self.assertTrue(obj.status is InvoiceStatuses.NOT_PAID)
        self.assertTrue(obj.processed_by is None)

        json_data = json.dumps({
            'status': InvoiceStatuses.PAID,
        })

        # compose the patch request, get response
        url = self.reverse('api-v1:invoice-update-delete', pk=obj.pk)
        request = factory.patch(url, data=json_data, content_type='application/json')
        request.user = self.user
        response = self.view(request, pk=obj.pk)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_obj = Invoice.objects.get(pk=obj.pk)
        self.assertTrue(result_obj.status is InvoiceStatuses.NOT_PAID)
        self.assertTrue(result_obj.processed_by == self.user)


class TestCreateInvoiceView(TestCase):
    def setUp(self):
        self.user = UserFactory()
        utils.create_sample_invoices(self.user)

        self.view = InvoiceListView.as_view()

    def test_create_invoice(self):
        # make sure invoice is created

        invoice_data = dict(
            status=InvoiceStatuses.PAID,
            name='sample invoice',
            description='sample description',
        )
        json_data = json.dumps(invoice_data)

        # compose the post request, get response
        url = self.reverse('api-v1:invoice-list')
        request = factory.post(url, data=json_data, content_type='application/json')
        request.user = self.user
        response = self.view(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['created_by'], self.user.pk)

        for k, v in invoice_data.items():
            self.assertEqual(response.data[k], invoice_data[k])
