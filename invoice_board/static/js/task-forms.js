var InvoiceEditingForm = {
  formTemplate: '#invoice-editing-form-template',
  formSelector: '#invoice-editing-form',
  submitButtonSelector: '#submit',
  cancelButtonSelector: '#cancel',

  onInvoiceEditedResponseSuccess: function(invoice) {
    // handles editing form server response
    InvoiceInformationForm.render(invoice);
    InvoiceListController.updateInvoiceRowById(invoice.id, invoice);
  },
  onInvoiceEditedResponseError: function(status, error) {
    ServerErrorForm.render(status, error);
  },

  onSubmitForm: function(invoice, event) {
    // get form data and submit it
    var $form = $(event.currentTarget);
    var form_data = serializeForm($form);
    var url = InvoiceRequest.composeSubmitUrl(invoice);
    InvoiceRequest.patch(url, form_data,
      InvoiceEditingForm.onInvoiceEditedResponseSuccess,
      InvoiceEditingForm.onInvoiceEditedResponseError
    );

    event.preventDefault();
  },
  onCancelForm: function(invoice, dismissOnCancel) {
    if (dismissOnCancel) {
      InvoiceListController.hideModalDialog();
      return;
    }
    InvoiceInformationForm.render(invoice);
  },

  assignFormHandlers: function(invoice, dismissOnCancel) {
    $(this.formSelector).on('submit', $.proxy(this.onSubmitForm, this, invoice));
    $(this.cancelButtonSelector).click(
      $.proxy(this.onCancelForm, this, invoice, dismissOnCancel)
    );
  },

  render: function(invoice, context) {
    // renders the InvoiceEditingForm
    //
    var dismissOnCancel = false;
    if (context && 'dismissOnCancel' in context) {
      dismissOnCancel = context.dismissOnCancel;
    }

    InvoiceModalDialogTemplateRenderer.render(InvoiceEditingForm.formTemplate, invoice);
    this.assignFormHandlers(invoice, dismissOnCancel);
  },
};

// ============================================================================
// ============================================================================

var InvoiceAddForm = {
  formTemplate: '#invoice-editing-form-template',
  formSelector: '#invoice-editing-form',
  submitButtonSelector: '#submit',
  cancelButtonSelector: '#cancel',

  onInvoiceEditedResponseSuccess: function(invoice) {
    // handles editing form server response
    InvoiceInformationForm.render(invoice);
    InvoiceListController.addInvoiceRow(invoice);
  },
  onInvoiceEditedResponseError: function(status, error) {
    ServerErrorForm.render(status, error);
  },

  onSubmitForm: function(event) {
    // get form data and submit it
    var $form = $(event.currentTarget);
    var form_data = serializeForm($form);
    var url = InvoiceRequest.invoiceRootUrl;
    InvoiceRequest.post(url, form_data,
      InvoiceAddForm.onInvoiceEditedResponseSuccess,
      InvoiceAddForm.onInvoiceEditedResponseError
    );

    event.preventDefault();
  },
  onCancelForm: function() {
      InvoiceListController.hideModalDialog();
      return;
  },

  assignFormHandlers: function() {
    $(this.formSelector).on('submit', $.proxy(this.onSubmitForm, this));
    $(this.cancelButtonSelector).click(
      $.proxy(this.onCancelForm, this)
    );
  },

  render: function() {
    // renders the InvoiceAddForm
    //
    InvoiceModalDialogTemplateRenderer.render(InvoiceAddForm.formTemplate, {});
    this.assignFormHandlers();
  },
};

// ============================================================================
// ============================================================================

var InvoiceInformationForm = {
  invoiceInformationTemplateName: '#invoice-information-template',
  controlButtonSelectors: {
    'edit': '#edit-button',
    'delete': '#delete-button',
    'markAsDone': '#markdone-button',
  },

  assignFormHandlers: function(invoice, $div) {
    // assign Edit button handler of the Invoice information form
    $div.find('.control-buttons').on('click', this.controlButtonSelectors['edit'],
      $.proxy(InvoiceEditingForm.render, InvoiceEditingForm, invoice));
    $div.find('.control-buttons').on('click', this.controlButtonSelectors['delete'],
      $.proxy(InvoiceDeleteForm.render, InvoiceDeleteForm, invoice));
    $div.find('.control-buttons').on('click', this.controlButtonSelectors['markAsDone'],
      $.proxy(InvoiceMarkAsDoneForm.render, InvoiceMarkAsDoneForm, invoice));
  },

  render: function(invoice) {
    // render the InvoiceInformationForm template
    //
    var $renderedDiv = InvoiceModalDialogTemplateRenderer.render(this.invoiceInformationTemplateName, invoice);
    // update displaying of particular form fields
    InvoiceView.assignInvoiceStatusLabel($renderedDiv, invoice);
    InvoiceView.displayInvoiceButtons($renderedDiv, invoice, this.controlButtonSelectors);
    // assign button handlers for rendered fragment
    this.assignFormHandlers(invoice, $renderedDiv);
  }
};

// ============================================================================
// ============================================================================

var ServerErrorForm = {
  templateName: '#server-error-template',

  render: function(status, error) {
    InvoiceModalDialogTemplateRenderer.render(this.templateName, {
      "status": status,
      "error": error,
    });
  },
};

// ============================================================================
// ============================================================================

