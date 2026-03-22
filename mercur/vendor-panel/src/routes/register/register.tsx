// Main registration route/page
import { Heading, Text } from '@medusajs/ui';
import { RegistrationForm } from './components/registration-form/registration-form';

export const Register = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-col gap-y-1 pb-6">
        <Heading>Vendor Registration</Heading>
        <Text className="text-ui-fg-subtle">
          Register your business to become a seller on our marketplace
        </Text>
      </div>
      
      <RegistrationForm />
    </div>
  );
};
