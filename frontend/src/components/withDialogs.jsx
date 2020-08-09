import React from 'react';
import { withSnackbar } from 'notistack';
import InvoiceInfoDialog from './dialogs/InfoDialog';
import InvoiceEditDialog from './dialogs/EditDialog';
import InvoiceCreateDialog from './dialogs/CreateDialog';
import InvoiceDeleteDialog from './dialogs/DeleteDialog';
import InvoiceMarkDoneDialog from './dialogs/MarkDoneDialog';
import { invoiceActions } from '../constants';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

/*
* HoC that provides the capability to show the Invoice related dialogs.
*/
const withDialogs = (WrappedComponent) => {
  class WithDialogs extends React.Component {
    state = {
      showDialog: {
        actionType: invoiceActions.None,
        invoiceId: undefined,
      },
    };

    setShowDialog = (actionType, invoiceId) => {
      this.setState({
        showDialog: { actionType, invoiceId },
      });
    };

    onDialogClose = () => {
      this.setState({ showDialog: {} });
    };

    getDialog = (invoiceManageFuncs, invoiceList) => {
      // In case some dialog was requested to be shown, prepares the dialog component
      // and provides it with the event handlers.
      const { actionType, invoiceId } = this.state.showDialog;
      if (!actionType) {
        return null;
      }

      let DialogComponent;
      const dialogProps = {
        closeDialog: this.onDialogClose,
      };

      switch (actionType) {
        case invoiceActions.InvoiceMarkDone:
          DialogComponent = withSnackbar(InvoiceMarkDoneDialog);
          dialogProps.onInvoiceMarkDone = invoiceManageFuncs.onInvoiceMarkDone;
          break;
        case invoiceActions.DeleteInvoice:
          DialogComponent = withSnackbar(InvoiceDeleteDialog);
          dialogProps.onDeleteInvoice = invoiceManageFuncs.onDeleteInvoice;
          break;
        case invoiceActions.ShowInvoiceInfo:
          DialogComponent = InvoiceInfoDialog;
          break;
        case invoiceActions.EditInvoice:
          DialogComponent = withSnackbar(InvoiceEditDialog);
          dialogProps.onEditInvoice = invoiceManageFuncs.onEditInvoice;
          break;
        case invoiceActions.CreateInvoice:
          DialogComponent = withSnackbar(InvoiceCreateDialog);
          dialogProps.onCreateInvoice = invoiceManageFuncs.onCreateInvoice;
          break;
        default:
          DialogComponent = null;
          break;
      }
      if (!DialogComponent) {
        return null;
      }

      if (DialogComponent && invoiceId) {
        dialogProps.invoiceObject = invoiceList.find(invoice => invoice.id === invoiceId);
      }

      return <DialogComponent {...dialogProps} />;
    };

    render() {
      return <WrappedComponent setShowDialog={this.setShowDialog} getDialog={this.getDialog} {...this.props} />;
    }
  }

  WithDialogs.displayName = `withApi(${getDisplayName(WrappedComponent)})`;
  return WithDialogs;
};

export default withDialogs;
