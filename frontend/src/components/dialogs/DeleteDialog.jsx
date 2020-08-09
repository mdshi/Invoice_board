import React from 'react';
import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import MuiDialogContentText from '@material-ui/core/DialogContentText';
import TitledDialog, { DialogContent } from './TitledDialog';
import { invoiceInformationBody } from './InfoDialog';

const DialogContentText = styled(MuiDialogContentText)({
  color: 'red',
});

export default function InvoiceDeleteDialog(props) {
  const { invoiceObject: invoice } = props;

  return (
    <TitledDialog title="Delete Invoice" {...props}>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete this invoice?</DialogContentText>
        {invoiceInformationBody(invoice)}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            // closing the dialog early, otherwise after successful delete
            // it will be rerendered with undefined invoice.
            props.closeDialog();
            props.onDeleteInvoice(
              props.invoiceObject.id,
              /* success handler: */
              () => {
                props.enqueueSnackbar(`Invoice "${invoice.name}" deleted.`, { variant: 'success' });
              },
              /* error handler: */
              (serverStatus, error, responseText) => {
                props.enqueueSnackbar(`Error ${serverStatus}: ${error}. ${responseText}`, { variant: 'error' });
              },
            );
          }}
        >
          Delete
        </Button>
        <Button variant="outlined" type="submit" color="primary" onClick={props.closeDialog}>
          Cancel
        </Button>
      </DialogActions>
    </TitledDialog>
  );
}
