import { useState } from 'react'
import { Card, CardHeader, CardBody, Input } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

const InsuranceInformation = ({ register, errors }: FormSectionProps) => {
  const [insuranceEnabled, setInsuranceEnabled] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-semibold">Insurance Information</h2>
          <label className="flex items-center gap-2">
            <input
              {...register('insurance_enabled')}
              type="checkbox"
              className="rounded"
              onChange={(e) => setInsuranceEnabled(e.target.checked)}
            />
            <span>Insurance Required</span>
          </label>
        </div>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {insuranceEnabled && (
          <>
            <Input
              {...register('insurance_insured_value_amount', {
                required: insuranceEnabled ? 'Insurance amount is required' : false,
                min: 0
              })}
              type="number"
              step="0.01"
              label="Insured Value Amount"
              placeholder="Enter amount"
              errorMessage={errors.insurance_insured_value_amount?.message}
              isInvalid={!!errors.insurance_insured_value_amount}
            />
            <Input
              {...register('insurance_insured_value_currency', { required: insuranceEnabled ? 'Currency is required' : false })}
              label="Currency"
              placeholder="USD"
              defaultValue="USD"
              errorMessage={errors.insurance_insured_value_currency?.message}
              isInvalid={!!errors.insurance_insured_value_currency}
            />
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default InsuranceInformation