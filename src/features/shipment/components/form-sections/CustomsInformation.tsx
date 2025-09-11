import { Card, CardHeader, CardBody, Input } from '@heroui/react'
import type { FormSectionProps } from '../../types/shipment-form.types'

const CustomsInformation = ({ register, errors }: FormSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Customs Information</h2>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('customs_purpose', { required: 'Customs purpose is required' })}
          label="Customs Purpose"
          placeholder="Enter customs purpose"
          errorMessage={errors.customs_purpose?.message}
          isInvalid={!!errors.customs_purpose}
        />
        <Input
          {...register('customs_terms_of_trade', { required: 'Terms of trade is required' })}
          label="Terms of Trade"
          placeholder="Enter terms of trade"
          errorMessage={errors.customs_terms_of_trade?.message}
          isInvalid={!!errors.customs_terms_of_trade}
        />
      </CardBody>
    </Card>
  )
}

export default CustomsInformation