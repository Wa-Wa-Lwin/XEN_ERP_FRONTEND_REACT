import React from 'react'
import { Input, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { countries } from '@utils/countries'

interface AddressFormProps {
  register: any
  control: any
  errors: any
  prefix: 'ship_from' | 'ship_to'
  watch?: any
  setValue?: any
}

export const AddressForm: React.FC<AddressFormProps> = ({
  register,
  control,
  errors,
  prefix
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Company Name"
        placeholder="Enter company name"
        isInvalid={!!errors[`${prefix}_company_name`]}
        errorMessage={errors[`${prefix}_company_name`]?.message}
        {...register(`${prefix}_company_name`, {
          required: 'Company name is required'
        })}
      />

      <Input
        label="Contact Name"
        placeholder="Enter contact name"
        isInvalid={!!errors[`${prefix}_contact_name`]}
        errorMessage={errors[`${prefix}_contact_name`]?.message}
        {...register(`${prefix}_contact_name`, {
          required: 'Contact name is required'
        })}
      />

      <Input
        label="Street Address"
        placeholder="Enter street address"
        isInvalid={!!errors[`${prefix}_street1`]}
        errorMessage={errors[`${prefix}_street1`]?.message}
        {...register(`${prefix}_street1`, {
          required: 'Street address is required'
        })}
      />

      <Input
        label="Street Address 2"
        placeholder="Apartment, suite, etc. (optional)"
        {...register(`${prefix}_street2`)}
      />

      <Input
        label="City"
        placeholder="Enter city"
        isInvalid={!!errors[`${prefix}_city`]}
        errorMessage={errors[`${prefix}_city`]?.message}
        {...register(`${prefix}_city`, {
          required: 'City is required'
        })}
      />

      <Input
        label="State/Province"
        placeholder="Enter state or province"
        isInvalid={!!errors[`${prefix}_state`]}
        errorMessage={errors[`${prefix}_state`]?.message}
        {...register(`${prefix}_state`, {
          required: 'State/Province is required'
        })}
      />

      <Input
        label="Postal Code"
        placeholder="Enter postal code"
        isInvalid={!!errors[`${prefix}_postal_code`]}
        errorMessage={errors[`${prefix}_postal_code`]?.message}
        {...register(`${prefix}_postal_code`, {
          required: 'Postal code is required'
        })}
      />

      <Controller
        name={`${prefix}_country`}
        control={control}
        rules={{ required: 'Country is required' }}
        render={({ field }) => (
          <Select
            label="Country"
            placeholder="Select country"
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string
              field.onChange(selectedKey)
            }}
            isInvalid={!!errors[`${prefix}_country`]}
            errorMessage={errors[`${prefix}_country`]?.message}
          >
            {countries.map((country: { code: string; name: string }) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      <Input
        label="Phone"
        placeholder="Enter phone number"
        isInvalid={!!errors[`${prefix}_phone`]}
        errorMessage={errors[`${prefix}_phone`]?.message}
        {...register(`${prefix}_phone`, {
          required: 'Phone number is required'
        })}
      />

      <Input
        label="Email"
        type="email"
        placeholder="Enter email address"
        isInvalid={!!errors[`${prefix}_email`]}
        errorMessage={errors[`${prefix}_email`]?.message}
        {...register(`${prefix}_email`, {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
      />
    </div>
  )
}