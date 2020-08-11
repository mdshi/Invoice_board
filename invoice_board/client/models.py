from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from soft_delete_it.models import SoftDeleteModel
# from softdelete import SoftDeleteObject
# Create your models here.

    
class SalesBroker(SoftDeleteModel):
    sales_broker_id = models.AutoField(primary_key = True, auto_created = True)
    first_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    middle_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    last_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    address_1 = models.CharField(max_length=100, default=None, blank=True, null=True)
    address_2 = models.CharField(max_length=100, default=None, blank=True, null=True)
    city  = models.CharField(max_length=100, default=None, blank=True, null=True)
    state = models.CharField(max_length=100, default=None, blank=True, null=True)
    country = models.CharField(max_length=100, default=None, blank=True, null=True)
    phone = models.CharField(max_length=100, default=None, blank=True, null=True)
    cell_phone = models.CharField(max_length=100, default=None, blank=True, null=True)
    email = models.EmailField()
    is_active = models.BooleanField(default = True)
    company_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    
    def __str__(self):
        return self.first_name + ' ' + self.last_name
    
    def get_absolute_url(self):
        return reverse('sales_broker_detail', kwargs={'id':self.sales_broker_id})
        
    

    


class TransactionFeeRateType(SoftDeleteModel):
    transaction_fee_rate_type_id = models.AutoField(auto_created=True, primary_key=True)
    transaction_fee_rate_type = models.CharField(max_length=50) #Flat, Daily, Bucket
    def __str__(self):
        return self.transaction_fee_rate_type
 
class Terms(SoftDeleteModel):
    terms_id = models.AutoField(auto_created=True, primary_key=True)
    description = models.CharField(max_length= 255, default=None, null=True, blank=True)
    advance_percentage = models.DecimalField(default=0, decimal_places=2, max_digits=4)
    security_percentage = models.DecimalField(default=0, decimal_places=2, max_digits=4)
    invoice_fee = models.DecimalField(default=0, decimal_places=2, max_digits=4)
    transaction_fee_rate_type = models.ForeignKey(TransactionFeeRateType, default=None, blank=True, null=True, on_delete=models.SET_NULL) # Foreign Key 
    flat_rate = models.DecimalField(default=0, decimal_places=4, max_digits=6)
    daily_rate = models.DecimalField(default=0,decimal_places=4, max_digits=6)
    express_processing_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    priority_processing_fee = models.DecimalField(decimal_places=2, max_digits=4)
    standard_processing_fee = models.DecimalField(default=0, decimal_places=2, max_digits=4)
    fuel_advance_percentage = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    fuel_advance_fee_percentage = models.DecimalField(default=0, decimal_places=2, max_digits=4)
    fuel_advance_days = models.IntegerField(default=0)
    over_advance_fee_percentage = models.DecimalField(default=0, decimal_places=2, max_digits=4)
    over_advance_days = models.IntegerField(default=0)
    check_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    wire_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    transcheck_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    ach_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    fuel_card_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    carrier_quck_pay_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    paperwork_delivery_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    postage_fee = models.DecimalField(default=0,decimal_places=2, max_digits=4)
    release_days = models.IntegerField(default=0)
    recourse_days = models.IntegerField(default=0)
    
    def get_absolute_url(self):
        return reverse('terms_detail', kwargs={'id':self.terms_id})


class BucketRate(SoftDeleteModel):
    bucket_rate_id = models.AutoField(auto_created=True, primary_key=True) 
    terms = models.ForeignKey(Terms, on_delete=models.CASCADE)  
    level = models.SmallIntegerField()
    min_days = models.SmallIntegerField()
    max_days = models.SmallIntegerField()
    percentage_rate = models.DecimalField(decimal_places=2, max_digits=4)
    
    def get_absolute_url(self):
        return reverse('bucket_rate_detail', kwargs={'id':self.bucket_rate_id})

class Client(SoftDeleteModel):
    client_id = models.AutoField(auto_created=True, primary_key=True)
    client_name = models.CharField(max_length=255)
    dba_name = models.CharField(max_length=255, default=None, blank=True, null=True)
    is_active = models.BooleanField(default = True)
    docket = models.CharField(max_length=50, default=None, blank=True, null=True)
    dot_number = models.CharField(max_length=50, default=None, blank=True, null=True)
    ein = models.CharField(max_length=50, default=None, blank=True, null=True)
    business_type = models.CharField(max_length=50, default=None, blank=True, null=True)
    is_broker = models.BooleanField(default = False)
    business_start_date = models.DateField(default=None, blank=True, null=True)
    funding_start_date = models.DateField(default=None, blank=True, null=True)
    fnding_end_date = models.DateField(default=None, blank=True, null=True)
    transaction_fee_rate_type = models.ForeignKey(TransactionFeeRateType, on_delete=models.PROTECT)
    business_phone = models.CharField(max_length=50, default=None, blank=True, null=True)
    business_fax = models.CharField(max_length=50, default=None, blank=True, null=True)
    business_email = models.EmailField(default=None, blank=True, null=True)
    number_of_trucks = models.IntegerField(default=None, blank=True, null=True)
    account_manager = models.ForeignKey(User, default=None, blank=True, null=True, on_delete = models.SET_NULL) # Foreign Key 
    primary_salesperson = models.ForeignKey(User, default=None, blank=True, null=True, on_delete = models.SET_NULL, related_name='salesperson_primary') # Foreign Key 
    secondary_salesperson = models.ForeignKey(User, default=None, blank=True, null=True, on_delete = models.SET_NULL, related_name='salesperson_secondary') # Foreign Key 
    sales_broker = models.ForeignKey(SalesBroker, default=None, blank=True, null=True, on_delete = models.SET_NULL) # Foreign Key 
    terms = models.ForeignKey(Terms, default=None, blank=True, null=True, on_delete = models.SET_NULL) # Foreign Key 
    hold_reserves = models.BooleanField(default = False)
    credit_limit = models.DecimalField(decimal_places =2, max_digits = 10)
    estimated_grp = models.DecimalField(decimal_places=2, max_digits = 4)
    estimated_volume = models.DecimalField(decimal_places =2, max_digits = 10)
    authority_status = models.BooleanField(default=True)
    insurance_status = models.BooleanField(default=True)
    insurance_expiration_date = models.DateField()
    ucc_filing_date = models.DateField()
    date_created = models.DateTimeField(auto_now_add=True)
    
    def get_absolute_url(self):
        return reverse('client_detail', kwargs={'id':self.client_id})

