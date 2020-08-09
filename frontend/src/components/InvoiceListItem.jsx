/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { styled } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import Link from '@material-ui/core/Link';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { DoneBadge, NotDoneBadge } from './Badges';

const ActionsTableCell = styled(TableCell)({
  // eliminates shrinking of action buttons cell when there is only one button
  width: '25%',
});

export default function InvoiceListItem(props) {
  const invoice = props.data;
  const isOwnedByUser = props.currentUserId === invoice.created_by;
  const isInvoicePaid = invoice.status === 1;

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <Typography>
          <Link component="button" variant="body1" onClick={() => props.onInvoiceNameClick()}>
            {invoice.name}
          </Link>
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography caption="body1">{invoice.created_by_username}</Typography>
      </TableCell>
      <TableCell align="center">
        {invoice.processed_by && (
          <React.Fragment>
            <DoneBadge>{invoice.status_readable}</DoneBadge>
            <Typography variant="caption">
              <span className="invoice-accomplished-by">{`by ${invoice.processed_by}`}</span>
            </Typography>
          </React.Fragment>
        )}
        {!invoice.processed_by && <NotDoneBadge>{invoice.status_readable}</NotDoneBadge>}
      </TableCell>
      <ActionsTableCell align="center">
        {isOwnedByUser && (
          <React.Fragment>
            <IconButton aria-label="edit" onClick={() => props.onInvoiceEditClick()}>
              <EditIcon color="primary" />
            </IconButton>
            <IconButton aria-label="delete" onClick={() => props.onInvoiceDeleteClick()}>
              <DeleteIcon color="primary" />
            </IconButton>
          </React.Fragment>
        )}
        <IconButton aria-label="Mark as Done" disabled={isInvoicePaid} onClick={() => props.onInvoiceMarkDoneClick()}>
          <DoneIcon color={!isInvoicePaid ? 'primary' : 'disabled'} />
        </IconButton>
      </ActionsTableCell>
    </TableRow>
  );
}
