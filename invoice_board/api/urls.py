from django.urls import path

from invoice_board.api.invoices import endpoints
from invoice_board.api.settings.endpoints import AppGlobalsEndpoint

app_name = 'api-v1'

urlpatterns = [
    path('invoices/', endpoints.InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', endpoints.InvoiceUpdateDeleteView.as_view(), name='invoice-update-delete'),

    path('globals/', AppGlobalsEndpoint.as_view())
]
