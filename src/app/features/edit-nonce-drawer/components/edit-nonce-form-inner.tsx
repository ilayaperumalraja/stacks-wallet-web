import { useFormikContext } from 'formik';
import { Button, Stack } from '@stacks/ui';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useDrawers } from '@app/common/hooks/use-drawers';

import { EditNonceField } from './edit-nonce-field';
import { TransactionFormValues } from '@app/common/transactions/transaction-utils';

export function EditNonceFormInner(): JSX.Element {
  const { handleSubmit } = useFormikContext<TransactionFormValues>();
  const { isLoading } = useLoading(LoadingKeys.EDIT_NONCE_DRAWER);
  const { setShowEditNonce } = useDrawers();

  return (
    <>
      <Stack>
        <EditNonceField />
      </Stack>
      <Stack isInline>
        <Button
          onClick={() => setShowEditNonce(false)}
          flexGrow={1}
          borderRadius="10px"
          mode="tertiary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          flexGrow={1}
          onClick={handleSubmit}
          isLoading={isLoading}
          borderRadius="10px"
        >
          Apply
        </Button>
      </Stack>
    </>
  );
}
