import { useAppDetails } from '@app/common/hooks/auth/use-app-details';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { useWallet } from '@app/common/hooks/use-wallet';
import { validateGaiaHubUrl } from '@app/common/validation/validate-gaia-hub-url';
import { CenteredPageContainer } from '@app/components/centered-page-container';
import { Divider } from '@app/components/divider';
import { ErrorLabel } from '@app/components/error-label';
import { CENTERED_FULL_PAGE_MAX_WIDTH } from '@app/components/global-styles/full-page-styles';
import { Header } from '@app/components/header';
import { PageTitle } from '@app/components/page-title';
import { PrimaryButton } from '@app/components/primary-button';
import { SpaceBetween } from '@app/components/space-between';
import { Caption } from '@app/components/typography';
import { useUpdateStorageConfig } from '@app/store/storage/storage.hook';
import SetPassword from '@assets/images/onboarding/set-password.png';
import { gaiaUrl, HUMAN_REACTION_DEBOUNCE_TIME } from '@shared/constants';
import { RouteUrls } from '@shared/route-urls';
import { Box, Circle, color, Input, Stack, Text } from '@stacks/ui';
import { Form, Formik } from 'formik';
import { memo, useCallback, useEffect, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'ts-debounce';
import * as yup from 'yup';

interface RadioButtonProps {
  isSelected: boolean;
}
const RadioButton = memo((props: RadioButtonProps) => {
  const { isSelected } = props;

  return (
    <Circle
      border="1px solid"
      borderColor={color('border')}
      marginRight="10px"
      size="24px"
      flexShrink={0}>
      {isSelected &&
        <Circle
          border="1px solid"
          borderColor={color('border')}
          marginRight="10px"
          size="14px"
          marginLeft="4px"
          flexShrink={0}
          bg={color('brand')} />
      }
    </Circle>
  );
});

enum GaiaHubProviders {
  hiroGaiaHub = "hiroGaiaHub",
  ownGaiaHub = "ownGaiaHub"
}

interface SetGaiaHubInfoFormValues {
  gaiaHubUrl: string;
}
const setGaiaHubInfoFormValues: SetGaiaHubInfoFormValues = { gaiaHubUrl: "" }

export const ChooseStorage = memo(() => {
  const [gaiaHubProvider, setGaiaHubProvider] = useState<GaiaHubProviders>(GaiaHubProviders.hiroGaiaHub);
  const { name: appName } = useAppDetails();
  const { cancelAuthentication } = useWallet();
  const saveStorageConfig = useUpdateStorageConfig();
  const navigate = useNavigate();

  useRouteHeader(<Header hideActions />);

  const handleUnmount = useCallback(async () => {
    cancelAuthentication();
  }, [cancelAuthentication]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleUnmount);
    return () => window.removeEventListener('beforeunload', handleUnmount);
  }, [handleUnmount]);

  const onSubmit = useCallback(
    async ({ gaiaHubUrl }) => {
      saveStorageConfig({
        ownGaiaHubUrl: gaiaHubProvider === GaiaHubProviders.hiroGaiaHub ? gaiaUrl : gaiaHubUrl
      });

      navigate(RouteUrls.ChooseAccount);
    }, [saveStorageConfig, navigate, gaiaHubProvider]
  );

  const validationSchema = gaiaHubProvider === GaiaHubProviders.ownGaiaHub ? yup.object({
    gaiaHubUrl: yup
      .string()
      .defined()
      .test({
        message: 'Enter valid gaia hub url',
        test: debounce(async (value: unknown) => {
          if (typeof value !== 'string') return false;
          const result = await validateGaiaHubUrl(value);
          return result;
        }, HUMAN_REACTION_DEBOUNCE_TIME) as unknown as yup.TestFunction<any, any>,
      })
  }) : null;

  return (
    <CenteredPageContainer>
      <Formik
        initialValues={setGaiaHubInfoFormValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        validateOnMount={false}
      >
        {formik => (
          <Form>
            <Stack
              maxWidth={CENTERED_FULL_PAGE_MAX_WIDTH}
              mb={['loose', 'unset']}
              px={['loose', 'unset']}
              spacing="loose"
              textAlign={['left', 'center']}
            >
              <Box alignSelf={['start', 'center']} width={['95px', '117px']}>
                <img src={SetPassword} />
              </Box>
              <PageTitle>Choose data storage</PageTitle>
              <Text lineHeight="1.5rem">
                {appName || "App "} enables you to choose where your data will be stored.
                Would you like to set up your own storage or continue with the default?
              </Text>
              <Box border="1px solid" borderColor={color('border')} borderRadius="16px" spacing="base">
                <Stack
                  alignItems="start"
                  p={['base-loose', 'extra-loose']}
                  _hover={gaiaHubProvider !== GaiaHubProviders.hiroGaiaHub ? { cursor: 'pointer' } : {}}
                  onClick={() => setGaiaHubProvider(GaiaHubProviders.hiroGaiaHub)} isInline>
                  <RadioButton isSelected={gaiaHubProvider === GaiaHubProviders.hiroGaiaHub} />
                  <SpaceBetween width="100%">
                    <Stack alignItems="start">
                      <Text>
                        Hiro's default storage
                      </Text>
                      <Caption mt="base-tight">
                        https://hub.blockstack.org
                      </Caption>
                    </Stack>
                  </SpaceBetween>
                </Stack>
                <Divider />
                <Stack
                  alignItems="start"
                  p={['base-loose', 'extra-loose']}
                  _hover={gaiaHubProvider !== GaiaHubProviders.ownGaiaHub ? { cursor: 'pointer' } : {}}
                  onClick={() => setGaiaHubProvider(GaiaHubProviders.ownGaiaHub)} isInline>
                  <RadioButton isSelected={gaiaHubProvider === GaiaHubProviders.ownGaiaHub} />
                  <SpaceBetween width="100%">
                    <Stack alignItems="start" width="100%">
                      <Text>
                        Set up your own
                      </Text>
                      {gaiaHubProvider === GaiaHubProviders.ownGaiaHub &&
                        <>
                          <Caption mt="base-tight">
                            Enter the domain name of your <Text color={color('accent')}><a href="https://docs.stacks.co/gaia/overview" target="_blank">Gaia</a></Text> hub.
                          </Caption>
                          <a href="https://docs.stacks.co/gaia/gaia-on-ec2" target="_blank">
                            <Stack isInline>
                              <Caption color={color('accent')}>
                                Learn how to set up your Gaia hub
                              </Caption>
                              <FiArrowUpRight color={color('accent')} />
                            </Stack>
                          </a>
                          <Input
                            autoFocus
                            height="64px"
                            key="gaia-hub-url-input"
                            name="gaiaHubUrl"
                            onChange={formik.handleChange}
                            placeholder="Gaia hub URL"
                            type="text"
                            value={formik.values.gaiaHubUrl}
                            mt="base-tight"
                          />
                          {formik.submitCount && formik.errors.gaiaHubUrl ? (
                            <ErrorLabel>
                              <Text textStyle="caption">{formik.errors.gaiaHubUrl}</Text>
                            </ErrorLabel>
                          ) : null}
                        </>
                      }
                    </Stack>
                  </SpaceBetween>
                </Stack>
              </Box>

              <PrimaryButton
                isLoading={formik.isSubmitting}
                mt="tight"
              >
                Continue
              </PrimaryButton>
            </Stack>
          </Form>
        )}
      </Formik>
    </CenteredPageContainer>
  );
});
