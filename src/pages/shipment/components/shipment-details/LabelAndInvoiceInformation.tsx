import { Button, Card, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
// import { useNavigate } from 'react-router-dom';
import type { ShipmentGETData } from './types';

interface LabelAndInvoiceInformationProps {
    shipment: ShipmentGETData;
    showError: boolean;
    setShowError: (show: boolean) => void;
    onCreateLabel: () => void;
    formattedError: string;
    formattedLabelError: string;
}

const LabelAndInvoiceInformation = ({
    shipment,
    onCreateLabel,
    formattedError,
    formattedLabelError
}: LabelAndInvoiceInformationProps) => {

    const getLabelChipConfig = () => {
        switch (shipment.label_status) {
            case "created":
                return { color: 'success' as const, icon: 'solar:check-circle-bold', text: 'Created' };
            case "failed":
                return { color: 'danger' as const, icon: 'solar:close-circle-bold', text: 'Failed' };
            case "cancelled":
                return { color: 'danger' as const, icon: 'solar:forbidden-circle-bold', text: 'Cancelled' };
            default:
                return { color: 'warning' as const, icon: 'solar:clock-circle-bold', text: 'Pending' };
        }
    };

    // Check if shipping option is grab_pickup or supplier_pickup
    const isGrabPickup = shipment.shipping_options?.toLowerCase() === 'grab_pickup';
    const isSupplierPickup = shipment.shipping_options?.toLowerCase() === 'supplier_pickup';
    const isApproved = shipment.request_status === 'approver_approved';

    const label_created_data = (
        <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="text-gray-600 font-medium">Invoice : </span>
                    <span className="font-semibold text-gray-900">{shipment.invoice_no}</span>
                    <span className="text-gray-600 font-medium"> | </span>
                    <span className="text-gray-600 font-medium"> Date: </span>
                    <span className="font-semibold text-gray-900">{shipment.invoice_date}</span>
                    <span className="text-gray-600 font-medium"> | </span>
                    <span className="text-gray-600 font-medium">Due: </span>
                    <span className="font-semibold text-gray-900">{shipment.invoice_due_date}</span>
                </div>
                {
                    !isGrabPickup && !isSupplierPickup && <>
                        {shipment.label_id &&
                            <div>
                                <span className="text-gray-600 font-medium">Label ID: </span>
                                <span className="font-semibold text-gray-900">{shipment.label_id}</span>
                            </div>
                        }
                        <div>
                            <span className="text-gray-600 font-medium">Tracking Number: </span>
                            <span className="font-semibold text-gray-900">{shipment.tracking_numbers}</span>
                        </div>
                    </>
                }
            </div>
        </div>
    );

    const label_failed_data = (
        <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium flex items-start gap-2">
                    <Icon icon="solar:danger-triangle-bold" width={18} className="flex-shrink-0 mt-0.5" />
                    <span><strong>Error Details:</strong> {formattedLabelError} {formattedError}</span>
                </p>
            </div>
            <Button
                color="primary"
                size="sm"
                onPress={onCreateLabel}
                startContent={<Icon icon="solar:refresh-bold" width={16} />}
            >
                Retry Create Label
            </Button>
        </div>
    );



    const labelChipConfig = getLabelChipConfig();

    return (
        <>
            <Card className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-left gap-1 mb-2 pb-3 border-gray-200">
                    <Icon icon="solar:tag-bold" width={22} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-900 text-base">
                        Label & Invoice Information
                    </h3>
                    {shipment?.request_status.toLowerCase() !== 'approver_rejected' && (
                        <Chip
                            color={labelChipConfig.color}
                            variant="flat"
                            size="sm"
                            startContent={<Icon icon={labelChipConfig.icon} width={16} />}
                            className="font-semibold"
                        >
                            {labelChipConfig.text}
                        </Chip>
                    )}
                </div>
                {
                    isApproved && <>
                        {
                            isGrabPickup || isSupplierPickup ? (
                                <>
                                    {label_created_data}
                                </>
                            ) : (
                                <>
                                    {(shipment.label_status === "created" || shipment.label_status === "cancelled") && label_created_data}
                                    {shipment.label_status === "failed" && label_failed_data}
                                </>
                            )
                        }
                        {/* 
                        {(shipment.label_status === "created" || shipment.label_status === "cancelled") && label_created_data}
                        {shipment.label_status === "failed" && label_failed_data}
                        */}
                    </>
                }
                {
                    shipment?.request_status.toLowerCase() === 'approver_rejected' && <>
                        <p className="text-red-700 text-sm font-medium flex items-start gap-2">
                            <span>This shipment request has been rejected by the approver. Label and invoice information is not available.</span>
                        </p>
                    </>
                }
            </Card>
        </>
    );
};

export default LabelAndInvoiceInformation;