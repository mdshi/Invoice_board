import React from 'react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import { DoneBadge, NotDoneBadge } from '../Badges';
import TitledDialog, { DialogContent } from './TitledDialog';

export const invoiceInformationBody = invoice => (
  <React.Fragment>
    <Typography variant="body1" component="div">
      <p>
        <b>Name: </b>
        {' '}
        {invoice.name}
      </p>
    </Typography>
    <Divider />
    <Typography variant="body1" component="div">
      <p>
        <b>Created by: </b>
        {' '}
        {invoice.created_by_username}
      </p>
      <p>
        <b>Status: </b>
        {invoice.processed_by && <DoneBadge>{invoice.status_readable}</DoneBadge>}
        {!invoice.processed_by && <NotDoneBadge>{invoice.status_readable}</NotDoneBadge>}
      </p>
    </Typography>
    <Divider />
    <Typography variant="body1" component="div">
      <p>
        <b>Description: </b>
        {' '}
        {invoice.description}
      </p>
    </Typography>
  </React.Fragment>
);

export default function InvoiceInfoDialog(props) {
  const { invoiceObject: invoice } = props;

  return (
    <TitledDialog title="Invoice Information" {...props}>
      <DialogContent>{invoiceInformationBody(invoice)}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={props.closeDialog} color="primary">
          OK
        </Button>
      </DialogActions>
    </TitledDialog>
  );
}
