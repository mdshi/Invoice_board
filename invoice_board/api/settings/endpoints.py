from rest_framework.response import Response
from django.urls import reverse
from invoice_board.api.abstract.endpoints import InvoiceBoardEndpoint
from invoice_board.invoices.models import Invoice

class AppGlobalsEndpoint(InvoiceBoardEndpoint):

    def get(self, request, *args, **kwargs):
        return Response(dict(
            invoices_total=Invoice.objects.count(),
            current_user=request.user.pk,
            profile_url=request.user.get_absolute_url(),
            fullname=request.user.fullname or request.user.username,
        ))
