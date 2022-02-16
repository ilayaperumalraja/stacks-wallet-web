import { Flex, FlexProps } from '@stacks/ui';

export function LedgerWrapper(props: FlexProps) {
  return (
    <Flex
      alignItems="center"
      flexDirection="column"
      pb="loose"
      px="loose"
      textAlign="center"
      {...props}
    />
  );
}
