import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentData } from './types';

interface RatesSectionProps {
  shipment: ShipmentData;
  showAllRates: boolean;
  setShowAllRates: (show: boolean) => void;
}

const RatesSection = ({ shipment, showAllRates, setShowAllRates }: RatesSectionProps) => {
  if (!shipment.rates?.length) {
    return null;
  }

  return (
    <>
      <section>
        <div className="flex justify-left gap-6 items-center mb-0">
          <h2 className="text-base font-semibold">Rates</h2>
          {shipment.rates.length > 1 && (
            <Button
              size="sm"
              variant="bordered"
              onPress={() => setShowAllRates(!showAllRates)}
              startContent={<Icon icon={showAllRates ? "solar:eye-closed-bold" : "solar:eye-bold"} />}
            >
              {showAllRates ? "Show Selected Only" : "View All Rates"}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table
            shadow="none"
            aria-label="Rates Table"
            classNames={{
              wrapper: "min-w-fit",
              table: "min-w-[1200px]"
            }}
          >
            <TableHeader>
              <TableColumn className="min-w-[80px]">Chosen</TableColumn>
              <TableColumn className="min-w-[60px]">No.</TableColumn>
              <TableColumn className="min-w-[120px]">Rate ID</TableColumn>
              <TableColumn className="min-w-[150px]">Carrier(Service)</TableColumn>
              {/* <TableColumn className="min-w-[200px]">Service</TableColumn> */}
              {/* <TableColumn className="min-w-[120px]">Service Type</TableColumn> */}
              <TableColumn className="min-w-[100px]">Transit Time</TableColumn>
              <TableColumn className="min-w-[120px]">Cost</TableColumn>
              <TableColumn className="min-w-[100px]">Charge Weight</TableColumn>
              <TableColumn className="min-w-[150px]">Pickup Deadline</TableColumn>
              <TableColumn className="min-w-[150px]">Booking Cut Off</TableColumn>
              <TableColumn className="min-w-[150px]">Delivery Date</TableColumn>
              {/* <TableColumn className="min-w-[200px]">Error Message</TableColumn>
              <TableColumn className="min-w-[200px]">Info Message</TableColumn> */}
            </TableHeader>
            <TableBody>
              {(showAllRates ? shipment.rates : shipment.rates.filter((rate: any) => rate.chosen == 1))
                .map((rate: any, idx: number) => (
                  <TableRow key={idx} className={rate.chosen == 1 ? "bg-green-50" : ""}>
                    <TableCell>
                      {rate.chosen == 1 ? <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" /> : null}
                    </TableCell>
                    <TableCell>{showAllRates ? shipment.rates!.indexOf(rate) + 1 : idx + 1}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{rate.rateID}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{rate.shipper_account_description}({rate.service_name || 'N/A'})</span>
                    </TableCell>
                    {/* <TableCell>
                      <span className="text-sm">{rate.service_name || 'N/A'}</span>
                    </TableCell> */}
                    {/* <TableCell>
                      <span className="text-xs text-gray-600">{rate.service_type || 'N/A'}</span>
                    </TableCell> */}
                    <TableCell>
                      <span className="text-sm">{rate.transit_time ? `${rate.transit_time} days` : 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">
                        {rate.total_charge_amount && rate.total_charge_currency
                          ? `${rate.total_charge_amount} ${rate.total_charge_currency}`
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {rate.charge_weight_value && rate.charge_weight_unit
                          ? `${rate.charge_weight_value} ${rate.charge_weight_unit}`
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {rate.pickup_deadline
                          ? new Date(rate.pickup_deadline).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {rate.booking_cut_off
                          ? new Date(rate.booking_cut_off).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {rate.delivery_date
                          ? new Date(rate.delivery_date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </span>
                    </TableCell>
                    {/* <TableCell>
                      {rate.error_message ? (
                        <div className="text-xs text-red-600 max-w-[200px] break-words">
                          {rate.error_message}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rate.info_message ? (
                        <div className="text-xs text-blue-600 max-w-[200px] break-words">
                          {rate.info_message}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </TableCell> */}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <Divider />
    </>
  );
};

export default RatesSection;