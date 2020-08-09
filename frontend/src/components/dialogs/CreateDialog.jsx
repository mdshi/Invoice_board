/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Formik } from 'formik';
import { INVOICE_STATUSES } from '../../constants';
import { renderFormikForm } from './CreateEditCommons';
import TitledDialog from './TitledDialog';

class CreateDialog extends React.Component {
  render() {
    const { props } = this;

    return (
      <TitledDialog title="Create New Invoice" {...props}>
        <Formik
          initialValues={{ status: INVOICE_STATUSES.NOT_PAID, name: '', description: '' }}
          onSubmit={(values, actions) => {
            const { name, status, description } = values;
            props.onCreateInvoice(
              { name, status, description },
              /* success handler: */
              (data) => {
                actions.setSubmitting(false);
                props.enqueueSnackbar(`Invoice "${data.name}" created.`, { variant: 'success' });
                props.closeDialog();
              },
              /* error handler: */
              (serverStatus, error, responseJSON) => {
                actions.setSubmitting(false);
                actions.setErrors(responseJSON);
                if (serverStatus > 400) {
                  actions.setStatus({
                    error: true,
                    msg: `Error ${serverStatus}: ${error}`,
                  });
                }
              },
            );
          }}
          render={renderFormikForm(props)}
        />
      </TitledDialog>
    );
  }
}

export default CreateDialog;
