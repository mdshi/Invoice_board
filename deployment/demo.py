from invoice_board.invoices import utils
from invoice_board.users.models import User

demo_users = ['bob', 'alice']


def _create_user(username, password=u'password'):
    assert username, 'Please specify username.'
    user = User.objects.create(username=username, password='')
    user.set_password(password)
    user.save()
    return user


def create_demo_users():
    for name in demo_users:
        user = _create_user(username=name)

def create_demo_invoices():
    for name in demo_users:
        user = User.objects.get(username=name)
        utils.create_sample_invoices(user)

def delete_demo_stuff():
    for name in demo_users:
        try:
            User.objects.get(username=name).delete()
        except User.DoesNotExist:
            pass
