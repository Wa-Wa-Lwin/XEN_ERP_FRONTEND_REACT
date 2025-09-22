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
        <Table shadow="none" aria-label="Rates Table">
          <TableHeader>
            <TableColumn>Chosen</TableColumn>
            <TableColumn>No.</TableColumn>
            <TableColumn>Carrier</TableColumn>
            <TableColumn>Service</TableColumn>
            <TableColumn>Transit Time</TableColumn>
            <TableColumn>Cost</TableColumn>
          </TableHeader>
          <TableBody>
            {(showAllRates ? shipment.rates : shipment.rates.filter((rate: any) => rate.chosen == 1))
              .map((rate: any, idx: number) => (
                <TableRow key={idx} className={rate.chosen == 1 ? "bg-green-50" : ""}>
                  <TableCell>
                    {rate.chosen == 1 ? <Icon icon="mdi:check-circle" className="text-green-600 w-5 h-5" /> : null}
                  </TableCell>
                  <TableCell>{showAllRates ? shipment.rates!.indexOf(rate) + 1 : idx + 1}</TableCell>
                  <TableCell>{rate.shipper_account_description}</TableCell>
                  <TableCell>{rate.service_name}</TableCell>
                  <TableCell>{rate.transit_time} days</TableCell>
                  <TableCell>{rate.total_charge_amount} {rate.total_charge_currency}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </section>
      <Divider />
    </>
  );
};

export default RatesSection;