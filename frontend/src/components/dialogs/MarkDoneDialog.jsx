import React from 'react';
import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import MuiDialogContentText from '@material-ui/core/DialogContentText';
import TitledDialog, { DialogContent } from './TitledDialog';
import { invoiceInformationBody } from './InfoDialog';

const DialogContentText = styled(MuiDialogContentText)({
  color: '#26a69a',
});

const DoneButton = styled(Button)({
  color: '#26a69a',
  borderColor: 'inherit',
});

export default function InvoiceMarkDoneDialog(props) {
  const { invoiceObject: invoice } = props;

  return (
    <TitledDialog title="Mark as Paid" {...props}>
      <DialogContent>
        <DialogContentText>Are you sure you want to mark this invoice as "Paid"?</DialogContentText>
        {invoiceInformationBody(invoice)}
      </DialogContent>
      <DialogActions>
        <DoneButton
          variant="outlined"
          onClick={() => {
            // closing the dialog early, otherwise after successful delete
            // it will be rerendered with undefined invoice.
            props.closeDialog();
            props.onInvoiceMarkDone(
              props.invoiceObject.id,
              /* success handler: */
              () => {
                props.enqueueSnackbar(`Invoice "${invoice.name}" marked as "Paid"`, { variant: 'success' });
              },
              /* error handler: */
              (serverStatus, error, responseText) => {
                props.enqueueSnackbar(`Error ${serverStatus}: ${error}. ${responseText}`, { variant: 'error' });
              },
            );
          }}
        >
          Paid
        </DoneButton>
        <Button variant="outlined" type="submit" onClick={props.closeDialog}>
          Cancel
        </Button>
      </DialogActions>
    </TitledDialog>
  );
}
