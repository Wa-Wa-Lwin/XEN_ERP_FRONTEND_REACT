import { Card, CardHeader, CardBody, Input, Select, SelectItem, Textarea } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { COUNTRIES } from '@constants/countries'

interface AddressSectionProps extends FormSectionProps {
  title: string
  prefix: 'ship_from' | 'ship_to'
}

const AddressSection = ({ register, errors, control, title, prefix }: AddressSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          {...register(`${prefix}_company_name`, { required: 'Company name is required' })}
          label="Company Name"
          placeholder="Enter company name"
          errorMessage={errors[`${prefix}_company_name`]?.message}
          isInvalid={!!errors[`${prefix}_company_name`]}
        />
        <Input
          {...register(`${prefix}_contact_name`, { required: 'Contact name is required' })}
          label="Contact Name"
          placeholder="Enter contact name"
          errorMessage={errors[`${prefix}_contact_name`]?.message}
          isInvalid={!!errors[`${prefix}_contact_name`]}
        />

        <Input
          {...register(`${prefix}_phone`, { required: 'Phone is required' })}
          label="Phone"
          placeholder="Enter phone"
          errorMessage={errors[`${prefix}_phone`]?.message}
          isInvalid={!!errors[`${prefix}_phone`]}
        />

        <Input
          {...register(`${prefix}_email`, { required: 'Email is required' })}
          type="email"
          label="Email"
          placeholder="Enter email"
          errorMessage={errors[`${prefix}_email`]?.message}
          isInvalid={!!errors[`${prefix}_email`]}
        />
        <Select
          {...register(`${prefix}_country`, { required: 'Country is required' })}
          label="Country"
          placeholder="Select Country"
          errorMessage={errors[`${prefix}_country`]?.message}
          isInvalid={!!errors[`${prefix}_country`]}
        >
          {COUNTRIES.map((option) => (
            <SelectItem key={option.key} value={option.value}>
              {option.value}
            </SelectItem>
          ))}
        </Select>
        <Input
          {...register(`${prefix}_city`, { required: 'City is required' })}
          label="City"
          placeholder="Enter city"
          errorMessage={errors[`${prefix}_city`]?.message}
          isInvalid={!!errors[`${prefix}_city`]}
        />

        <Input
          {...register(`${prefix}_state`, { required: 'State is required' })}
          label="State"
          placeholder="Enter state"
          errorMessage={errors[`${prefix}_state`]?.message}
          isInvalid={!!errors[`${prefix}_state`]}
        />

        <Input
          {...register(`${prefix}_postal_code`, { required: 'Postal code is required' })}
          label="Postal Code"
          placeholder="Enter postal code"
          errorMessage={errors[`${prefix}_postal_code`]?.message}
          isInvalid={!!errors[`${prefix}_postal_code`]}
        />

        <Textarea
          {...register(`${prefix}_street1`, { required: 'Street 1 is required' })}
          label="Street 1"
          placeholder="Enter street line 1"
          errorMessage={errors[`${prefix}_street1`]?.message}
          isInvalid={!!errors[`${prefix}_street1`]}
        />

        <Textarea
          {...register(`${prefix}_street2`, { required: 'Street 2 is required' })}
          label="Street 2"
          placeholder="Enter street line 2"
          errorMessage={errors[`${prefix}_street2`]?.message}
          isInvalid={!!errors[`${prefix}_street2`]}
        />
        <Input
          {...register(`${prefix}_tax_id`, { required: 'Tax ID is required' })}
          label="Tax ID"
          placeholder="Enter tax ID"
          errorMessage={errors[`${prefix}_tax_id`]?.message}
          isInvalid={!!errors[`${prefix}_tax_id`]}
        />
      </CardBody>
    </Card>
  )
}

export default AddressSection
