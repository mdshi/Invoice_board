function serializeForm(form) {
  return _.object(_.map(form.serializeArray(), function(item) {
    // Convert object to tuple of (name, value)
    return [item.name, item.value];
  }));
}

var InvoiceRequest = {
  invoiceRootUrl: '/invoices/',
  invoiceSubmitUrl: ['INVOICE ROOT HERE', 'INVOICE ID HERE', '/'],
  invoice_test_reponse: {
    // sample invoice object that can be used anywhere across the front-end
    processed_by: null,
    processed_by_username: null,
    created_by: 1,
    created_by_username: "alex",
    description: "TEST_DESCRIPTION",
    id: 10000000,
    name: "TEST_INVOICE_NAME",
    status: 0,
    status_readable: "Not done",
  },

  composeSubmitUrl: function(invoice) {
    var url = InvoiceRequest.invoiceSubmitUrl;
    url[0] = InvoiceRequest.invoiceRootUrl;
    url[1] = invoice.id;
    return url.join('');
  },
  getRequestContext: function(method, url, data, onSuccessHandler, onErrorHandler) {
    return {
      "type": method,
      "dataType": "json",
      "url": url,
      "data": data,
      context: this,
      success: $.proxy(this.onRequestSuccess, this, onSuccessHandler),
      error: $.proxy(this.onRequestFailed, this, onErrorHandler),
    };
  },

  test: function(url, data, onSuccessHandler, onErrorHandler) {
    // returns a invoice object that can be used accross the front-end application.
    onSuccessHandler(this.invoice_test_reponse);
  },

  post: function(url, data, onSuccessHandler, onErrorHandler) {
    var postContext = this.getRequestContext('POST', url, data, onSuccessHandler, onErrorHandler);
    $.ajax(
      postContext
    );
  },
  patch: function(url, data, onSuccessHandler, onErrorHandler) {
    var patchContext = this.getRequestContext('PATCH', url, data, onSuccessHandler, onErrorHandler);
    $.ajax(
      patchContext
    );
  },
  delete: function(url, onSuccessHandler, onErrorHandler) {
    var deleteContext = this.getRequestContext('DELETE', url, /* no data */ '', onSuccessHandler, onErrorHandler);
    $.ajax(
      deleteContext
    );
  },

  onRequestSuccess: function(onSuccessHandler, data, textStatus, jqXHR) {
    onSuccessHandler(data);
  },
  onRequestFailed: function(onErrorHandler, xhr, textStatus, error) {
    onErrorHandler(xhr.status, error);
    console.log(error);
  },
};

var InvoiceTemplateRenderer = {
  renderTemplate: function(templateName, templateContext) {
    var formTemplate = $(templateName);
    var template = _.template(formTemplate.html());
    var html = template(templateContext);
    return html;
  },
  renderIntoDiv: function(templateName, templateContext) {
    var html = InvoiceTemplateRenderer.renderTemplate(templateName, templateContext);
    var $newDiv = $("<div></div>", {
      html: html
    });

    return $newDiv;
  },
  renderIntoPlacehoder: function(placeholder, temlateName, templateContext) {
    var $div = this.renderIntoDiv(temlateName, templateContext);
    $(placeholder).html($div);
  },
};

var InvoiceModalDialogTemplateRenderer = Object.create(InvoiceTemplateRenderer);
_.extend(InvoiceModalDialogTemplateRenderer, {
  placeToRender: '.invoice-form-wrapper',

  render: function(temlateName, templateContext) {
    // render invoice data into template
    var $div = this.renderIntoDiv(temlateName, templateContext);
    $(this.placeToRender).html($div);
    return $div;
  },
});

