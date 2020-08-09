export const INVOICE_STATUSES = {
  NOT_PAID: 0,
  PAID: 1,
};

export const DEFAULT_LIMIT = 25;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_STATUS_FILTER = '-1';

export const invoiceActions = {
  None: 0,
  ShowInvoiceInfo: 1,
  EditInvoice: 2,
  CreateInvoice: 3,
  DeleteInvoice: 4,
  InvoiceMarkDone: 5,
};
