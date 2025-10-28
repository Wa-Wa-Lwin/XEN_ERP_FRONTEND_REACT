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


    const getPickupColor = () => {
        switch (shipment.pick_up_created_status) {
            case "created_success":
                return "text-green-600";
            case "created_failed":
                return "text-red-600";
            default:
                return "text-blue-600"; // pending or other unknown states
        }
    };

    const getPickupText = () => {
        switch (shipment.pick_up_created_status) {
            case "created_success":
                return "Success";
            case "created_failed":
                return "Failed";
            default:
                return "Pending";
        }
    };


    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: '2-digit',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return 'Invalid Date'
        }
    }

    function formatTime(timeString: string) {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        return `${parseInt(hours, 10)}:${minutes}`;
    }

    const pickupDateTime = shipment.pick_up_date
        ? `${formatDate(shipment.pick_up_date)} (${formatTime(shipment.pick_up_start_time)} - ${formatTime(shipment.pick_up_end_time)})`
        : '';

    const chosenRate = shipment.rates?.find(rate => String(rate.chosen) === "1");
    const isDHLeCommerceAsia = chosenRate?.shipper_account_description === 'DHL eCommerce Asia';

    const pickup_pending_data = <>

    </>;

    const pickup_created_status_data = <>
        <div>
            <span className="text-gray-600">| Confirmation No: </span>
            <span className="font-medium">{shipment.pickup_confirmation_numbers}</span>
        </div>
    </>;

    const pickup_created_failed_data = <>
        <div className="col-span-full">
            <p className="text-red-600 font-semibold bg-yellow-50 p-2 rounded break-words max-w-full whitespace-normal">
                ⚠️ Error Detail: {formattedPickupError}
            </p>
        </div>
        <Button
            color="primary"
            size="sm"
            onPress={onCreatePickup}
        >
            Retry Create Pickup
        </Button>
    </>;

    return (
        <Card className="m-3 p-3 rounded-none">
            <div className="flex items-center gap-2 mb-2">
                <Icon
                    icon="solar:calendar-bold"
                    width={24}
                    className={getPickupColor()}
                />
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
                <div>
                    <span className="text-gray-600">Date(Time): </span>
                    <span className="font-medium">{pickupDateTime}</span>
                </div>
                <div>
                    <span className="text-gray-600">| Instruction: </span>
                    <span className="font-medium">{shipment.pick_up_instructions || "Not specified."}</span>
                </div>

                {
                    !isDHLeCommerceAsia &&
                    <>
                        {shipment.pick_up_created_status === "created_success" &&
                            <>
                                {pickup_created_status_data}
                            </>
                        }

                        {shipment.pick_up_created_status === "created_failed" &&
                            <>
                                {pickup_created_failed_data}
                            </>
                        }

                        {shipment.pick_up_created_status !== "created_success" && onChangePickupDateTime && (
                            <>
                                {pickup_pending_data}
                            </>
                        )}
                    </>
                }
            </div>

            {isDHLeCommerceAsia && (
                <p className="text-blue-600 text-xs font-semibold bg-blue-50 p-2 rounded">
                    📞 Please call DHL eCommerce Asia customer service to arrange pickup for this package.
                    📇 Contact Logistic Team for further information.
                </p>
            )}
        </Card>
    );
};

export default PickupInformation;
