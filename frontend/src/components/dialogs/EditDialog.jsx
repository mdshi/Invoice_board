/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Formik } from 'formik';
import { renderFormikForm } from './CreateEditCommons';
import TitledDialog from './TitledDialog';

class EditDialog extends React.Component {
  render() {
    const { props } = this;

    return (
      <TitledDialog title="Edit Invoice" {...props}>
        <Formik
          initialValues={{ ...props.invoiceObject }}
          onSubmit={(values, actions) => {
            const { name, status, description } = values;
            props.onEditInvoice(
              props.invoiceObject.id,
              { name, status, description },
              /* success handler: */
              (data) => {
                actions.setSubmitting(false);
                props.enqueueSnackbar(`Invoice "${name}" updated.`, { variant: 'success' });
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

export default EditDialog;
