from test_plus.test import TestCase

from rest_framework.test import APIRequestFactory

from invoice_board.api.invoices.endpoints import IsInvoiceOwnerOrMarkDoneOnly
from invoice_board.users.tests.factories import UserFactory
from invoice_board.invoices import utils

from invoice_board.invoices.models import Invoice, InvoiceStatuses

factory = APIRequestFactory()


class MockView(object):
    pass


class TestInvoiceOwnerOrMarkDoneOnlyPermission(TestCase):

    def _get_patch_request(self, data, user):
        request = factory.patch('/', data=data)
        request.user = user
        request.data = data
        return request

    def setUp(self):
        self.user1 = UserFactory()
        self.user2 = UserFactory()

        utils.create_sample_invoices(self.user1)
        utils.create_sample_invoices(self.user2)

    def test_delete(self):
        permission = IsInvoiceOwnerOrMarkDoneOnly()

        request = factory.delete('/', {})
        request.user = self.user1

        obj = Invoice.objects.filter(created_by=self.user2).first()
        # make sure the not owner can't delete the invoice
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)
        # make sure owner is allowed to delete the invoice
        request.user = self.user2
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertTrue(is_allowed)

    def test_owner_edit(self):
        permission = IsInvoiceOwnerOrMarkDoneOnly()

        updated_data = {
            'some_unknown_field': 'unknown',
            'name': 'well known',
            'description': 'sample',
            'status': '0'
        }

        # make sure updating of some arbitrary field set is forbidden
        request = self._get_patch_request(updated_data, self.user1)
        obj = Invoice.objects.filter(created_by=self.user1).first()
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)

        # make sure it is possible to update the name, description, status fieldset and subsets.
        updated_data.pop('some_unknown_field')
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertTrue(is_allowed, permission.message)
        updated_data.pop('name')
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertTrue(is_allowed, permission.message)
        updated_data.pop('description')
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertTrue(is_allowed, permission.message)

        # update having no fields specified is allowed.
        updated_data = {}
        request = self._get_patch_request(updated_data, self.user1)
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertTrue(is_allowed)

    def test_edit_by_not_owner(self):
        permission = IsInvoiceOwnerOrMarkDoneOnly()

        updated_data = {
            'some_unknown_field': 'unknown',
            'name': 'well known',
            'description': 'sample',
            'status': InvoiceStatuses.NOT_PAID
        }

        # make sure updating of some arbitrary field set is forbidden
        request = self._get_patch_request(updated_data, user=self.user2)
        obj = Invoice.objects.filter(created_by=self.user1).first()
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)

        # make sure it is not possible to update any fieldset other than ['status'] only
        updated_data.pop('some_unknown_field')
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)
        updated_data.pop('name')
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)

        # make sure updating only the status field is allowed when it is set to 'Done'
        updated_data.pop('description')
        updated_data['status'] = InvoiceStatuses.NOT_DONE
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)
        updated_data['status'] = InvoiceStatuses.DONE
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertTrue(is_allowed, permission.message)

        # update having no fields specified is forbidden.
        updated_data = {}
        request = self._get_patch_request(updated_data, user=self.user2)
        is_allowed = permission.has_object_permission(request, MockView(), obj)
        self.assertFalse(is_allowed)
