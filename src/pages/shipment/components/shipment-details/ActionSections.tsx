import { Button, Textarea, Select, SelectItem, Input, Autocomplete, AutocompleteItem, Modal, ModalContent, ModalBody, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { ShipmentGETData } from './types';
import { INCOTERMS, CUSTOM_PURPOSES } from '../../constants/form-defaults';
import { COUNTRIES } from '../../constants/countries';

interface ActionSectionsProps {
  shipment: ShipmentGETData;
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
}

const ActionSections = ({
  shipment,
  // msLoginUser,
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
  onLogisticsUpdate
}: ActionSectionsProps) => {
  let shipment_approved_date_time = new Date(shipment.approver_approved_date_time ?? 0);

  // Approval Actions Section
  if ([
      "requestor_requested", 
      "logistic_updated",
      "logistic_edited",
      "approver_edited"
    ].includes(shipment.request_status) 
    && shipment_approved_date_time.getTime() >= 0
    //  msLoginUser?.email.toLowerCase() === shipment.approver_user_mail.toLowerCase()    
    ) {
    return (
      <>
        <section className="bg-gray-50 rounded-xl border p-4 space-y-3">
          <h2 className="text-base font-semibold">Approval Actions</h2>
          <p className="text-sm text-blue-600">
            Now Every Approver can approver other people request too. Open for Cross Approval. 
          </p>
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

        {/* Loading Modal for Approval Actions */}
        <Modal
          isOpen={isApproving || isRejecting}
          hideCloseButton
          isDismissable={false}
          size="sm"
          backdrop="blur"
        >
          <ModalContent>
            <ModalBody className="flex flex-col items-center justify-center py-8 space-y-4">
              <Spinner
                size="lg"
                color={isApproving ? "success" : "danger"}
                label={isApproving ? "Approving shipment..." : "Rejecting shipment..."}
                labelColor={isApproving ? "success" : "danger"}
              />
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600">
                  Please wait while we process your request...
                </p>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  // Logistics Update Section
  if (shipment.request_status === "send_to_logistic") {
    return (
      <>
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
                isRequired
                isInvalid={!editCustomsPurpose}
                errorMessage={!editCustomsPurpose ? "Customs purpose is required" : ""}
              >
                {CUSTOM_PURPOSES.map((purpose) => (
                  <SelectItem key={purpose.key} value={purpose.key}>
                    {purpose.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Incoterms"
                placeholder="Select terms of trade"
                selectedKeys={editCustomsTermsOfTrade ? [editCustomsTermsOfTrade] : []}
                onSelectionChange={(keys) => setEditCustomsTermsOfTrade(Array.from(keys)[0] as string)}
                size="sm"
                variant="bordered"
                isRequired
                isInvalid={!editCustomsTermsOfTrade}
                errorMessage={!editCustomsTermsOfTrade ? "Terms of trade is required" : ""}
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
                        <strong>Item Description:</strong> {item.description}
                      </div>
                      <Input
                        label="HS Code"
                        value={item.hs_code || ""}
                        onValueChange={(value) => onParcelItemUpdate(item.id, "hs_code", value)}
                        size="sm"
                        variant="bordered"
                        isRequired
                        isInvalid={!item.hs_code}
                        errorMessage={!item.hs_code ? "HS Code is required" : ""}
                      />
                      <Autocomplete
                        label="Origin Country"
                        placeholder="Search country..."
                        selectedKey={item.origin_country || ""}
                        onSelectionChange={(key) => onParcelItemUpdate(item.id, "origin_country", key as string)}
                        size="sm"
                        variant="bordered"
                        allowsCustomValue
                        isRequired
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
                onPress={() => {
                  // Validation before calling update
                  if (
                    !editCustomsPurpose ||
                    !editCustomsTermsOfTrade ||
                    editedParcelItems.some(
                      (item) => !item.hs_code || !item.origin_country
                    )
                  ) {
                    alert("⚠️ Please fill all required fields before updating.");
                    return;
                  }
                  onLogisticsUpdate();
                }}
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

        {/* Loading Modal for Logistics Update */}
        <Modal
          isOpen={isUpdatingLogistics}
          hideCloseButton
          isDismissable={false}
          size="sm"
          backdrop="blur"
        >
          <ModalContent>
            <ModalBody className="flex flex-col items-center justify-center py-8 space-y-4">
              <Spinner
                size="lg"
                color="primary"
                label="Updating logistics information..."
                labelColor="primary"
              />
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600">
                  Please wait while we save your changes...
                </p>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }


  return null;
};

export default ActionSections;