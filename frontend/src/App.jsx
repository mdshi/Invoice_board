import React from 'react';
import memoizeOne from 'memoize-one';
import './App.css';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { blue } from '@material-ui/core/colors';
import InvoiceBoardHeader from './components/InvoiceBoardHeader';
import InvoiceList from './components/InvoiceList';
import { DEFAULT_LIMIT, DEFAULT_OFFSET, DEFAULT_STATUS_FILTER } from './constants';
import InvoiceStateContainer from './components/InvoicesStateContainer';
import withDialogs from './components/withDialogs';
import Layout from './components/Layout';

const theme = createMuiTheme({
  palette: {
    primary: { main: blue[800] },
  },
});

const getQueryObject = memoizeOne((searchValue, limit, offset, statusFilter) => ({
  searchValue,
  limit,
  offset,
  statusFilter,
}));

class App extends React.Component {
  state = {
    currentUserId: null,
    profileUrl: '',
    fullName: '',
    invoicesTotalNumber: 0,
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
    statusFilter: DEFAULT_STATUS_FILTER,
    searchValue: '',
  };

  componentDidMount() {
    fetch('api/globals/')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            invoicesTotalNumber: result.invoices_total,
            currentUserId: result.current_user,
            profileUrl: result.profile_url,
            fullName: result.fullname,
          });
        },
        error => this.setState({ error }),
      );
  }

  onPageChanged = (pageNumber) => {
    const offset = pageNumber * this.state.limit;
    console.log(offset);
    this.setState({ offset });
  };

  onInvoiceStatusFilterChanged = (selectedValue) => {
    if (this.state.statusFilter !== selectedValue) {
      this.setState({
        limit: DEFAULT_LIMIT,
        offset: DEFAULT_OFFSET,
        statusFilter: selectedValue,
      });
    }
  };

  onSearchRequested = (value) => {
    if (this.state.searchValue !== value) {
      this.setState({
        searchValue: value,
        limit: DEFAULT_LIMIT,
        offset: DEFAULT_OFFSET,
        statusFilter: DEFAULT_STATUS_FILTER,
      });
    }
  };

  onInvoicesTotalNumberReceived = (newNumber) => {
    if (this.state.invoiceTotalNumber !== newNumber) {
      this.setState({ invoiceTotalNumber: newNumber });
    }
  };

  render() {
    const {
      searchValue, limit, offset, invoiceTotalNumber, currentUserId, statusFilter,
      profileUrl, fullName,
    } = this.state;

    const { setShowDialog, getDialog } = this.props;

    return (
      <div className="App">
        <ThemeProvider theme={theme}>
          <Layout profileUrl={profileUrl} fullName={fullName}>
            <InvoiceBoardHeader
              invoiceTotalNumber={invoiceTotalNumber}
              limit={limit}
              offset={offset}
              onPageChange={this.onPageChanged}
              onSearchRequested={this.onSearchRequested}
              setShowDialog={setShowDialog}
            />
            <InvoiceStateContainer
              query={getQueryObject(searchValue, limit, offset, statusFilter)}
              onTotalNumberReceived={this.onInvoicesTotalNumberReceived}
            >
              {(invoiceManageFuncs, invoiceList) => (
                <React.Fragment>
                  <InvoiceList
                    invoiceList={invoiceList}
                    currentUserId={currentUserId}
                    statusFilter={statusFilter}
                    onStatusFilterChanged={this.onInvoiceStatusFilterChanged}
                    setShowDialog={setShowDialog}
                  />
                  {getDialog(invoiceManageFuncs, invoiceList)}
                </React.Fragment>
              )}
            </InvoiceStateContainer>
          </Layout>
        </ThemeProvider>
      </div>
    );
  }
}

export default withDialogs(App);
