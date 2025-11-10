import { Button, Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentGETData } from './types';

interface PickupInformationProps {
  shipment: ShipmentGETData;
  onCreatePickup: () => void;
  onChangePickupDateTime?: () => void;
  formattedPickupError: string;
}

const PickupInformation = ({
  shipment,
  onCreatePickup,
  onChangePickupDateTime,
  formattedPickupError
}: PickupInformationProps) => {

  // -------------------------------
  // Derived data & condition helpers
  // -------------------------------
  const chosenRate = shipment.rates?.find(rate => String(rate.chosen) === "1");
  const isDHLAsia = chosenRate?.shipper_account_description === 'DHL eCommerce Asia';
  const isDHLExpress = chosenRate?.service_name === 'DHL Express Worldwide';
  const isGrabPickup = shipment.service_options?.toLowerCase() === 'grab';
  const isExternalCall = isDHLAsia || isDHLExpress;

  // -------------------------------
  // UI helper functions
  // -------------------------------
  const pickupColors: Record<string, string> = {
    created_success: 'text-green-600',
    created_failed: 'text-red-600',
    default: 'text-blue-600',
  };

  const pickupLabels: Record<string, string> = {
    created_success: 'Success',
    created_failed: 'Failed',
    default: 'Pending',
  };

  const getPickupColor = () =>
    isExternalCall ? 'text-blue-600' : pickupColors[shipment.pick_up_created_status || 'default'];

  const getPickupText = () =>
    isExternalCall ? 'Call' : pickupLabels[shipment.pick_up_created_status || 'default'];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${parseInt(hours, 10)}:${minutes}`;
  };

  const pickupDateTime = shipment.pick_up_date
    ? `${formatDate(shipment.pick_up_date)} (${formatTime(shipment.pick_up_start_time)} - ${formatTime(shipment.pick_up_end_time)})`
    : 'Not specified';

  // -------------------------------
  // Reusable UI snippets
  // -------------------------------
  const pickupDetails = (
    <>
      <div>
        <span className="text-gray-600">Date(Time): </span>
        <span className="font-medium">{pickupDateTime}</span>
      </div>
      <div>
        <span className="text-gray-600">| Instruction: </span>
        <span className="font-medium">
          {shipment.pick_up_instructions || 'Not specified.'}
        </span>
      </div>
    </>
  );

  const errorBox = (
    <div className="col-span-full">
      <p className="text-red-600 font-semibold bg-yellow-50 p-2 rounded break-words max-w-full whitespace-normal">
        ⚠️ Error Detail: {formattedPickupError}
      </p>
      <Button color="primary" size="sm" onPress={onCreatePickup}>
        Retry Create Pickup
      </Button>
    </div>
  );

  const externalCallNotice = (message: string) => (
    <p className="text-blue-600 text-xs font-semibold bg-blue-50 p-2 rounded">
      📞 {message} <br /> 📇 Contact Logistic Team for further information.
    </p>
  );

  // -------------------------------
  // Render logic
  // -------------------------------
  if (isGrabPickup) {
    return (
      <>
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="solar:calendar-bold" width={24} className="text-blue-600" />
          <h3 className="font-semibold">Pickup Information</h3>
        </div>
        <div
          className="grid gap-2 text-sm mb-3"
          style={{
            gridTemplateColumns: 'repeat(8, fit-content(300px))',
            justifyContent: 'start',
            alignItems: 'start',
            textAlign: 'left',
          }}
        >
          {pickupDetails}
        </div>
      </>
    );
  }

  return (
    <Card shadow="none">
      <div className="flex items-center gap-2 mb-2">
        <Icon icon="solar:calendar-bold" width={24} className={getPickupColor()} />
        <h3 className={`font-semibold ${getPickupColor()}`}>
          Pickup Information ({getPickupText()})
        </h3>
      </div>

      <div
        className="grid gap-2 text-sm mb-3"
        style={{
          gridTemplateColumns: 'repeat(8, fit-content(300px))',
          justifyContent: 'start',
          alignItems: 'start',
          textAlign: 'left',
        }}
      >
        {pickupDetails}

        {!isExternalCall && (
          <>
            {shipment.pick_up_created_status === 'created_success' && (
              <div>
                <span className="text-gray-600">| Confirmation No: </span>
                <span className="font-medium">
                  {shipment.pickup_confirmation_numbers}
                </span>
              </div>
            )}

            {shipment.pick_up_created_status === 'created_failed' && errorBox}

            {shipment.pick_up_created_status !== 'created_success' &&
              onChangePickupDateTime && (
                <div className="col-span-full">
                  <Button
                    color="warning"
                    size="sm"
                    onPress={onChangePickupDateTime}
                    startContent={<Icon icon="solar:calendar-bold" width={16} />}
                  >
                    Change Pickup Date/Time
                  </Button>
                </div>
              )}
          </>
        )}
      </div>

      {isDHLAsia &&
        externalCallNotice('Please call DHL eCommerce Asia customer service to arrange pickup for this package.')}

      {isDHLExpress &&
        externalCallNotice('Please call DHL Express Worldwide customer service to arrange pickup for this package (Aftership not supported yet).')}
    </Card>
  );
};

export default PickupInformation;
