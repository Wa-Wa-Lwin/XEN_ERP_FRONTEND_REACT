import { Button, Textarea, Select, SelectItem, Input, Autocomplete, AutocompleteItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentData } from './types';
import { INCOTERMS, CUSTOM_PURPOSES } from '../../constants/form-defaults';
import { COUNTRIES } from '../../constants/countries';

interface ActionSectionsProps {
  shipment: ShipmentData;
  msLoginUser?: any;
  remark: string;
  setRemark: (remark: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  onApprovalAction: (action: 'approver_approved' | 'approver_rejected') => void;
  editCustomsPurpose: string;
  setEditCustomsPurpose: (purpose: string) => void;
  editCustomsTermsOfTrade: string;
  setEditCustomsTermsOfTrade: (terms: string) => void;
  editedParcelItems: any[];
  onParcelItemUpdate: (itemId: string, field: string, value: string) => void;
  isUpdatingLogistics: boolean;
  onLogisticsUpdate: () => void;
  showError: boolean;
  setShowError: (show: boolean) => void;
  onCreateLabel: () => void;
  formattedError: string;
}

const ActionSections = ({
  shipment,
  msLoginUser,
  remark,
  setRemark,
  isApproving,
  isRejecting,
  onApprovalAction,
  editCustomsPurpose,
  setEditCustomsPurpose,
  editCustomsTermsOfTrade,
  setEditCustomsTermsOfTrade,
  editedParcelItems,
  onParcelItemUpdate,
  isUpdatingLogistics,
  onLogisticsUpdate,
  showError,
  setShowError,
  onCreateLabel,
  formattedError
}: ActionSectionsProps) => {
  // Approval Actions Section
  if (["requestor_requested", "logistic_updated"].includes(shipment.request_status) &&
      msLoginUser?.email.toLowerCase() === shipment.approver_user_mail.toLowerCase()) {
    return (
      <section className="bg-gray-50 rounded-xl border p-4 space-y-3">
        <h2 className="text-base font-semibold">Approval Actions</h2>
        <Textarea
          placeholder="Enter remark (optional for approval, required for rejection)"
          value={remark}
          onValueChange={setRemark}
          size="sm"
          variant="bordered"
          isInvalid={true}  // 🔴 this makes the border red
          errorMessage="Remark is required for rejection" // optional helper text
        />
        <div className="flex gap-2">
          <Button
            color="success"
            onPress={() => onApprovalAction("approver_approved")}
            isLoading={isApproving}
            disabled={isApproving || isRejecting}
            size="sm"
            startContent={<Icon icon="solar:check-circle-bold" />}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
          <Button
            color="danger"
            onPress={() => onApprovalAction("approver_rejected")}
            isLoading={isRejecting}
            disabled={isApproving || isRejecting}
            size="sm"
            startContent={<Icon icon="solar:close-circle-bold" />}
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </section>
    );
  }

  // Logistics Update Section
  if (shipment.request_status === "send_to_logistic") {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-blue-50 rounded-xl border p-4 space-y-4">
          <h2 className="text-base font-semibold">Logistics Information Update</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Customs Purpose"
              placeholder="Select customs purpose"
              selectedKeys={editCustomsPurpose ? [editCustomsPurpose] : []}
              onSelectionChange={(keys) => setEditCustomsPurpose(Array.from(keys)[0] as string)}
              size="sm"
              variant="bordered"
            >
              {CUSTOM_PURPOSES.map((purpose) => (
                <SelectItem key={purpose.key} value={purpose.key}>
                  {purpose.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Customs Terms of Trade"
              placeholder="Select terms of trade"
              selectedKeys={editCustomsTermsOfTrade ? [editCustomsTermsOfTrade] : []}
              onSelectionChange={(keys) => setEditCustomsTermsOfTrade(Array.from(keys)[0] as string)}
              size="sm"
              variant="bordered"
            >
              {INCOTERMS.map((term) => (
                <SelectItem key={term.key} value={term.key}>
                  {term.value}
                </SelectItem>
              ))}
            </Select>
          </div>

          {editedParcelItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Parcel Items</h3>
              <div className="space-y-2">
                {editedParcelItems.map((item) => (
                  <div key={item.id} className="grid md:grid-cols-2 gap-2 p-3 rounded border">
                    <div className="text-xs text-gray-600 md:col-span-4">
                      <strong>Description:</strong> {item.description}
                    </div>
                    <Input
                      label="HS Code"
                      value={item.hs_code || ""}
                      onValueChange={(value) => onParcelItemUpdate(item.id, "hs_code", value)}
                      size="sm"
                      variant="bordered"
                    />
                    <Autocomplete
                      label="Origin Country"
                      placeholder="Search country..."
                      selectedKey={item.origin_country || ""}
                      onSelectionChange={(key) => onParcelItemUpdate(item.id, "origin_country", key as string)}
                      size="sm"
                      variant="bordered"
                      allowsCustomValue
                    >
                      {COUNTRIES.map((country) => (
                        <AutocompleteItem key={country.key} value={country.key}>
                          {country.value}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              color="primary"
              onPress={onLogisticsUpdate}
              isLoading={isUpdatingLogistics}
              disabled={isUpdatingLogistics}
              size="sm"
              startContent={<Icon icon="solar:refresh-bold" />}
            >
              {isUpdatingLogistics ? "Updating..." : "Update Logistics Info"}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Label Error Section
  if (shipment.label_status === "failed") {
    return (
      <div>
        <div className="mb-3">
          <p className="text-red-600 font-semibold mb-2">
            ⚠️ Label creation failed
            <Button
              size="sm"
              color="warning"
              onPress={() => setShowError(!showError)}
              className="ml-2"
            >
              {showError ? "Hide Error Details" : "Show Error Details"}
            </Button>
          </p>

          {showError && (
            <div className="text-gray-800 text-sm break-words whitespace-pre-wrap border p-2 rounded bg-gray-50">
              <b>Details:</b> {formattedError}
            </div>
          )}

          <Button
            color="primary"
            size="sm"
            onPress={onCreateLabel}
            startContent={<Icon icon="solar:refresh-bold" />}
          >
            Retry Create Label
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default ActionSections;