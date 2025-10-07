import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Button,
  Divider
} from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import type { AddressData } from './types'


const AddressListDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [address, setAddress] = useState<AddressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAddressDetail = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_NEW_ADDRESS_LIST_GET_ONE}/${id}`)
        if (response.data?.status === 'success' && response.data?.address) {
          setAddress(response.data.address)
        }
      } catch (error) {
        console.error('Failed to fetch address details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchAddressDetail()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" label="Loading address details..." />
      </div>
    )
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Icon icon="solar:sad-circle-bold" className="text-6xl text-danger" />
        <h2 className="text-2xl font-bold">Address Not Found</h2>
        <Button color="primary" onPress={() => navigate('/local/address-list')}>
          Back to Address List
        </Button>
      </div>
    )
  }

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <div className="text-sm font-semibold text-default-600">{label}</div>
      <div className="col-span-2 text-sm">{value || '-'}</div>
    </div>
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/local/address-list')}
        >
          <Icon icon="solar:arrow-left-bold" className="text-xl" />
        </Button>
        <h1 className="text-2xl font-bold">Address Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{address.company_name}</h2>
              <p className="text-sm text-default-600">Code: {address.CardCode || 'N/A'}</p>
            </div>
            <div className="flex gap-2">
              <Chip
                size="sm"
                variant="flat"
                color={address.CardType === 'S' ? 'primary' : 'secondary'}
              >
                Type: {address.CardType}
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                color={address.active === '1' ? 'success' : 'danger'}
              >
                {address.active === '1' ? 'Active' : 'Inactive'}
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold mb-3">Address Information</h3>
              <InfoRow label="Full Address" value={address.full_address} />
              <InfoRow label="Street 1" value={address.street1} />
              <InfoRow label="Street 2" value={address.street2} />
              <InfoRow label="Street 3" value={address.street3} />
              <InfoRow label="City" value={address.city} />
              <InfoRow label="State/Province" value={address.state} />
              <InfoRow label="Country" value={address.country} />
              <InfoRow label="Postal Code" value={address.postal_code} />
            </div>
          </CardBody>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-default-500 mb-1">Contact Name</p>
                <p className="font-medium">{address.contact_name || '-'}</p>
              </div>

              {address.contact && (
                <div>
                  <p className="text-xs text-default-500 mb-1">Contact</p>
                  <p className="font-medium">{address.contact}</p>
                </div>
              )}

              {address.phone && (
                <div>
                  <p className="text-xs text-default-500 mb-1">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Icon icon="solar:phone-bold" />
                    {address.phone}
                  </p>
                </div>
              )}

              {address.phone1 && (
                <div>
                  <p className="text-xs text-default-500 mb-1">Phone 1</p>
                  <p className="font-medium flex items-center gap-2">
                    <Icon icon="solar:phone-bold" />
                    {address.phone1}
                  </p>
                </div>
              )}

              {address.email && (
                <div>
                  <p className="text-xs text-default-500 mb-1">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Icon icon="solar:letter-bold" />
                    {address.email}
                  </p>
                </div>
              )}

              {address.website && (
                <div>
                  <p className="text-xs text-default-500 mb-1">Website</p>
                  <p className="font-medium flex items-center gap-2">
                    <Icon icon="solar:globe-bold" />
                    <a href={address.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {address.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Additional Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold">Additional Information</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-1">
              <InfoRow label="Tax ID" value={address.tax_id} />
              <InfoRow label="EORI Number" value={address.eori_number} />
            </div>
          </CardBody>
        </Card>

        {/* Audit Information Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Audit Information</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-default-500 mb-1">Created By</p>
                <p className="font-medium">{address.created_user_name || '-'}</p>
                <p className="text-xs text-default-400">
                  {address.created_time ? new Date(address.created_time).toLocaleString() : '-'}
                </p>
              </div>

              <Divider />

              <div>
                <p className="text-xs text-default-500 mb-1">Last Updated By</p>
                <p className="font-medium">{address.updated_user_name || '-'}</p>
                <p className="text-xs text-default-400">
                  {address.updated_time ? new Date(address.updated_time).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          color="primary"
          onPress={() => navigate('/local/address-list')}
        >
          Back to List
        </Button>
      </div>
    </div>
  )
}

export default AddressListDetail