var InvoiceView = {
  // Contains the logic on updating of invoice information displayed in the columns
  // of the Invoice List.
  //
  invoiceListItemFieldSelectors: { // fields of invoice object corresponding to selectors
    'name': '.invoice-name',
    'created_by_username': '.invoice-created-by-username',
    'status_readable': {
      'selector': '.invoice-status',
      'updateMethod': 'updateInvoiceStatusColumn',
    },
    'processed_by_username': {
      'selector': '.invoice-accomplished-by',
      'updateMethod': 'updateInvoiceAccomplishedByColumn',
    }
  },
  invoiceStatusClasses: {
    'DONE': 'label label-success',
    'NOT DONE': 'label label-primary',
  },
  allowedButtonsForOwner: ['edit', 'delete', 'markAsDone'],
  allowedButtonsForEverybody: ['markAsDone'],

  updateInvoiceColumns: function($invoiceRow, invoice) {
    // updating of invoice list columns with the values of Invoice object.
    //
    $.each(this.invoiceListItemFieldSelectors, function(invoiceField, selector) {
      // place invoice object values into the corresponding invoice column by selector
      if (invoiceField in invoice) {
        if (selector.hasOwnProperty('updateMethod')) {
          // special update method exists, so deligate column update to it.
          var updateMethod = selector.updateMethod;
          if (!InvoiceView.hasOwnProperty(updateMethod)) {
            throw updateMethod + ' is absent on the object';
          }
          selector = selector.selector;
          if ($invoiceRow.find(selector).length) {
            InvoiceView[updateMethod]($invoiceRow, invoice, invoice[invoiceField], selector);
          }
        } else if ($invoiceRow.find(selector).length) {
          $invoiceRow.find(selector).text(invoice[invoiceField]);
        }
      }
    });
    // display buttons based on update invoice information
    InvoiceView.displayInvoiceButtons($invoiceRow, invoice, InvoiceListController.listControlButtonSelectors);
  },
  updateInvoiceStatusColumn: function($invoiceRow, invoice, fieldValue, selector) {
    // special update method for the invoice 'status' column.
    //
    // get the particular placeholder where to place the value
    var $column = $invoiceRow.find(selector);
    if ($column.length !== 0) {
      var statusClass = InvoiceView.invoiceStatusClasses[fieldValue.toUpperCase()]
      if (statusClass !== undefined) {
        $column.removeClass('label');
        $column.removeClass('label-primary');
        $column.removeClass('label-success');
        $column.addClass(statusClass);
      } else {
        throw "Can't find the class for the " + fieldValue.toUpperCase() + " status";
      }
      $column.text(fieldValue);
    }
  },
  updateInvoiceAccomplishedByColumn: function($invoiceRow, invoice, fieldValue, selector) {
    // special update method for the invoice 'processed_by' column,
    // its rendering depends on the invoice 'status' value.
    //
    // get the particular placeholder where to place the value
    var $column = $invoiceRow.find(selector);
    if ($column.length === 0) {
      return;
    }
    $column.empty();
    if ('status' in invoice && invoice['status'] == 1) {
      $column.html('</p> by ' + fieldValue);
    }
  },
  assignInvoiceStatusLabel: function($invoiceRow, invoice) {
    // add the label class according to status. Done - label-success.
    //
    var invoiceField = 'status_readable';
    var statusValue = invoice[invoiceField];
    var selector = InvoiceView.invoiceListItemFieldSelectors[invoiceField].selector;
    InvoiceView.updateInvoiceStatusColumn($invoiceRow, invoice, statusValue, selector);
  },
  assignInvoiceAccomplishedBy: function($invoiceRow, invoice) {
    // display the processed_by sting on the invoice
    //
    var invoiceField = 'processed_by_username';
    var statusValue = invoice[invoiceField];
    var selector = InvoiceView.invoiceListItemFieldSelectors[invoiceField].selector;
    InvoiceView.updateInvoiceAccomplishedByColumn($invoiceRow, invoice, statusValue, selector);
  },
  displayInvoiceButtons: function($invoiceRow, invoice, buttonToSelectorsMapping) {
    // display invoice action buttons based on invoice ownership.
    //
    var currentUserId = InvoiceListController.getCurrentUserId();
    var buttonsToDisplay = this.allowedButtonsForEverybody;
    if (invoice.created_by == currentUserId) {
      buttonsToDisplay = this.allowedButtonsForOwner;
    }

    $.each(buttonToSelectorsMapping, function(buttonName, buttonSelector) {
      if (buttonsToDisplay.indexOf(buttonName) != -1) {
        $invoiceRow.find(buttonSelector).show();
        $invoiceRow.find(buttonSelector).prop('disabled', false);
      } else {
        $invoiceRow.find(buttonSelector).hide();
        $invoiceRow.find(buttonSelector).prop('disabled', true);
      }
    });
    if (invoice['status'] == 1) {
      // disable the 'markAsDone' button if invoice is 'Done'
      var buttonSelector = buttonToSelectorsMapping['markAsDone'];
      $invoiceRow.find(buttonSelector).prop('disabled', true);
    }
  },
}

