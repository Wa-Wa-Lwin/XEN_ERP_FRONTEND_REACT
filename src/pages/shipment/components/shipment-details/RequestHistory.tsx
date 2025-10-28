import { Button, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentGETData } from './types';
import { formatDateTime, getDisplayStatusHistory } from './utils';

interface RequestHistoryProps {
  shipment: ShipmentGETData;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

const RequestHistory = ({ shipment, showHistory, setShowHistory }: RequestHistoryProps) => {
  return (
    <section className="space-y-1">
      <div className="flex justify-left gap-6 items-center mx-3 p-3">
        <h2 className="text-base font-semibold">Request History</h2>
        <Button
          color="primary"
          size="sm"
          variant="bordered"
          startContent={<Icon icon={showHistory ? "solar:eye-closed-bold" : "solar:history-bold"} />}
          onPress={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Hide History" : "Show History"}
        </Button>
      </div>

      {showHistory &&
        shipment.shipment_request_histories &&
        shipment.shipment_request_histories.length > 0 && (
          <div>
            {shipment.shipment_request_histories
              .sort((a: any, b: any) => {
                const dateA = new Date(
                  a.history_record_date_time || a.shipment_request_created_date_time || 0
                );
                const dateB = new Date(
                  b.history_record_date_time || b.shipment_request_created_date_time || 0
                );
                return dateB.getTime() - dateA.getTime();
              })
              .map((history: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-700">
                  <p>
                    {history.user_name} ({history.user_role || 'logistics'}) {' '}
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        history.status?.includes('approved') ? 'success' :
                        history.status?.includes('rejected') ? 'danger' :
                        history.status?.includes('updated') ? 'warning' : 'primary'
                      }
                    >
                      {getDisplayStatusHistory(history.status)}
                    </Chip> {' '}
                    {formatDateTime(history.history_record_date_time || history.shipment_request_created_date_time)} | <b>Remark: </b> {history.remark || 'N/A'}
                  </p>
                </div>
              ))}
          </div>
        )}

      <hr />
    </section>
  );
};

export default RequestHistory;