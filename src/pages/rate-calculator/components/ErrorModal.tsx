import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider
} from '@heroui/react'
import { Icon } from '@iconify/react'
import type { ErrorDetail } from '../types/rate-calculator.types'

interface ErrorModalProps {
  isOpen: boolean
  title: string
  message?: string
  details?: ErrorDetail[]
  onClose: () => void
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title,
  message,
  details,
  onClose
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="solar:info-circle-linear" width={24} className="text-danger" />
          {title}
        </ModalHeader>
        <Divider />
        <ModalBody className="py-4">
          {message && (
            <div className="mb-4">
              <p className="text-sm text-default-700">{message}</p>
            </div>
          )}

          {details && details.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-danger">Validation Errors:</h4>
              <div className="space-y-2">
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="bg-danger-50 border border-danger-200 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        icon="solar:close-circle-linear"
                        width={16}
                        className="text-danger mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-danger-800">
                          {detail.path}
                        </p>
                        <p className="text-sm text-danger-600 mt-1">
                          {detail.info}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon
                icon="solar:lightbulb-linear"
                width={16}
                className="text-warning-600 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm text-warning-800">
                  <strong>Tip:</strong> Please review and correct the highlighted fields above, then try calculating rates again.
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            variant="light"
            onPress={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}