import React from 'react';
import { styled } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import SearchBar from 'material-ui-search-bar';
import Pagination from './Pagination';
import { invoiceActions } from '../constants';

const StyledSearchBar = styled(SearchBar)({
  marginBlockStart: '1em',
  marginBlockEnd: '1em',
  width: '95%',
});

const StyledAddButton = styled(Button)({
  minWidth: '3em',
  minHeight: '2.5em',
  fontSize: '1rem',
  padding: '0',
});

class InvoiceBoardHeader extends React.Component {
  state = {
    searchValue: '',
  };

  render() {
    const {
      limit, offset, invoicesTotalNumber, onPageChange, onSearchRequested, setShowDialog,
    } = this.props;

    return (
      <React.Fragment>
        <Grid container alignItems="center" justify="flex-start" direction="row">
          <Grid item xs={1}>
            <StyledAddButton
              variant="outlined"
              color="primary"
              aria-label="add"
              onClick={() => setShowDialog(invoiceActions.CreateInvoice)}
            >
              <AddIcon fontSize="large" />
            </StyledAddButton>
          </Grid>
          <Grid item xs={6}>
            {!!invoicesTotalNumber && (
              <Pagination limit={limit} offset={offset} count={invoicesTotalNumber} onPageChange={onPageChange} />
            )}
          </Grid>
          <Grid item xs={5}>
            <StyledSearchBar
              value={this.state.searchValue}
              onChange={newValue => this.setState({ searchValue: newValue })}
              onCancelSearch={() => onSearchRequested(null)}
              onRequestSearch={() => onSearchRequested(this.state.searchValue)}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default InvoiceBoardHeader;
