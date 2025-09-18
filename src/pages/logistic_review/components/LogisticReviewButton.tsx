import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

interface LogisticReviewButtonProps {
  shipmentId: number
  requestStatus: string
  className?: string
}

const LogisticReviewButton = ({ shipmentId, requestStatus, className }: LogisticReviewButtonProps) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Check if user has logistic access
  const hasLogisticAccess = user?.role === 'logistic' || user?.role === 'admin'

  // Only show button for shipments under review and if user has logistic access
  const shouldShowButton = hasLogisticAccess && requestStatus === 'under_review'

  const handleClick = () => {
    navigate(`/shipment/logistic-review/${shipmentId}`)
  }

  if (!shouldShowButton) {
    return null
  }

  return (
    <Button
      size="sm"
      color="primary"
      variant="flat"
      onPress={handleClick}
      startContent={<Icon icon="solar:document-edit-bold" />}
      className={className}
    >
      Update
    </Button>
  )
}

export default LogisticReviewButton