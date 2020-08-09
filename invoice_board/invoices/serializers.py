from rest_framework import serializers

from invoice_board.invoices.models import Invoice, InvoiceStatuses


class InvoiceSerializer(serializers.ModelSerializer):
    created_by_username = serializers.StringRelatedField(source='created_by')
    processed_by_username = serializers.StringRelatedField(source='processed_by')
    status_readable = serializers.ReadOnlyField(source='get_status_display')

    class Meta:
        model = Invoice
        fields = ['id', 'name', 'description', 'status',
                  'created_by', 'created_by_username',
                  'processed_by', 'processed_by_username',
                  'status_readable']

    def __init__(self, *args, **kwargs):

        # specify the user who processed the Invoice if the status 'done' is set
        if 'data' in kwargs and 'context' in kwargs and 'request' in kwargs['context']:
            request = kwargs['context']['request']
            data = kwargs['data']
            if 'status' in data and str(data['status']) == str(InvoiceStatuses.PAID):
                data = kwargs['data'].copy()
                data.update({'processed_by': request.user.pk})
                kwargs['data'] = data

        super(InvoiceSerializer, self).__init__(*args, **kwargs)
