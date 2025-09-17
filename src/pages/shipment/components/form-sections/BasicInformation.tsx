import { Card, CardHeader, CardBody, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { SALES_PERSON_OPTIONS, TOPIC_OPTIONS, SERVICE_OPTIONS, INCOTERMS, CUSTOM_PURPOSES } from '../../constants/form-defaults'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { useState } from 'react'

interface BasicInformationProps extends FormSectionProps {
  today: string
}

const BasicInformation = ({ register, errors, control, today }: BasicInformationProps) => {

  const [selectedTopic, setSelectedTopic] = useState<Set<string>>(new Set());
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<Set<string>>(new Set());

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Basic Information</h2>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <Controller
          name="topic"
          control={control}
          rules={{ required: 'Topic is required' }}
          render={({ field }) => (
            <Select
              {...field}
              label="Topic"
              placeholder="Select topic"
              errorMessage={errors.topic?.message}
              isInvalid={!!errors.topic}
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
        {selectedTopic.has('others') && (
          <Input
            {...register('other_topic', {
              required: selectedTopic.has('others') ? 'Other topic is required' : false
            })}
            label="Other Topic"
            placeholder="Enter other topic"
            errorMessage={errors.other_topic?.message}
            isInvalid={!!errors.other_topic}
            required
          />
        )}
        {selectedTopic.has('for_sales') && (
          <Controller
            name="sales_person"
            control={control}
            rules={{ required: 'Sales person is required' }}
            render={({ field }) => (
              <Select
                {...field}
                label="Sales Person"
                placeholder="Select sales person"
                errorMessage={errors.sales_person?.message}
                isInvalid={!!errors.sales_person}
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
        <Input
          {...register('po_number', { required: 'PO Number is required' })}
          label="PO Number"
          placeholder="Enter PO number"
          errorMessage={errors.po_number?.message}
          isInvalid={!!errors.po_number}
        />
        <Input
          {...register('po_date', { required: 'PO Date is required' })}
          type="date"
          label="PO Date"
          errorMessage={errors.po_date?.message}
          isInvalid={!!errors.po_date}
        />
        <Controller
          name="service_options"
          control={control}
          rules={{ required: 'Service options is required' }}
          render={({ field }) => (
            <Select
              {...field}
              label="Service Options"
              placeholder="Select service options"
              errorMessage={errors.service_options?.message}
              isInvalid={!!errors.service_options}
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
            {...register('urgent_reason', { required: 'Urgent reason is required' })}
            label="Urgent Reason"
            placeholder="Enter urgent reason"
            errorMessage={errors.urgent_reason?.message}
            isInvalid={!!errors.urgent_reason}
          />
        )}


        <Input
          {...register('due_date', {
            required: 'Due date is required',
            validate: (value: string) => {
              return value >= today || 'Due date cannot be earlier than today'
            }
          })}
          type="date"
          label="Expected Ship Date"
          min={today}
          errorMessage={errors.due_date?.message}
          isInvalid={!!errors.due_date}
        />

        <Controller
          name="customs_purpose"
          control={control}
          rules={{ required: 'Customs purpose is required' }}
          render={({ field }) => (
            <Select
              {...field}
              label="Customs Purpose"
              placeholder="Select customs purpose"
              errorMessage={errors.customs_purpose?.message}
              isInvalid={!!errors.customs_purpose}
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
        <Controller
          name="customs_terms_of_trade"
          control={control}
          rules={{ required: 'Terms of trade is required' }}
          render={({ field }) => (
            <Select
              {...field}
              label="Incoterms"
              placeholder="Select Incoterms"
              errorMessage={errors.customs_terms_of_trade?.message}
              isInvalid={!!errors.customs_terms_of_trade}
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


        <Textarea
          {...register('remark', { required: 'Remark is required' })}
          label="Remark"
          placeholder="Enter remark"
          errorMessage={errors.remark?.message}
          isInvalid={!!errors.remark}
          className="hidden" 
        />
      </CardBody>
    </Card>
  )
}

export default BasicInformation