import React from 'react'
import { Input, Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { countries } from '@utils/countries'

interface AddressFormProps {
  control: any
  errors: any
  prefix: 'ship_from' | 'ship_to'
}

export const AddressForm: React.FC<AddressFormProps> = ({
  control,
  errors,
  prefix
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Controller
        name={`${prefix}_company_name`}
        control={control}
        rules={{ required: 'Company name is required' }}
        render={({ field }) => (
          <Input
            label="Company Name"
            placeholder="Enter company name"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_company_name`]}
            errorMessage={errors[`${prefix}_company_name`]?.message}
          />
        )}
      />

      <Controller
        name={`${prefix}_contact_name`}
        control={control}
        rules={{ required: 'Contact name is required' }}
        render={({ field }) => (
          <Input
            label="Contact Name"
            placeholder="Enter contact name"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_contact_name`]}
            errorMessage={errors[`${prefix}_contact_name`]?.message}
          />
        )}
      />

      <Controller
        name={`${prefix}_street1`}
        control={control}
        rules={{ required: 'Street address is required' }}
        render={({ field }) => (
          <Input
            label="Street Address"
            placeholder="Enter street address"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_street1`]}
            errorMessage={errors[`${prefix}_street1`]?.message}
          />
        )}
      />

      <Controller
        name={`${prefix}_street2`}
        control={control}
        render={({ field }) => (
          <Input
            label="Street Address 2"
            placeholder="Apartment, suite, etc. (optional)"
            value={field.value || ''}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name={`${prefix}_city`}
        control={control}
        rules={{ required: 'City is required' }}
        render={({ field }) => (
          <Input
            label="City"
            placeholder="Enter city"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_city`]}
            errorMessage={errors[`${prefix}_city`]?.message}
          />
        )}
      />

      <Controller
        name={`${prefix}_state`}
        control={control}
        rules={{ required: 'State/Province is required' }}
        render={({ field }) => (
          <Input
            label="State/Province"
            placeholder="Enter state or province"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_state`]}
            errorMessage={errors[`${prefix}_state`]?.message}
          />
        )}
      />

      <Controller
        name={`${prefix}_postal_code`}
        control={control}
        rules={{ required: 'Postal code is required' }}
        render={({ field }) => (
          <Input
            label="Postal Code"
            placeholder="Enter postal code"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_postal_code`]}
            errorMessage={errors[`${prefix}_postal_code`]?.message}
          />
        )}
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

      <Controller
        name={`${prefix}_phone`}
        control={control}
        rules={{ required: 'Phone number is required' }}
        render={({ field }) => (
          <Input
            label="Phone"
            placeholder="Enter phone number"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_phone`]}
            errorMessage={errors[`${prefix}_phone`]?.message}
          />
        )}
      />

      <Controller
        name={`${prefix}_email`}
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        }}
        render={({ field }) => (
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={field.value || ''}
            onChange={field.onChange}
            isInvalid={!!errors[`${prefix}_email`]}
            errorMessage={errors[`${prefix}_email`]?.message}
          />
        )}
      />
    </div>
  )
}