var InvoiceListController = {
  // Manages the Invoice table and its rows
  //
  invoiceListSelector: '.invoice-list',
  invoiceListItemSelector: '.invoice-list-item',
  invoiceListItemIdSelector: '.invoice-list-item#invoice-id-',

  invoiceListItemDialogTogglerSelector: '.invoice-link-dialog-toggler',
  listControlButtonSelectors: {
    'edit': '#edit-button',
    'delete': '#delete-button',
    'markAsDone': '#markdone-button',
  },
  invoiceAddButtonSelector: '#add-button',
  invoiceTableRowTemplate: '#invoice-table-row-template',

  getInvoiceRow: function(id) {
    var $invoiceRow = $(this.invoiceListItemIdSelector + id);
    return $invoiceRow;
  },
  getInvoiceRowFromChildElem: function($elem) {
    var $currentInvoiceItem = $elem.parents(this.invoiceListItemSelector);
    return $currentInvoiceItem;
  },
  getInvoiceDataFromChildElem: function($elem) {
    var $currentInvoiceItem = this.getInvoiceRowFromChildElem($elem);
    var invoice = $currentInvoiceItem.data();
    return invoice;
  },

  updateInvoiceRow: function ($invoiceRow, invoice) {
    this.updateRowDataAttributes($invoiceRow, invoice);
    InvoiceView.updateInvoiceColumns($invoiceRow, invoice);
  },
  updateInvoiceRowById: function(id, invoice) {
    var $invoiceRow = this.getInvoiceRow(id);
    this.updateInvoiceRow($invoiceRow, invoice);
  },
  updateRowDataAttributes: function($invoiceRow, invoice) {
    // updating  <tr class="invoice-list-item" ... data-...
    $.each(invoice, function(key, value) {
      $invoiceRow.data(key, value);
      $invoiceRow.attr('data-' + key, value);
    });
  },
  addInvoiceRow: function(invoice) {
    var tr = InvoiceTemplateRenderer.renderTemplate(
      this.invoiceTableRowTemplate, invoice
    );
    var $invoiceRow = $(tr);
    // update invoice <tr id> property
    var invoiceId = $invoiceRow.prop('id') + invoice.id;
    $invoiceRow.prop('id', invoiceId);
    // fill the invoice columns with values
    this.updateInvoiceRow($invoiceRow, invoice);
    // insert invoice into the table
    $('#invoice-table-header').after($invoiceRow);
  },
  deleteInvoiceRow: function(id) {
    var $invoiceRow = this.getInvoiceRow(id);
    $invoiceRow.remove();
  },

  assignListButtonHandlers: function() {
    // assign Edit button handler of the Invoice information form
    var $invoiceList = $(this.invoiceListSelector);
    $invoiceList.on('click', '.control-buttons>' + this.listControlButtonSelectors['edit'],
      $.proxy(InvoiceListController.onInvoiceListEditButtonClick, InvoiceListController));
    $invoiceList.on('click', '.control-buttons>' + this.listControlButtonSelectors['delete'],
      $.proxy(InvoiceListController.onInvoiceListDeleteButtonClick, InvoiceListController));
    $invoiceList.on('click', '.control-buttons>' + this.listControlButtonSelectors['markAsDone'],
      $.proxy(InvoiceListController.onInvoiceLiskMarkDoneButtonClick, InvoiceListController));
    $(InvoiceListController.invoiceAddButtonSelector).click(
      $.proxy(InvoiceListController.onInvoiceAddButtonClick, InvoiceListController)
    );
  },
  processInvoiceColumnValuesInList: function() {
    $(this.invoiceListItemSelector).each(function(idx, invoiceRow) {
      var $invoiceRow = $(invoiceRow);
      var invoice = $invoiceRow.data();
      InvoiceView.assignInvoiceStatusLabel($invoiceRow, invoice);
      InvoiceView.assignInvoiceAccomplishedBy($invoiceRow, invoice);
      InvoiceView.displayInvoiceButtons($invoiceRow, invoice, InvoiceListController.listControlButtonSelectors);
    });
  },

  onInvoiceListEditButtonClick: function(event) {
    var $button = $(event.currentTarget);
    var invoice = InvoiceListController.getInvoiceDataFromChildElem($button);
    InvoiceEditingForm.render(invoice, {
      dismissOnCancel: true
    });
    // propagate event so the modal window could be opened
  },
  onInvoiceListDeleteButtonClick: function(event) {
    var $button = $(event.currentTarget);
    var invoice = InvoiceListController.getInvoiceDataFromChildElem($button);
    InvoiceDeleteForm.render(invoice, {
      dismissOnCancel: true
    });
    // propagate event so the modal window could be opened
  },
  onInvoiceLiskMarkDoneButtonClick: function(event) {
    var $button = $(event.currentTarget);
    var invoice = InvoiceListController.getInvoiceDataFromChildElem($button);
    InvoiceMarkAsDoneForm.render(invoice, {
      dismissOnCancel: true
    });
    // propagate event so the modal window could be opened
  },
  onInvoiceListItemDialogToggle: function(event) {
    // get the current invoice data from event
    var $button = $(event.currentTarget);
    var invoice = InvoiceListController.getInvoiceDataFromChildElem($button);

    InvoiceInformationForm.render(invoice);
    // propagate event so the modal window could be opened
  },
  onInvoiceAddButtonClick: function(event) {
    InvoiceAddForm.render();
  },

  hideModalDialog: function() {
    $('#invoice-modal-form').modal('hide');
    $('.modal-backdrop').remove();
  },

  getCurrentUserId: function() {
    return $('#current-user-id').data('id');
  },

  init: function() {
    $(this.invoiceListSelector).on('click',
      this.invoiceListItemDialogTogglerSelector, this.onInvoiceListItemDialogToggle);
    this.assignListButtonHandlers();
    this.processInvoiceColumnValuesInList();
  },
}

$(function() {
  $.ajaxPrefilter(function(settings, originalOptions, xhr) {
    var csrftoken;
    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      // Send the token to same-origin, relative URLs only.
      // Send the token only if the method warrants CSRF protection
      // Using the CSRFToken value acquired earlier
      csrftoken = getCookie('csrftoken');
      xhr.setRequestHeader('X-CSRFToken', csrftoken);
    }
  });

  InvoiceListController.init();
}());
