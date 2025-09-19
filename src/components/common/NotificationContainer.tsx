import React from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useNotification } from '@context/NotificationContext'
import type { NotificationType } from '@context/NotificationContext'

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotification()

  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: 'solar:check-circle-bold',
          bgColor: 'bg-green-50',
          borderColor: 'border-l-green-500',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        }
      case 'error':
        return {
          icon: 'solar:close-circle-bold',
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        }
      case 'warning':
        return {
          icon: 'solar:danger-triangle-bold',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-l-yellow-500',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        }
      case 'info':
        return {
          icon: 'solar:info-circle-bold',
          bgColor: 'bg-blue-50',
          borderColor: 'border-l-blue-500',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        }
      default:
        return {
          icon: 'solar:info-circle-bold',
          bgColor: 'bg-gray-50',
          borderColor: 'border-l-gray-500',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        }
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => {
        const config = getNotificationConfig(notification.type)

        return (
          <Card
            key={notification.id}
            className={`${config.bgColor} ${config.borderColor} border-l-4 shadow-lg animate-in slide-in-from-right duration-300`}
            shadow="sm"
          >
            <CardBody className="p-4">
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
                  <Icon icon={config.icon} className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {notification.title && (
                    <h4 className={`text-sm font-medium ${config.titleColor} mb-1`}>
                      {notification.title}
                    </h4>
                  )}
                  <p className={`text-sm ${config.messageColor} whitespace-pre-line`}>
                    {notification.message}
                  </p>

                  {/* Action Button */}
                  {notification.action && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="flat"
                        color={notification.type === 'error' ? 'danger' : 'primary'}
                        onPress={notification.action.onClick}
                      >
                        {notification.action.label}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => hideNotification(notification.id)}
                  className={`${config.iconColor} hover:opacity-70 flex-shrink-0 transition-opacity`}
                >
                  <Icon icon="solar:close-square-bold" className="w-4 h-4" />
                </button>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}

export default NotificationContainer