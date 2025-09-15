import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@heroui/react'
import { Icon } from '@iconify/react'
import RateCalculatorForm from './components/RateCalculatorForm'
import RateResults from './components/RateResults'
import { useRateCalculator } from './hooks/useRateCalculator'
import type { RateCalculatorFormData } from './types'

const RateCalculator = () => {
  const { isLoading, rates, error, calculationId, calculateRates, clearResults } = useRateCalculator()
  const [hasSearched, setHasSearched] = useState(false)

  const handleFormSubmit = async (formData: RateCalculatorFormData) => {
    setHasSearched(true)
    await calculateRates(formData)
  }

  const handleClearResults = () => {
    clearResults()
    setHasSearched(false)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon icon="solar:calculator-bold" className="text-primary" width={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shipping Rate Calculator</h1>
              <p className="text-default-600">
                Compare shipping rates from multiple carriers and find the best option for your shipment
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Rate Calculator Form */}
      <RateCalculatorForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      {/* Rate Results */}
      {(hasSearched || rates.length > 0) && (
        <RateResults
          rates={rates}
          calculationId={calculationId}
          isLoading={isLoading}
          error={error}
          onClear={handleClearResults}
        />
      )}

      {/* API Information */}
      <Card className="bg-default-50">
        <CardBody>
          <div className="flex items-start gap-3">
            <Icon icon="solar:info-circle-bold" className="text-primary flex-shrink-0 mt-1" width={20} />
            <div className="space-y-2">
              <h3 className="font-semibold text-default-800">API Information</h3>
              <p className="text-sm text-default-600">
                This rate calculator uses the AfterShip Postmen API to fetch real-time shipping rates from multiple carriers.
                The API endpoint used is: <code className="text-tiny bg-default-100 px-1 rounded">https://api.aftership.com/postmen/v3/rates</code>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default RateCalculator