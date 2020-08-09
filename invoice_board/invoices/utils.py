from invoice_board.invoices.models import Invoice


def create_sample_invoices(owner=None, count=15):
    assert owner, "Please specify the owner for invoices."

    for idx in range(count):
        invoice_data = dict(
            name='Invoice number %d' % (idx + 1),
            description='We would like to buy your invoice and give you cash '
                        'How does that sound '
                        'Paid '
                        'Field need to be notated.',
            created_by=owner,
        )

        Invoice.objects.create(**invoice_data)
