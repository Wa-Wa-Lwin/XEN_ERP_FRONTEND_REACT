import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { Icon } from '@iconify/react'

interface ErrorDetail {
  path: string
  info: string
}

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  details?: ErrorDetail[]
}

const ErrorModal = ({ isOpen, onClose, title, message, details }: ErrorModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[80vh]",
        body: "p-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon icon="solar:danger-circle-bold" className="text-red-500 text-2xl" />
          <div>
            <h2 className="text-xl font-semibold text-red-600">{title}</h2>
            <p className="text-sm text-gray-600">Please review and fix the following issues</p>
          </div>
        </ModalHeader>

        <ModalBody>
          {message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{message}</p>
            </div>
          )}

          {details && details.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Validation Errors:</h3>
              {details.map((detail, index) => (
                <div key={index} className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-start">
                    <Icon icon="solar:close-circle-bold" className="text-red-400 text-lg mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800 mb-1">
                        Field: <code className="bg-red-100 px-2 py-1 rounded text-sm">{detail.path}</code>
                      </p>
                      <p className="text-red-700">{detail.info}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Icon icon="solar:info-circle-bold" className="text-blue-500 text-lg mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Common Solutions:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Check that all required fields are filled out</li>
                  <li>• Verify Parcel weight values are greater than the sum of item weights</li>
                  <li>• Ensure dimensions and weights are positive numbers</li>
                  <li>• Make sure all addresses have complete information</li>
                </ul>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="primary"
            onPress={onClose}
            startContent={<Icon icon="solar:check-circle-bold" />}
          >
            I'll Fix These Issues
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ErrorModal