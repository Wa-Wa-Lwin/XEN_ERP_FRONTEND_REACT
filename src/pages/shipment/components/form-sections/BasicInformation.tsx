import { Card, CardHeader, CardBody, Input, Textarea, Select, SelectItem, Checkbox } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { SALES_PERSON_OPTIONS, TOPIC_OPTIONS, SERVICE_OPTIONS } from '../../constants/form-defaults'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { useState, useEffect, useRef } from 'react'

interface BasicInformationProps extends FormSectionProps {
  watch: <T = any>(name?: string) => T
  onClearRates?: () => void
}

const BasicInformation = ({ register, errors, control, watch, setValue, onClearRates }: BasicInformationProps) => {

  const [selectedTopic, setSelectedTopic] = useState<Set<string>>(new Set());
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch the send_to field to conditionally apply validation
  const sendTo = watch('send_to');

  // Initialize request_status on component mount
  useEffect(() => {
    const currentSendTo = sendTo || 'Approver';
    setRequestStatusValue(currentSendTo);
  }, []);

  // Watch form values to sync with form state
  const topicValue = watch('topic');
  const serviceOptionsValue = watch('service_options');
  const salesPersonValue = watch('sales_person');
  const shipmentScopeValue = watch('shipment_scope_type');
  const useCustomizeInvoice = watch('use_customize_invoice');
  const customizeInvoiceUrl = watch('customize_invoice_url');
  const customizeInvoiceFile = watch('customize_invoice_file');

  // Update local state when form values change (for duplicated data)
  useEffect(() => {
    if (topicValue) {
      setSelectedTopic(new Set([topicValue]));
    }
  }, [topicValue]);

  useEffect(() => {
    if (serviceOptionsValue) {
      setSelectedServiceOptions(new Set([serviceOptionsValue]));
    }
  }, [serviceOptionsValue]);

  // Sync selectedFile with form state to persist file across section navigation
  useEffect(() => {
    if (customizeInvoiceFile instanceof File) {
      setSelectedFile(customizeInvoiceFile);
    } else if (!customizeInvoiceFile) {
      setSelectedFile(null);
    }
  }, [customizeInvoiceFile]);

  // Helper function to set request status based on send_to value
  const setRequestStatusValue = (sendToValue: string) => {
    if (setValue) {
      const requestStatus = sendToValue === "Approver" ? "requestor_requested" : "send_to_logistic";
      setValue("request_status", requestStatus, { shouldDirty: true, shouldValidate: true });
    }
  };

  // Automatically set request_status based on send_to value
  useEffect(() => {
    if (sendTo) {
      setRequestStatusValue(sendTo);
    }
  }, [sendTo]);

  // Helper function to determine if a field should be required based on send_to value
  const isFieldRequired = (_fieldName?: string) => {
    // All basic information fields are required
    return true;
  };

  return (
    <Card shadow="none" className='rounded-none'>
      <CardHeader className="px-0 pt-0 pb-1">
        <h2 className="text-lg font-semibold">Basic Information</h2>
      </CardHeader>
      <CardBody className="px-0 pt-0 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-3">

          <Controller
            name="shipment_scope_type"
            control={control}
            rules={isFieldRequired('shipment_scope_type') ? { required: "Shipment Scope is required" } : undefined}
            render={({ field }) => (
              <Select
                isRequired={isFieldRequired('shipment_scope_type')}
                {...field}
                label={<span>Shipment Scope</span>}
                placeholder="Select"
                errorMessage={errors.shipment_scope_type?.message}
                isInvalid={!!errors.shipment_scope_type}
                selectedKeys={shipmentScopeValue ? [shipmentScopeValue] : field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  if (selectedKey) {
                    field.onChange(selectedKey)
                    // Clear rates since service option changed
                    if (onClearRates) {
                      console.log('shipment_scope_type changed, clearing rates...')
                      onClearRates()
                    }
                  }
                }}
                color={!watch('shipment_scope_type') ? "warning" : "default"}
              >
                <SelectItem key="domestic" value="domestic">
                  Domestic
                </SelectItem>
                <SelectItem key="export" value="export">
                  International (Export)
                </SelectItem>
                <SelectItem key="import" value="import">
                  International (Import)
                </SelectItem>
                <SelectItem key="international" value="international">
                  International (Outside Thai)
                </SelectItem>
              </Select>
            )}
          />

          {/* <Controller
            name="send_to"
            control={control}
            rules={{ required: "Send to is required" }}
            render={({ field }) => (
              <Select
                isRequired
                {...field}
                label={<span>Send To</span>}
                placeholder="Select"
                errorMessage={errors.send_to?.message}
                isInvalid={!!errors.send_to}
                selectedKeys={sendToValue ? [sendToValue] : field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  if (selectedKey) {
                    field.onChange(selectedKey)
                  }
                }}
                color={!watch('send_to') ? "warning" : "default"}
              >
                <SelectItem key="Approver" value="Approver">
                  Approver
                </SelectItem>
                <SelectItem key="Logistic" value="Logistic">
                  Logistic
                </SelectItem>
              </Select>
            )}
          /> */}
          <div className="col-span-1 grid grid-cols-1 gap-2">
            <Controller
              name="topic"
              control={control}
              rules={{ required: "Topic is required" }}
              render={({ field }) => (
                <Select
                  isRequired
                  {...field}
                  label={<span>Topic</span>}
                  placeholder="Select"
                  errorMessage={errors.topic?.message}
                  isInvalid={!!errors.topic}
                  selectedKeys={topicValue ? [topicValue] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    if (selectedKey) {
                      field.onChange(selectedKey)
                      setSelectedTopic(new Set([selectedKey]))
                    }
                  }}
                  color={!watch('topic') ? "warning" : "default"}
                >
                  {TOPIC_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {selectedTopic.has('Others') && (
              <Textarea
                {...register('other_topic', {
                  required: selectedTopic.has('Others') ? "Other topic is required" : false
                })}
                isRequired={selectedTopic.has('Others')}
                label={<span>Other Topic</span>}
                placeholder="Enter"
                errorMessage={errors.other_topic?.message}
                isInvalid={!!errors.other_topic}
                required
                color={!watch('other_topic') ? "warning" : "default"}
                minRows={1}
              />
            )}
            {selectedTopic.has('For Sales') && (
              <Controller
                name="sales_person"
                control={control}
                rules={selectedTopic.has('For Sales') ? { required: "Sales person is required" } : undefined}
                render={({ field }) => (
                  <Select
                    {...field}
                    isRequired={selectedTopic.has('For Sales')}
                    label={<span>Sales Person</span>}
                    placeholder="Select"
                    errorMessage={errors.sales_person?.message}
                    isInvalid={!!errors.sales_person}
                    selectedKeys={salesPersonValue ? [salesPersonValue] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string
                      if (selectedKey) {
                        field.onChange(selectedKey)
                      }
                    }}
                    color={!watch('sales_person') ? "warning" : "default"}
                  >
                    {SALES_PERSON_OPTIONS.map((option) => (
                      <SelectItem key={option.key} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            )}
          </div>

          <div className="col-span-1 grid grid-cols-1 gap-2">

            <Controller
              name="service_options"
              control={control}
              defaultValue="Normal"
              rules={{ required: "Service option is required" }}
              render={({ field }) => {
                const shipmentScope = watch("shipment_scope_type");
                const filteredServiceOptions =
                  shipmentScope === "domestic"
                    ? SERVICE_OPTIONS
                    : SERVICE_OPTIONS.filter(
                      (option) =>
                        option.key.toLowerCase() === "normal" ||
                        option.key.toLowerCase() === "urgent"
                    );

                return (
                  <Select
                    {...field}
                    isRequired
                    label={<span>Service Options</span>}
                    placeholder="Select"
                    errorMessage={errors.service_options?.message}
                    isInvalid={!!errors.service_options}
                    selectedKeys={
                      serviceOptionsValue
                        ? [serviceOptionsValue]
                        : field.value
                          ? [field.value]
                          : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      if (selectedKey) {
                        field.onChange(selectedKey);
                        setSelectedServiceOptions(new Set([selectedKey]));

                        // If Supplier Pickup is selected, set Payment Terms to Free Of Charge
                        if (selectedKey === "Supplier Pickup" && setValue) {
                          setValue("payment_terms", "free_of_charge", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }

                        // If Grab Pickup is selected, initialize grab rate fields
                        if (selectedKey === "Grab" && setValue) {
                          const formData = watch();
                          if (!formData.grab_rate_amount) {
                            setValue("grab_rate_amount", "", { shouldDirty: true });
                          }
                          if (!formData.grab_rate_currency) {
                            setValue("grab_rate_currency", "THB", { shouldDirty: true });
                          }
                        }

                        // Clear rates since service option changed (except for Grab)
                        if (selectedKey !== "Grab" && onClearRates) {
                          console.log("Service option changed, clearing rates...");
                          onClearRates();
                        }
                      }
                    }}
                    color={!watch("service_options") ? "warning" : "default"}
                  >
                    {filteredServiceOptions.map((option) => (
                      <SelectItem key={option.key} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                );
              }}
            />
            {selectedServiceOptions.has('Urgent') && (
              <Input
                isRequired={selectedServiceOptions.has('Urgent')}
                {...register('urgent_reason', {
                  required: selectedServiceOptions.has('Urgent') ? "Urgent reason is required" : false
                })}
                label={<span>Urgent Reason</span>}
                placeholder="Enter"
                errorMessage={errors.urgent_reason?.message}
                isInvalid={!!errors.urgent_reason}
                color={!watch('urgent_reason') ? "warning" : "default"}
              />
            )}
          </div>

          <Input
            {...register('po_number')}
            label={<span>PO Number</span>}
            placeholder="Enter"
            errorMessage={errors.po_number?.message}
            isInvalid={!!errors.po_number}
            color={!watch('po_number') ? "warning" : "default"}
          />
          <Input
            {...register('po_date')}
            type="date"
            label={<span>PO Date</span>}
            errorMessage={errors.po_date?.message}
            isInvalid={!!errors.po_date}
            // defaultValue={new Date().toISOString().split('T')[0]}
            color={!watch('po_date') ? "warning" : "default"}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
          />

          <Controller
            name="payment_terms"
            control={control}
            rules={isFieldRequired('payment_terms') ? { required: "Payment terms is required" } : undefined}
            render={({ field }) => (
              <Select
                isRequired={isFieldRequired('payment_terms')}
                {...field}
                label={<span>Payment Terms</span>}
                placeholder="Select"
                errorMessage={errors.payment_terms?.message}
                isInvalid={!!errors.payment_terms}
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  if (selectedKey) {
                    field.onChange(selectedKey)
                    // Clear rates since service option changed
                    if (onClearRates) {
                      console.log('payment_terms changed, clearing rates...')
                      onClearRates()
                    }
                  }
                }}
                color={!watch('payment_terms') ? "warning" : "default"}
              >
                <SelectItem key="free_of_charge" value="free_of_charge">
                  Free Of Charge
                </SelectItem>
                <SelectItem key="charge" value="charge">
                  Charge
                </SelectItem>
              </Select>

            )}
          />

          <div className="flex flex-col gap-3">
            {/* Show existing uploaded invoice if editing AND no new file selected */}
            {customizeInvoiceUrl && !selectedFile && (
              <a
                href={`${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${customizeInvoiceUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline"
              >
                View Existing Invoice
              </a>
            )}
            <Controller
              name="use_customize_invoice"
              control={control}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value}
                  onValueChange={(isSelected) => {
                    field.onChange(isSelected);
                    if (!isSelected) {
                      // Clear file when unchecked
                      setValue?.('customize_invoice_file', null);
                      setSelectedFile(null);
                      // Clear the file input
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }
                  }}
                  classNames={{
                    label: "text-sm font-normal text-gray-700" 
                  }}
                >
                  {customizeInvoiceUrl ? 'Update Customize Invoice' : 'Upload Customize Invoice'}
                </Checkbox>
              )}
            />

            {useCustomizeInvoice && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Invoice File (PDF only, max 10MB)
                </label>
                {selectedFile && (
                  <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-700 font-semibold mb-1">
                      ✓ File Selected:
                    </p>
                    <p className="text-xs text-gray-700">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Validate file type
                      if (file.type !== 'application/pdf') {
                        alert('Please upload a PDF file only')
                        e.target.value = ''
                        return
                      }
                      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File size must be less than 10MB')
                        e.target.value = ''
                        return
                      }
                      setSelectedFile(file)
                      setValue?.('customize_invoice_file', file)
                    } else {
                      setSelectedFile(null)
                      setValue?.('customize_invoice_file', null)
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 italic">
                    Note: The file input may appear empty due to browser security, but your file is still selected (shown above).
                  </p>
                )}
              </div>
            )}
          </div>

          <Textarea
            {...register('remark', { required: false })}
            label={<span>Remark</span>}
            placeholder="Enter remark"
            errorMessage={errors.remark?.message}
            isInvalid={!!errors.remark}
            minRows={1}
            className='hidden'
          />

        </div>
      </CardBody>
    </Card>
  )
}

export default BasicInformation
