/* eslint-disable react/sort-comp */
import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { INVOICE_STATUSES } from '../constants';

class ApiRequestor {
  getRequestContext = (method, url, data, onSuccessHandler, onErrorHandler) => ({
    type: method,
    dataType: 'json',
    url,
    data,
    context: this,
    success: (obj, textStatus, jqXHR) => onSuccessHandler(obj),
    error: (xhr, textStatus, error) => onErrorHandler(xhr, textStatus, error),
  });

  post = (url, data, onSuccessHandler, onErrorHandler) => {
    const postContext = this.getRequestContext('POST', url, data, onSuccessHandler, onErrorHandler);
    $.ajax(postContext);
  };

  patch = (url, data, onSuccessHandler, onErrorHandler) => {
    const patchContext = this.getRequestContext('PATCH', url, data, onSuccessHandler, onErrorHandler);
    $.ajax(patchContext);
  };

  delete = (url, onSuccessHandler, onErrorHandler) => {
    const deleteContext = this.getRequestContext('DELETE', url, /* no data */ '', onSuccessHandler, onErrorHandler);
    $.ajax(deleteContext);
  };
}

class InvoicesStateContainer extends React.Component {
  static propTypes = {
    query: PropTypes.exact({
      searchValue: PropTypes.string.isRequired,
      limit: PropTypes.number.isRequired,
      offset: PropTypes.number.isRequired,
      statusFilter: PropTypes.string.isRequired,
    }).isRequired,
    onTotalNumberReceived: PropTypes.func.isRequired,
  };

  state = {
    isLoaded: false,
    invoiceList: [],
    currentTotalNumber: 0,
  };

  componentDidMount() {
    this.fetchInvoices();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.fetchInvoices();
    }
  }

  onEditInvoice = (invoiceId, partialData, onSuccess, onError) => {
    const api = new ApiRequestor();
    api.patch(
      `/api/invoices/${invoiceId}/`,
      partialData,
      (invoice) => {
        this.onEditSuccess(invoiceId, invoice);
        onSuccess(invoice);
      },
      (xhr, textStatus, error) => {
        this.onRequestError(invoiceId, xhr.status, error);
        onError(xhr.status, error, xhr.responseJSON);
      },
    );
  };

  onCreateInvoice = (invoiceData, onSuccess, onError) => {
    const api = new ApiRequestor();
    api.post(
      '/api/invoices/',
      invoiceData,
      (invoice) => {
        this.onCreateSuccess(invoice);
        onSuccess(invoice);
      },
      (xhr, textStatus, error) => {
        this.onRequestError(undefined, xhr.status, error);
        onError(xhr.status, error, xhr.responseJSON);
      },
    );
  };

  onDeleteInvoice = (invoiceId, onSuccess, onError) => {
    const api = new ApiRequestor();
    api.delete(
      `/api/invoices/${invoiceId}/`,
      () => {
        this.onDeleteSuccess(invoiceId);
        onSuccess();
      },
      (xhr, textStatus, error) => {
        this.onRequestError(invoiceId, xhr.status, error);
        onError(xhr.status, error, xhr.responseJSON.detail);
      },
    );
  };

  onInvoiceMarkPaid = (invoiceId, onSuccess, onError) => {
    const api = new ApiRequestor();
    api.patch(
      `/api/invoices/${invoiceId}/`,
      { status: INVOICE_STATUSES.PAID },
      (invoice) => {
        this.onInvoiceMarkPaidSuccess(invoiceId, invoice);
        onSuccess(invoice);
      },
      (xhr, textStatus, error) => {
        this.onRequestError(invoiceId, xhr.status, error);
        onError(xhr.status, error, xhr.responseJSON);
      },
    );
  }

  getInvoiceManageFuncs() {
    return {
      onEditinvoice: this.onEditInvoice,
      onCreateInvoice: this.onCreateInvoice,
      onDeleteInvoice: this.onDeleteInvoice,
      onInvoiceMarkDone: this.onInvoiceMarkDone,
    };
  }

  getQueryParams() {
    const {
      searchValue, limit, offset, statusFilter,
    } = this.props.query;
    const queryParams = { limit, offset };
    if (statusFilter !== '-1') {
      queryParams.status = statusFilter;
    }
    if (searchValue) {
      queryParams.search = searchValue;
    }

    return queryParams;
  }

  fetchInvoices() {
    fetch(`api/invoices/?${qs.stringify(this.getQueryParams())}`)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState(
            {
              isLoaded: true,
              invoiceList: result.results,
              currentTotalNumber: result.count,
            },
            () => this.props.onTotalNumberReceived(result.count),
          );
        },
        error => this.setState({ isLoaded: false, error }),
      );
  }

  onEditSuccess = (invoiceId, serverResponseInvoice) => {
    const modifiedList = [...this.state.invoiceList];
    const idx = modifiedList.findIndex(invoice => invoice.id === invoiceId);
    const modifiedInvoice = modifiedList[idx];

    for (const prop in serverResponseInvoice) {
      modifiedInvoice[prop] = serverResponseInvoice[prop];
    }

    this.setState({ invoiceList: modifiedList });
  };

  onCreateSuccess = (serverResponseInvoice) => {
    let modifiedList = [...this.state.invoiceList];
    modifiedList.unshift(serverResponseInvoice);
    this.setState({ invoiceList: modifiedList });
  }

  onDeleteSuccess = (invoiceId) => {
    let modifiedList = [...this.state.invoiceList];
    const idx = modifiedList.findIndex(invoice => invoice.id === invoiceId);

    modifiedList.splice(idx, 1);
    this.setState({ invoiceList: modifiedList });
  }

  onInvoiceMarkDoneSuccess = (invoiceId, serverResponseInvoice) => {
    return this.onEditSuccess(invoiceId, serverResponseInvoice);
  }

  onRequestError = (invoiceId, status, error) => {
    console.log(status, error);
  };

  render() {
    return this.props.children(this.getInvoiceManageFuncs(), this.state.invoiceList);
  }
}

export default InvoicesStateContainer;
