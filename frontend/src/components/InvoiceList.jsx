/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import InvoiceListItem from './InvoiceListItem';
import InvoiceListTable from './Table';
import { invoiceActions } from '../constants';

class InvoiceList extends React.Component {
  render() {
    const { invoiceList } = this.props;
    const { currentUserId, statusFilter } = this.props;
    const { onStatusFilterChanged, setShowDialog } = this.props;

    return (
      <React.Fragment>
        <InvoiceListTable statusFilter={statusFilter} onStatusFilterChanged={onStatusFilterChanged}>
          {invoiceList.length > 0
            && invoiceList.map(listItem => (
              <InvoiceListItem
                id={listItem.id}
                key={listItem.id}
                data={listItem}
                currentUserId={currentUserId}
                onInvoiceNameClick={() => setShowDialog(invoiceActions.ShowInvoiceInfo, listItem.id)}
                onInvoiceEditClick={() => setShowDialog(invoiceActions.EditInvoice, listItem.id)}
                onInvoiceDeleteClick={() => setShowDialog(invoiceActions.DeleteInvoice, listItem.id)}
                onInvoiceMarkDoneClick={() => setShowDialog(invoiceActions.InvoiceMarkDone, listItem.id)}
              />
            ))}
        </InvoiceListTable>
      </React.Fragment>
    );
  }
}

export default InvoiceList;
