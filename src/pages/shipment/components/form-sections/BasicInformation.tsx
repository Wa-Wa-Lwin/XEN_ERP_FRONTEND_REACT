import { Card, CardHeader, CardBody, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { SALES_PERSON_OPTIONS, TOPIC_OPTIONS, SERVICE_OPTIONS, INCOTERMS, CUSTOM_PURPOSES } from '../../constants/form-defaults'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { useState, useEffect } from 'react'

interface BasicInformationProps extends FormSectionProps {
  watch: (name?: string) => any
}

const BasicInformation = ({ register, errors, control, watch, setValue }: BasicInformationProps) => {

  const [selectedTopic, setSelectedTopic] = useState<Set<string>>(new Set());
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<Set<string>>(new Set());

  // Watch the send_to field to conditionally apply validation
  const sendTo = watch('send_to');

  // Watch form values to sync with form state
  const topicValue = watch('topic');
  const serviceOptionsValue = watch('service_options');
  const sendToValue = watch('send_to');
  const customsPurposeValue = watch('customs_purpose');
  const customsTermsValue = watch('customs_terms_of_trade');
  const salesPersonValue = watch('sales_person');

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
  const isFieldRequired = (fieldName?: string) => {
    if (sendTo === 'Logistic') {
      // For logistics, only customs purpose and incoterms are not required
      const logisticNotRequiredFields = ['customs_purpose', 'customs_terms_of_trade'];
      if (fieldName && logisticNotRequiredFields.includes(fieldName)) {
        return false;
      }
      // All other fields are still required for logistics
      return true;
    }
    // For Approver or default, all fields are required as before
    return true;
  };

  return (


    <Card shadow="none">
      <CardHeader className="px-0 pt-0 pb-1">
        <h2 className="text-lg font-semibold">Basic Information</h2>
      </CardHeader>
      <CardBody className="px-0 pt-0 pb-0">
        {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-3"> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-3"> */}

        <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
          <Controller
            name="send_to"
            control={control}
            rules={{ required: 'Send To is required' }}
            render={({ field }) => (
              <Select
                {...field}
                label={<span>Send To {true && <span className="text-red-500">*</span>}</span>}
                placeholder="Select"
                errorMessage={errors.send_to?.message}
                isInvalid={!!errors.send_to}
                selectedKeys={sendToValue ? [sendToValue] : ["Approver"]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  if (selectedKey) {
                    field.onChange(selectedKey)
                  }
                }}
              >
                <SelectItem key="Approver" value="Approver">
                  Approver
                </SelectItem>
                <SelectItem key="Logistic" value="Logistic">
                  Logistic
                </SelectItem>
              </Select>
            )}
          />
          <div className="col-span-1 grid grid-cols-1 gap-2">
            <Controller
              name="topic"
              control={control}
              rules={{ required: isFieldRequired() ? 'Topic is required' : false }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={<span>Topic {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
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
              <Input
                {...register('other_topic', {
                  required: selectedTopic.has('Others') && isFieldRequired() ? 'Other topic is required' : false
                })}
                label={<span>Other Topic {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
                placeholder="Enter"
                errorMessage={errors.other_topic?.message}
                isInvalid={!!errors.other_topic}
                required
              />
            )}
            {selectedTopic.has('For Sales') && (
              <Controller
                name="sales_person"
                control={control}
                rules={{ required: isFieldRequired() ? 'Sales person is required' : false }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={<span>Sales Person {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
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
              rules={{ required: isFieldRequired() ? 'Service options is required' : false }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={<span>Service Options {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
                  placeholder="Select"
                  errorMessage={errors.service_options?.message}
                  isInvalid={!!errors.service_options}
                  selectedKeys={serviceOptionsValue ? [serviceOptionsValue] : ["Normal"]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    if (selectedKey) {
                      field.onChange(selectedKey)
                      setSelectedServiceOptions(new Set([selectedKey]))
                    }
                  }}
                >
                  {SERVICE_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {selectedServiceOptions.has('Urgent') && (
              <Input
                {...register('urgent_reason', { required: isFieldRequired() ? 'Urgent reason is required' : false })}
                label={<span>Urgent Reason {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
                placeholder="Enter"
                errorMessage={errors.urgent_reason?.message}
                isInvalid={!!errors.urgent_reason}
              />
            )}
          </div>

          <Input
            {...register('po_number', { required: isFieldRequired() ? 'PO Number is required' : false })}
            label={<span>PO Number {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter"
            errorMessage={errors.po_number?.message}
            isInvalid={!!errors.po_number}
          />
          <Input
            {...register('po_date', { required: isFieldRequired() ? 'PO Date is required' : false })}
            type="date"
            label={<span>PO Date {isFieldRequired() && <span className="text-red-500">*</span>}</span>}
            errorMessage={errors.po_date?.message}
            isInvalid={!!errors.po_date}
            defaultValue={new Date().toISOString().split('T')[0]}
          />


          <Controller
            name="customs_purpose"
            control={control}
            defaultValue="sample"
            rules={{ required: isFieldRequired('customs_purpose') ? 'Customs purpose is required' : false }}
            render={({ field }) => (
              <Select
                {...field}
                label={<span>Customs {isFieldRequired('customs_purpose') && <span className="text-red-500">*</span>}</span>}
                placeholder="Select"
                errorMessage={errors.customs_purpose?.message}
                isInvalid={!!errors.customs_purpose}
                selectedKeys={customsPurposeValue ? [customsPurposeValue] : ["sample"]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string
                  if (selectedKey) {
                    field.onChange(selectedKey)
                  }
                }}
              >
                {CUSTOM_PURPOSES.map((option) => (
                  <SelectItem key={option.key} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
          <div className="col-span-2">
            <Controller
              name="customs_terms_of_trade"
              control={control}
              defaultValue="exw"
              rules={{ required: isFieldRequired('customs_terms_of_trade') ? 'Terms of trade is required' : false }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={<span>Incoterms {isFieldRequired('customs_terms_of_trade') && <span className="text-red-500">*</span>}</span>}
                  placeholder="Select"
                  errorMessage={errors.customs_terms_of_trade?.message}
                  isInvalid={!!errors.customs_terms_of_trade}
                  selectedKeys={customsTermsValue ? [customsTermsValue] : ["exw"]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string
                    if (selectedKey) {
                      field.onChange(selectedKey)
                    }
                  }}
                >
                  {INCOTERMS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </Select>

              )}
            />

          </div>

          <Textarea
            {...register('remark')}
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

//    <Card className="p-1 m-1">
//  <Card className="pt-2 pb-2 px-4 m-0">
//   <Card shadow="none" className="pt-2 pb-0 px-4 m-0">
// <Card shadow="none" className="p-1 m-1 border-b border-gray-300">