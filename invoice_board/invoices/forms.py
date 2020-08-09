from django.forms import ModelForm

from crispy_forms.helper import FormHelper

from invoice_board.invoices.models import Invoice


class InvoiceForm(ModelForm):

    class Meta:
        model = Invoice
        fields = ['name', 'description', 'status']


    def __init__(self, *args, **kwargs):
        super(InvoiceForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
