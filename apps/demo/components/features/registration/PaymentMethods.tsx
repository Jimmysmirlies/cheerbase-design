import Link from 'next/link'
import { MailIcon, CreditCardIcon, ArrowLeftRightIcon } from 'lucide-react'
import { Button } from '@workspace/ui/shadcn/button'
import { Card, CardHeader, CardContent } from '@workspace/ui/shadcn/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/shadcn/dialog'

export type PaymentMethod = {
  id: string
  type: string
  icon: typeof MailIcon
  instructions: string[]
  action?: {
    label: string
    href: string
  }
}

// Mock payment methods - in production, these would come from the event organizer settings
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cheque',
    type: 'Mail-in Cheque',
    icon: MailIcon,
    instructions: [
      'Make cheque payable to: 506 Elite Allstars',
      'Include invoice number on the memo line',
      'Mail to: 669 Babin St, Dieppe, NB E1A5M7, Canada',
    ],
  },
  {
    id: 'stripe',
    type: 'Pay Online',
    icon: CreditCardIcon,
    instructions: [
      'Click "Pay Now" below to pay securely with credit or debit card',
      'You will be redirected to our secure payment portal',
    ],
    action: {
      label: 'Pay Now',
      href: '#', // Would link to Stripe payment page
    },
  },
  {
    id: 'etransfer',
    type: 'E-Transfer',
    icon: ArrowLeftRightIcon,
    instructions: [
      'Send e-transfer to: payments@506eliteallstars.com',
      'In the message field, include: Invoice number and team name',
      'Security question answer will be sent to your email',
    ],
  },
]

type PaymentMethodsCardProps = {
  methods?: PaymentMethod[]
  title?: string
  description?: string
}

export function PaymentMethodsCard({
  methods = DEFAULT_PAYMENT_METHODS,
  title = 'Payment Methods',
  description = 'Choose your preferred payment method below',
}: PaymentMethodsCardProps) {
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b border-border/60 p-6">
        <h2 className="heading-3">{title}</h2>
        <p className="body-small text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 !p-6">
        {methods.map(method => {
          const Icon = method.icon
          return (
            <div key={method.id} className="rounded-md border border-border/70 bg-card/60 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="size-4 text-primary" />
                </div>
                <h3 className="heading-4">{method.type}</h3>
              </div>
              <ul className="ml-9 space-y-2">
                {method.instructions.map((instruction, index) => (
                  <li key={index} className="body-small text-muted-foreground">
                    • {instruction}
                  </li>
                ))}
              </ul>
              {method.action && (
                <div className="ml-9 mt-4">
                  <Button asChild size="sm">
                    <Link href={method.action.href}>{method.action.label}</Link>
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

type PaymentMethodsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  methods?: PaymentMethod[]
}

export function PaymentMethodsDialog({
  open,
  onOpenChange,
  methods = DEFAULT_PAYMENT_METHODS,
}: PaymentMethodsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-md sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="heading-3">Payment Methods</DialogTitle>
          <DialogDescription className="body-small text-muted-foreground">
            Choose your preferred payment method below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {methods.map(method => {
            const Icon = method.icon
            return (
              <div key={method.id} className="rounded-md border border-border/70 bg-card/60 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <h3 className="heading-4">{method.type}</h3>
                </div>
                <ul className="ml-9 space-y-2">
                  {method.instructions.map((instruction, index) => (
                    <li key={index} className="body-small text-muted-foreground">
                      • {instruction}
                    </li>
                  ))}
                </ul>
                {method.action && (
                  <div className="ml-9 mt-4">
                    <Button asChild size="sm">
                      <Link href={method.action.href}>{method.action.label}</Link>
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