class ClientNote(SoftDeleteModel):
    client_note_id = models.AutoField(auto_created=True, primary_key=True),
    client = models.ForeignKey(Client, related_name='client_memo', on_delete = models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    client_note = models.CharField(max_length = 255)
    is_alert = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    show_processing = models.BooleanField(default=False)
    show_account_managers = models.BooleanField(default=False)
    show_collections = models.BooleanField(default=False)
    show_payments = models.BooleanField(default=False)
    show_client = models.BooleanField(default=False)
    
class ContactType(SoftDeleteModel):
    contact_type_id = models.AutoField(auto_created=True, primary_key=True)
    contact_type_name = models.CharField(max_length=50)
    contact_type_description = models.CharField(max_length=255)
    def __str__(self):
        return self.contact_type_name
    
class ContactAccount(SoftDeleteModel):
    contact_account_id = models.AutoField(auto_created=True, primary_key=True)
    date_created = models.DateTimeField(auto_now_add=True)
    first_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    middle_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    last_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    address_1 = models.CharField(max_length=100, default=None, blank=True, null=True)
    address_2 = models.CharField(max_length=100, default=None, blank=True, null=True)
    city  = models.CharField(max_length=100, default=None, blank=True, null=True)
    state = models.CharField(max_length=100, default=None, blank=True, null=True)
    country = models.CharField(max_length=100, default=None, blank=True, null=True)
    phone = models.CharField(max_length=100, default=None, blank=True, null=True)
    cell_phone = models.CharField(max_length=100, default=None, blank=True, null=True)
    email = models.EmailField(default=None, blank=True, null=True)
    is_active = models.BooleanField(default = True)
    contact_type = models.ForeignKey(ContactType,  default=None, blank=True, null=True, on_delete=models.SET_NULL)
    login = models.CharField(max_length=50, default=None, blank=True, null=True)
    password = models.CharField(max_length=50, default=None, blank=True, null=True)
    pin = models.CharField(max_length=50, default=None, blank=True, null=True)
    
    def get_absolute_url(self):
        return reverse('contact_account_detail', kwargs={'id':self.contact_account_id})
    
class Contact(SoftDeleteModel):
    contact_id = models.AutoField(auto_created=True, primary_key = True)
    client = models.ForeignKey(Client,  on_delete=models.CASCADE)
    client_contact_account = models.ForeignKey(ContactAccount, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    can_move_money = models.BooleanField(default=False)
    
    def get_absolute_url(self):
        return reverse('contact_detail', kwargs={'id':self.contact_id})
    
    
class FundingAccount(SoftDeleteModel):
    funding_account_id = models.AutoField(auto_created=True, primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    vendor_name = models.CharField(max_length=50, default=None, blank=True, null=True)
    vendor_nick_name = models.CharField(max_length=50, default=None, blank=True, null=True)
    address_1 = models.CharField(max_length=50, default=None, blank=True, null=True)
    address_2 = models.CharField(max_length=50, default=None, blank=True, null=True)
    city = models.CharField(max_length=50, default=None, blank=True, null=True)
    state = models.CharField(max_length=50, default=None, blank=True, null=True)
    zip = models.CharField(max_length=50, default=None, blank=True, null=True)
    country = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_name = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_routing_number = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_address_1 = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_address_2 = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_city = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_state = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_zip = models.CharField(max_length=50, default=None, blank=True, null=True)
    bank_country = models.CharField(max_length=50, default=None, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_fuel_card = models.BooleanField(default=False)
    wire_allowed = models.BooleanField(default=0)
    ach_allowed = models.BooleanField(default=False)
    check_allowed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)
    
    def get_absolute_url(self):
        return reverse('funding_account_detail', kwargs={'id':self.funding_account_id})
    
    
class DocumentCategory(SoftDeleteModel):
    document_category_id = models.AutoField(auto_created=True, primary_key=True)
    category_name = models.CharField(max_length=50, default=None, blank=True, null=True)
    description = models.CharField(max_length=255, default=None, blank=True, null=True)
    
    def __str__(self):
        return self.category_name
    
class ClientDocument(SoftDeleteModel):
    client_document_id = models.AutoField(auto_created=True, primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    document_category = models.ForeignKey(DocumentCategory, on_delete=models.PROTECT)
    document_description = models.CharField(max_length=255, default=None, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    file_name = models.CharField(max_length=255, default=None, blank=True, null=True)
    file_extension = models.CharField(max_length=50, default=None, blank=True, null=True)
    file_size = models.CharField(max_length=50, default=None, blank=True, null=True)
    
    
    
    
    
