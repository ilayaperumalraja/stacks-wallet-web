import { memo } from 'react';
import { useField } from 'formik';
import { Input, InputGroup, Stack, StackProps, Text } from '@stacks/ui';
import { ErrorLabel } from '@app/components/error-label';

export const EditNonceField = memo((props: StackProps) => {
  const [field, meta] = useField('nonce');

  return (
    <Stack width="100%" {...props}>
      <InputGroup flexDirection="column">
        <Input
          display="block"
          type="number"
          width="100%"
          placeholder="Enter a custom nonce"
          autoComplete="off"
          {...field}
        />
      </InputGroup>
      {meta.error && (
        <ErrorLabel>
          <Text textStyle="caption">{meta.error}</Text>
        </ErrorLabel>
      )}
    </Stack>
  );
});
