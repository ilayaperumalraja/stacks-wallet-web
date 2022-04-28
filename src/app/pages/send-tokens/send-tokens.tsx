import { memo, Suspense, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Formik } from 'formik';
import { StacksTransaction } from '@stacks/transactions';

import { useHomeTabs } from '@app/common/hooks/use-home-tabs';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { LoadingKeys } from '@app/common/hooks/use-loading';
import { useDrawers } from '@app/common/hooks/use-drawers';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useHandleSubmitTransaction } from '@app/common/hooks/use-submit-stx-transaction';
import { Header } from '@app/components/header';
import { EditNonceDrawer } from '@app/features/edit-nonce-drawer/edit-nonce-drawer';
import { HighFeeDrawer } from '@app/features/high-fee-drawer/high-fee-drawer';
import { useSelectedAsset } from '@app/pages/send-tokens/hooks/use-selected-asset';
import { useSendFormValidation } from '@app/pages/send-tokens/hooks/use-send-form-validation';
import { useCurrentAccountNonce } from '@app/store/accounts/nonce.hooks';
import { useFeeEstimationsState } from '@app/store/transactions/fees.hooks';
import { useSignTransactionSoftwareWallet } from '@app/store/transactions/transaction.hooks';
import { logger } from '@shared/logger';
import { Estimations } from '@shared/models/fees-types';
import { RouteUrls } from '@shared/route-urls';

import { SendTokensConfirmDrawer } from './components/send-tokens-confirm-drawer/send-tokens-confirm-drawer';
import { SendFormInner } from './components/send-form-inner';

function SendTokensFormBase() {
  const navigate = useNavigate();
  const { showEditNonce } = useDrawers();
  const [isShowing, setShowing] = useState(false);
  const [assetError, setAssetError] = useState<string | undefined>(undefined);
  const { setActiveTabActivity } = useHomeTabs();
  const { selectedAsset } = useSelectedAsset();
  const sendFormSchema = useSendFormValidation({ setAssetError });
  const [_, setFeeEstimations] = useFeeEstimationsState();
  const signSoftwareWalletTx = useSignTransactionSoftwareWallet();
  const nonce = useCurrentAccountNonce();
  const analytics = useAnalytics();

  useRouteHeader(<Header title="Send" onClose={() => navigate(RouteUrls.Home)} />);

  const handleConfirmDrawerOnClose = useCallback(() => {
    setShowing(false);
    void setActiveTabActivity();
  }, [setActiveTabActivity]);

  const broadcastTransactionFn = useHandleSubmitTransaction({
    loadingKey: LoadingKeys.CONFIRM_DRAWER,
  });

  const broadcastTransactionAction = useCallback(
    async (transaction: StacksTransaction | undefined) => {
      if (!transaction) {
        logger.error('Cannot broadcast transaction, no tx in state');
        toast.error('Unable to broadcast transaction');
        return;
      }

      const signedTx = signSoftwareWalletTx(transaction);
      if (!signedTx) {
        logger.error('Cannot sign transaction, no account in state');
        toast.error('Unable to broadcast transaction');
        return;
      }

      await broadcastTransactionFn({
        transaction: signedTx,
        onClose() {
          handleConfirmDrawerOnClose();
          navigate(RouteUrls.Home);
        },
      });
      setFeeEstimations([]);
    },
    [
      broadcastTransactionFn,
      handleConfirmDrawerOnClose,
      navigate,
      setFeeEstimations,
      signSoftwareWalletTx,
    ]
  );

  const initialValues = {
    amount: '',
    fee: '',
    feeType: Estimations[Estimations.Middle],
    memo: '',
    nonce,
    recipient: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}
      validationSchema={sendFormSchema}
      onSubmit={() => {
        if (selectedAsset && !assetError) {
          setShowing(true);
        }
      }}
    >
      {props => (
        <>
          <Suspense fallback={<></>}>
            <SendFormInner assetError={assetError} />
          </Suspense>
          <SendTokensConfirmDrawer
            isShowing={isShowing && !showEditNonce}
            onClose={() => handleConfirmDrawerOnClose()}
            onUserSelectBroadcastTransaction={async (
              transaction: StacksTransaction | undefined
            ) => {
              await broadcastTransactionAction(transaction);
              void analytics.track('submit_fee_for_transaction', {
                type: props.values.feeType,
                fee: props.values.fee,
              });
            }}
          />
          <EditNonceDrawer />
          <HighFeeDrawer />
        </>
      )}
    </Formik>
  );
}

export const SendTokensForm = memo(SendTokensFormBase);