var InvoiceDeleteForm = {
  templateName: '#invoice-short-info-question-template',

  deleteQuestionPlaceholderSelector: '#invoice-short-info-question-placeholder',
  deleteQuestionTemplateName: '#invoice-delete-question-template',
  confirmationTemplateName: '#invoice-delete-confirmation-template',

  confirmButtonSelector: '#confirm-button',
  cancelButtonSelector: '#cancel-button',

  onInvoiceDeleteResponseSuccess: function(invoice) {
    // Invoice deleted successfully. Render confirmation form.
    // NOTE: invoice object was bound in the onSubmitDelete
    InvoiceModalDialogTemplateRenderer.renderIntoPlacehoder(
      this.deleteQuestionPlaceholderSelector,
      this.confirmationTemplateName,
      invoice
    );
    // delete invoice row from listing
    InvoiceListController.deleteInvoiceRow(invoice.id);
  },
  onInvoiceDeleteResponseError: function(status, error) {
    ServerErrorForm.render(status, error);
  },

  onSubmitDelete: function(invoice, event) {
    var url = InvoiceRequest.composeSubmitUrl(invoice);
    InvoiceRequest.delete(url,
      $.proxy(InvoiceDeleteForm.onInvoiceDeleteResponseSuccess, InvoiceDeleteForm, invoice),
      InvoiceDeleteForm.onInvoiceDeleteResponseError
    );
    event.preventDefault();
  },

  onCancelDelete: function(invoice, dismissOnCancel) {
    if (dismissOnCancel) {
      InvoiceListController.hideModalDialog();
      return;
    }

    InvoiceInformationForm.render(invoice);
  },

  assignFormHandlers: function(invoice, dismissOnCancel) {
    // assign delete confirmation button handler
    $(this.confirmButtonSelector).click(
      $.proxy(this.onSubmitDelete, this, invoice));
    // assign cancel delete button handler
    $(this.cancelButtonSelector).click(
      $.proxy(this.onCancelDelete, this, invoice, dismissOnCancel)
    );
  },

  render: function(invoice, context) {
    // renders the InvoiceDeleteForm
    //
    var dismissOnCancel = false;
    if (context && 'dismissOnCancel' in context) {
      dismissOnCancel = context.dismissOnCancel;
    }

    var $renderedDiv = InvoiceModalDialogTemplateRenderer.render(this.templateName, invoice);
    InvoiceModalDialogTemplateRenderer.renderIntoPlacehoder(
      this.deleteQuestionPlaceholderSelector,
      this.deleteQuestionTemplateName,
      invoice
    );
    // update displaying of particular form fields
    InvoiceView.assignInvoiceStatusLabel($renderedDiv, invoice);
    // assign button handlers for rendered fragment
    this.assignFormHandlers(invoice, dismissOnCancel);
  }
};

// ============================================================================
// ============================================================================

var InvoiceMarkAsDoneForm = {
  templateName: '#invoice-short-info-question-template',

  raiseQuestionPlaceholderSelector: '#invoice-short-info-question-placeholder',
  raiseQuestionTemplateName: '#invoice-markasdone-question-template',
  confirmationTemplateName: '#invoice-markasdone-confirmation-template',

  confirmButtonSelector: '#confirm-button',
  cancelButtonSelector: '#cancel-button',
  markAsDoneStatusValue: '1',

  onServerResponseSuccess: function(invoice) {
    // Invoice action done successfully. Render confirmation form
    InvoiceModalDialogTemplateRenderer.renderIntoPlacehoder(
      InvoiceMarkAsDoneForm.raiseQuestionPlaceholderSelector,
      InvoiceMarkAsDoneForm.confirmationTemplateName,
      invoice
    );
    // update invoice row on the main list
    InvoiceListController.updateInvoiceRowById(invoice.id, invoice);
  },
  onServerResponseError: function(status, error) {
    ServerErrorForm.render(status, error);
  },

  onSubmit: function(invoice, event) {
    var url = InvoiceRequest.composeSubmitUrl(invoice);
    // get the status done value from the invoice-editing-form-template
    var markAsDoneData = {
      'status': InvoiceMarkAsDoneForm.markAsDoneStatusValue,
    }
    InvoiceRequest.patch(url, markAsDoneData,
      InvoiceMarkAsDoneForm.onServerResponseSuccess,
      InvoiceMarkAsDoneForm.onServerResponseError
    );
    event.preventDefault();
  },

  onCancel: function(invoice, dismissOnCancel) {
    if (dismissOnCancel) {
      InvoiceListController.hideModalDialog();
      return;
    }
    // return back to the information form
    InvoiceInformationForm.render(invoice);
  },

  assignFormHandlers: function(invoice, dismissOnCancel) {
    // assign confirmation button handler
    $(this.confirmButtonSelector).click(
      $.proxy(this.onSubmit, this, invoice));
    // assign cancel button handler
    $(this.cancelButtonSelector).click(
      $.proxy(this.onCancel, this, invoice, dismissOnCancel)
    );
  },

  render: function(invoice, context) {
    // renders the InvoiceMarkAsDoneForm
    //
    var dismissOnCancel = false;
    if (context && 'dismissOnCancel' in context) {
      dismissOnCancel = context.dismissOnCancel;
    }
    // render the form containing a short information and
    // render the question into the form
    var $renderedDiv = InvoiceModalDialogTemplateRenderer.render(this.templateName, invoice);
    InvoiceModalDialogTemplateRenderer.renderIntoPlacehoder(
      this.raiseQuestionPlaceholderSelector,
      this.raiseQuestionTemplateName,
      invoice
    );
    // update displaying of particular form fields
    InvoiceView.assignInvoiceStatusLabel($renderedDiv, invoice);
    // assign button handlers for rendered fragment
    this.assignFormHandlers(invoice, dismissOnCancel);
  }
};
