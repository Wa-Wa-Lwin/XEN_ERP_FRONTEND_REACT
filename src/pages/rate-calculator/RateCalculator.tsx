import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Divider } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { Icon } from '@iconify/react'
import { useRateCalculator } from './hooks/useRateCalculator'
import { AddressForm } from './components/AddressForm'
import { ParcelsForm } from './components/ParcelsForm'
import { RatesTable } from './components/RatesTable'
import { ErrorModal } from './components/ErrorModal'
import type { RateCalculatorFormData } from './types/rate-calculator.types'

const DEFAULT_FORM_VALUES: RateCalculatorFormData = {
  // Ship From Address
  ship_from_country: 'THA',
  ship_from_contact_name: 'Ms. Sasipimol',
  ship_from_phone: '+66896345885',
  ship_from_email: 'sasipimol@xenoptics.com',
  ship_from_company_name: 'XENOptics Limited',
  ship_from_street1: '195 Moo.3 Bypass Chiangmai-Hangdong Rd.',
  ship_from_street2: 'T. Namphrae, A. Hangdong',
  ship_from_city: 'Hang Dong',
  ship_from_state: 'Chiang Mai',
  ship_from_postal_code: '50230',

  // Ship To Address (empty by default)
  ship_to_country: '',
  ship_to_contact_name: '',
  ship_to_phone: '',
  ship_to_email: '',
  ship_to_company_name: '',
  ship_to_street1: '',
  ship_to_street2: '',
  ship_to_city: '',
  ship_to_state: '',
  ship_to_postal_code: '',

  // Parcels
  parcels: [{
    width: 0,
    height: 0,
    depth: 0,
    dimension_unit: 'cm',
    weight_value: 0,
    weight_unit: 'kg',
    description: '',
    parcel_items: [{
      description: '',
      quantity: 1,
      price_currency: 'THB',
      price_amount: 0,
      item_id: '',
      origin_country: '',
      weight_unit: 'kg',
      weight_value: 0,
      sku: '',
      hs_code: ''
    }]
  }]
}

const RateCalculator = () => {
  const [calculatedRates, setCalculatedRates] = useState<any[]>([])

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<RateCalculatorFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { calculateRates, isCalculating, errorModal, setErrorModal } = useRateCalculator()

  const onCalculateRates = async (data: RateCalculatorFormData) => {
    try {
      const rates = await calculateRates(data)
      setCalculatedRates(rates)
    } catch (error) {
      console.error('Failed to calculate rates:', error)
    }
  }

  const handleClearRates = () => {
    setCalculatedRates([])
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rate Calculator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Calculate shipping rates by entering your shipment details
          </p>
        </div>
        <Icon icon="majesticons:calculator" width={32} className="text-primary" />
      </div>

      <form onSubmit={handleSubmit(onCalculateRates)} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:location-linear" width={20} />
                Ship From Address
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <AddressForm
                register={register}
                control={control}
                errors={errors}
                prefix="ship_from"
                watch={watch}
                setValue={setValue}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:location-linear" width={20} />
                Ship To Address
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <AddressForm
                register={register}
                control={control}
                errors={errors}
                prefix="ship_to"
                watch={watch}
                setValue={setValue}
              />
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:box-linear" width={20} />
              Parcels Information
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ParcelsForm
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
            />
          </CardBody>
        </Card>

        <div className="flex justify-center gap-4">
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isCalculating}
            startContent={!isCalculating && <Icon icon="solar:calculator-linear" width={20} />}
            className="min-w-40"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Rates'}
          </Button>

          {calculatedRates.length > 0 && (
            <Button
              type="button"
              variant="bordered"
              size="lg"
              onPress={handleClearRates}
              startContent={<Icon icon="solar:trash-bin-minimalistic-linear" width={20} />}
            >
              Clear Results
            </Button>
          )}
        </div>
      </form>

      {calculatedRates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:list-check-linear" width={20} />
              Available Shipping Rates ({calculatedRates.length})
            </h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <RatesTable rates={calculatedRates} />
          </CardBody>
        </Card>
      )}

      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '', details: [] })}
      />
    </div>
  )
}

export default RateCalculator